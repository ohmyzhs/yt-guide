import { spawn } from "node:child_process";
import { readdir, stat, writeFile } from "node:fs/promises";
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
import { inferSteps, describeStop, STEP_FILES } from "@/lib/blog-progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Strict allowlist: letters (any script), digits, spaces, light punctuation.
// Rejects shell metachars (`"$\;|&<>` etc.) so `shell: true` on Windows is safe.
const KEYWORD_RE = /^[\p{L}\p{N}\s\-_().,!?]+$/u;
// Output folder names are `YYYY-MM-DD_keyword` (spaces stripped) — no slashes,
// no `..`. This guards the resume path against traversal.
const FOLDER_RE = /^[\p{L}\p{N}\-_().]+$/u;

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

async function listFiles(folderPath) {
  if (!existsSync(folderPath)) return [];
  try {
    const entries = await readdir(folderPath, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => e.name);
  } catch {
    return [];
  }
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

  const outputDir = path.join(builderPath, "output");

  // Optional resume: continue an interrupted post in an existing folder.
  let resumeFolder = null;
  if (body?.resumeFolder != null) {
    const rf = String(body.resumeFolder);
    if (
      !FOLDER_RE.test(rf) ||
      !existsSync(path.join(outputDir, rf)) ||
      !(await stat(path.join(outputDir, rf)).then((s) => s.isDirectory()).catch(() => false))
    ) {
      return Response.json(
        { error: `invalid or missing resume folder: ${rf}` },
        { status: 400 },
      );
    }
    resumeFolder = rf;
  }

  const id = randomUUID();
  const job = createJob(id, keyword);
  setActiveId(id);

  const before = await snapshotFolders(outputDir);

  const isWin = process.platform === "win32";
  const cliBin = process.env.CLAUDE_BIN || (isWin ? "claude.cmd" : "claude");
  const permissionMode =
    process.env.CLAUDE_PERMISSION_MODE || "bypassPermissions";

  // Prompt via stdin (not a CLI arg) — sidesteps Windows cmd quoting. For a
  // fresh run we trigger the /blog-new slash command. For a resume we send a
  // self-contained natural-language instruction instead: a line starting with
  // `[RESUME ...]` would NOT be parsed as a slash command, and stuffing the
  // marker into $ARGUMENTS would corrupt the keyword used in the pipeline's
  // shell steps — so resume drives the pipeline (documented in CLAUDE.md)
  // directly. Do NOT quote the keyword: `$ARGUMENTS` keeps quotes literally,
  // which breaks the Windows output folder name.
  const args = ["--permission-mode", permissionMode, "-p"];
  let prompt;
  if (resumeFolder) {
    // Name the *exact* missing deliverables. A vague "do the missing steps"
    // lets the agent latch onto something else (e.g. lengthening post.md) and
    // skip the genuinely-missing file — so we list them explicitly.
    const resumeFiles = await listFiles(path.join(outputDir, resumeFolder));
    const REQUIRED = [
      "post.html",
      "image-prompts.json",
      "metadata.json",
      "guide.md",
    ];
    const missing = REQUIRED.filter((f) => !resumeFiles.includes(f));
    prompt =
      `output/${resumeFolder} 폴더에서 중단된 "${keyword}" 블로그 글을 이어서 완성해줘. ` +
      `이미 일부 산출물이 있으니 누락된 것만 만들어 글을 완성하면 된다.\n` +
      `★ 반드시 새로 생성해야 할 누락 파일: ${missing.length ? missing.join(", ") : "(없음 — 품질·패키지만 재확인)"}.\n` +
      `규칙: (1) 새 폴더를 만들지 말고 output/${resumeFolder} 를 그대로 사용. ` +
      `(2) 이미 존재하는 완성 파일은 그대로 둔다 — 단 post.md가 공백 제외 3,500자 미만이면 3,500~4,000자로 보강해도 좋다. ` +
      `(3) image-prompts.json 이 누락이면, post.md의 각 [IMAGE:] 마커마다 영문 이미지 프롬프트(마커당 스타일 옵션 2~3개)를 작성해 image-prompts.json 으로 저장한다. 스키마는 .claude/commands/blog-new.md STEP 3 / CLAUDE.md 를 따른다. ` +
      `(4) metadata.json·guide.md 가 누락이면 STEP 5 패키지를 작성한다. ` +
      `(5) 위 누락 파일을 모두 만든 뒤 종료한다.`;
  } else {
    prompt = `/blog-new ${keyword}`;
  }

  appendLog(job, `$ ${cliBin} ${args.join(" ")}\n`);
  appendLog(job, `(stdin) ${prompt}\n`);
  appendLog(job, `(cwd: ${builderPath})\n`);
  if (resumeFolder) appendLog(job, `(resume: output/${resumeFolder})\n`);
  appendLog(job, `\n`);
  job.status = "running";
  if (resumeFolder) job.folder = resumeFolder;

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

  // ── Live progress: claude -p buffers all stdout until the very end, so we
  // can't infer the step from its output mid-run. Instead we watch the output
  // folder and announce each pipeline artifact as it lands. This is also how
  // the job learns its folder name early (so a mid-run failure still knows
  // where it stopped).
  let knownFolder = resumeFolder || null;
  const seen = new Set();
  if (resumeFolder) {
    const existing = await listFiles(path.join(outputDir, resumeFolder));
    for (const { file, label } of STEP_FILES) {
      if (existing.includes(file)) {
        seen.add(file);
        appendLog(job, `[재개] 기존 산출물 확인: ${label} (${file})\n`);
      }
    }
  }
  const poll = setInterval(async () => {
    try {
      if (!knownFolder) {
        knownFolder = await detectNewFolder(outputDir, before);
        if (knownFolder) {
          job.folder = knownFolder;
          appendLog(job, `[진행] 작업 폴더 생성됨: ${knownFolder}\n`);
        }
      }
      if (knownFolder) {
        const fdir = path.join(outputDir, knownFolder);
        for (const { file, label } of STEP_FILES) {
          if (!seen.has(file) && existsSync(path.join(fdir, file))) {
            seen.add(file);
            appendLog(job, `[진행] ${label} 완료 (${file})\n`);
          }
        }
      }
    } catch {}
  }, 3000);

  // Watchdog: `claude -p` occasionally finishes all on-disk work but then
  // stalls on its final turn (network read with no timeout), never emitting
  // `close`. Without this, the job — and the UI — hang on "생성 중" forever.
  const timeoutMs = Number(process.env.CLAUDE_JOB_TIMEOUT_MS) || 20 * 60 * 1000;
  let timedOut = false;
  const watchdog = setTimeout(() => {
    timedOut = true;
    appendLog(job, `\n[watchdog] no exit after ${timeoutMs}ms — killing claude.\n`);
    try {
      proc.kill();
    } catch {}
  }, timeoutMs);

  // Feed the prompt and close stdin so claude doesn't wait for more input.
  proc.stdin.write(prompt);
  proc.stdin.end();

  const onChunk = (buf) => appendLog(job, buf.toString("utf8"));
  proc.stdout.on("data", onChunk);
  proc.stderr.on("data", onChunk);

  const cleanup = () => {
    clearTimeout(watchdog);
    clearInterval(poll);
  };

  proc.on("error", (e) => {
    cleanup();
    finishJob(job, {
      status: "error",
      error: `Process error: ${e.message}`,
    });
  });

  proc.on("close", async (code) => {
    cleanup();
    const folderName =
      resumeFolder || knownFolder || (await detectNewFolder(outputDir, before));

    const files = folderName
      ? await listFiles(path.join(outputDir, folderName))
      : [];
    const progress = inferSteps(files);
    const previewable = files.includes("post.html");

    let status, error;
    if (previewable) {
      // A previewable post exists. Mark done; `complete` tells the UI whether
      // later steps (image prompts / packaging) still need a resume.
      status = "done";
      error = null;
    } else {
      status = "error";
      const exitInfo = timedOut
        ? `타임아웃(${Math.round(timeoutMs / 60000)}분) 초과로 강제 종료`
        : code === 0
          ? "claude는 정상 종료했지만 본문(post.html)이 생성되지 않음"
          : `claude 비정상 종료 (exit ${code})`;
      error = describeStop(progress, exitInfo);
    }

    // Persist a run record + full log into the folder so history/preview can
    // show what happened even after a server restart (the in-memory log is
    // otherwise lost).
    if (folderName) {
      const fdir = path.join(outputDir, folderName);
      const runMeta = {
        jobId: id,
        keyword,
        resumeOf: resumeFolder || null,
        status,
        error,
        reachedStep: progress.reachedStep,
        reachedLabel: progress.reachedLabel,
        nextStep: progress.nextStep,
        nextLabel: progress.nextLabel,
        complete: progress.complete,
        startedAt: job.startedAt,
        finishedAt: Date.now(),
      };
      try {
        await writeFile(
          path.join(fdir, "_run.json"),
          JSON.stringify(runMeta, null, 2),
          "utf8",
        );
        await writeFile(path.join(fdir, "_run.log"), job.log.join(""), "utf8");
      } catch {}
    }

    finishJob(job, {
      status,
      folder: folderName,
      error,
      steps: progress.steps,
      reachedStep: progress.reachedStep,
      reachedLabel: progress.reachedLabel,
      nextStep: progress.nextStep,
      complete: progress.complete,
    });
  });

  return Response.json({ jobId: id, keyword, resuming: Boolean(resumeFolder) });
}
