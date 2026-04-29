import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { getJob } from "@/lib/blog-job-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) {
    return Response.json({ error: "job not found" }, { status: 404 });
  }

  let files = [];
  if (job.folder && process.env.BLOG_BUILDER_PATH) {
    const folderPath = path.join(
      process.env.BLOG_BUILDER_PATH,
      "output",
      job.folder,
    );
    if (existsSync(folderPath)) {
      try {
        const entries = await readdir(folderPath, { withFileTypes: true });
        for (const e of entries) {
          if (e.isFile()) {
            files.push(e.name);
          } else if (e.isDirectory() && e.name === "images") {
            const imgs = await readdir(path.join(folderPath, "images"));
            files.push(...imgs.map((n) => `images/${n}`));
          }
        }
      } catch {}
    }
  }

  return Response.json({
    id: job.id,
    status: job.status,
    keyword: job.keyword,
    folder: job.folder,
    files,
    error: job.error,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
  });
}
