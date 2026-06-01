import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { inferSteps } from "@/lib/blog-progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

// Lists every post folder under the builder's output/ directory, with enough
// metadata to render a history list and preview any of them — independent of
// the in-memory job store (so it survives server restarts and shows posts
// whose job was marked "error" but actually produced a previewable draft).
export async function GET() {
  const builderPath = process.env.BLOG_BUILDER_PATH;
  if (!builderPath) {
    return Response.json(
      { error: "BLOG_BUILDER_PATH not configured" },
      { status: 500 },
    );
  }
  const outputDir = path.join(builderPath, "output");
  if (!existsSync(outputDir)) return Response.json({ posts: [] });

  let entries;
  try {
    entries = await readdir(outputDir, { withFileTypes: true });
  } catch {
    return Response.json({ posts: [] });
  }

  const folders = entries.filter(
    (e) => e.isDirectory() && !e.name.startsWith("_"),
  );

  const posts = await Promise.all(
    folders.map(async (e) => {
      const fdir = path.join(outputDir, e.name);
      let files = [];
      try {
        const inner = await readdir(fdir, { withFileTypes: true });
        files = inner.filter((f) => f.isFile()).map((f) => f.name);
      } catch {}

      const meta = await readJson(path.join(fdir, "metadata.json"));
      const run = await readJson(path.join(fdir, "_run.json"));
      const progress = inferSteps(files);
      const previewable = files.includes("post.html");

      let mtimeMs = 0;
      try {
        mtimeMs = (await stat(fdir)).mtimeMs;
      } catch {}

      return {
        folder: e.name,
        title: meta?.title || run?.keyword || e.name,
        keyword: meta?.keyword || run?.keyword || null,
        // Prefer the recorded run status; otherwise infer from artifacts.
        status: run?.status || (previewable ? "done" : "partial"),
        error: run?.error || null,
        reachedStep: run?.reachedStep ?? progress.reachedStep,
        reachedLabel: run?.reachedLabel ?? progress.reachedLabel,
        nextStep: run?.nextStep ?? progress.nextStep,
        nextLabel: run?.nextLabel ?? progress.nextLabel,
        complete: run?.complete ?? progress.complete,
        previewable,
        hasLog: files.includes("_run.log"),
        finishedAt: run?.finishedAt || null,
        mtimeMs,
        files,
      };
    }),
  );

  posts.sort((a, b) => (b.finishedAt || b.mtimeMs) - (a.finishedAt || a.mtimeMs));
  return Response.json({ posts });
}
