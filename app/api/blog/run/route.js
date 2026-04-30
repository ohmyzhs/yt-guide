import { spawn } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  createJob,
  getActiveId,
  setActiveId,
  appendLog,
  finishJob,
} from "@/lib/blog-job-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Strict allowlist: letters (any script), digits, spaces, light punctuation.
// Rejects shell metachars (`"$\;|&<>` etc.) so `shell: true` on Windows is safe.
const KEYWORD_RE = /^[\p{L}\p{N}\s\-_().,!?]+$/u;

function sanitize(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length < 1 || trimmed.length > 80) return null;
  if (!KEYWORD_RE.test(trimmed)) return null;
  return trimmed;
}

async function snapshotFolders(dir) {
  if (!existsSync(dir)) return new Set();
  const entries = await readdir(dir, { withFileTypes: true });
  return new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name));
}

async function detectNewFolder(dir, before) {
  if (!existsSync(dir)) return null;
  const entries = await readdir(dir, { withFileTypes: true });
  const created = entries
    .filter((e) => e.isDirectory() && !before.has(e.name))
    .map((e) => e.name);
  if (created.length === 0) return null;
  const stats = await Promise.all(
    created.map(async (n) => ({
      n,
      mtime: (await stat(path.join(dir, n))).mtimeMs,
    })),
  );
  stats.sort((a, b) => b.mtime - a.mtime);
  return stats[0].n;
}

export async function POST(request) {
  const builderPath = process.env.BLOG_BUILDER_PATH;
  if (!builderPath) {
    return Response.json(
      { error: "BLOG_BUILDER_PATH is not configured on the server" },
      { status: 500 },
    );
  }
  if (!existsSync(builderPath)) {
    return Response.json(
      { error: `BLOG_BUILDER_PATH does not exist: ${builderPath}` },
      { status: 500 },
    );
  }

  if (getActiveId()) {
    return Response.json(
      {
        error: "A blog job is already running. Wait for it to finish.",
        activeId: getActiveId(),
      },
      { status: 409 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const keyword = sanitize(body?.keyword);
  if (!keyword) {
    return Response.json(
      {
        error:
          "invalid keyword (1-80 chars, letters/digits/spaces and basic punctuation only)",
      },
      { status: 400 },
    );
  }

  const id = randomUUID();
  const job = createJob(id, keyword);
  setActiveId(id);

  const outputDir = path.join(builderPath, "output");
  const before = await snapshotFolders(outputDir);

  const isWin = process.platform === "win32";
  const cliBin =
    process.env.CLAUDE_BIN || (isWin ? "claude.cmd" : "claude");
  const permissionMode =
    process.env.CLAUDE_PERMISSION_MODE || "bypassPermissions";

  // Windows cmd quoting: wrap the whole prompt in double quotes and escape
  // inner quotes by doubling them ("" inside "..."). This keeps the prompt
  // (including the keyword with its surrounding quotes) as a single -p arg
  // when shell:true on Windows. POSIX shells use \" escaping.
  const promptArg = isWin
    ? `"/blog-new ""${keyword}"""`
    : `/blog-new "${keyword}"`;

  const args = [
    "-p",
    promptArg,
    "--permission-mode",
    permissionMode,
  ];

  appendLog(
    job,
    `$ ${cliBin} ${args
      .map((a) => (a.includes(" ") ? `"${a}"` : a))
      .join(" ")}\n`,
  );
  appendLog(job, `(cwd: ${builderPath})\n\n`);
  job.status = "running";

  let proc;
  try {
    proc = spawn(cliBin, args, {
      cwd: builderPath,
      shell: isWin, // .cmd on Windows requires shell; sanitization above keeps it safe
      env: process.env,
    });
  } catch (e) {
    finishJob(job, {
      status: "error",
      error: `Failed to spawn claude CLI: ${e.message}. Check CLAUDE_BIN and PATH.`,
    });
    return Response.json({ jobId: id, status: "error" });
  }
  job.proc = proc;

  const onChunk = (buf) => appendLog(job, buf.toString("utf8"));
  proc.stdout.on("data", onChunk);
  proc.stderr.on("data", onChunk);

  proc.on("error", (e) => {
    finishJob(job, {
      status: "error",
      error: `Process error: ${e.message}`,
    });
  });

  proc.on("close", async (code) => {
    if (code === 0) {
      const folder = await detectNewFolder(outputDir, before);
      if (folder) {
        finishJob(job, { status: "done", folder });
      } else {
        finishJob(job, {
          status: "error",
          error: "Process exited 0 but no new folder appeared in output/.",
        });
      }
    } else {
      finishJob(job, {
        status: "error",
        error: `claude exited with code ${code}`,
      });
    }
  });

  return Response.json({ jobId: id, keyword });
}
