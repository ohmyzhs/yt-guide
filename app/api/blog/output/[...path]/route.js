import { readFile, stat, readdir } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".md": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

export async function GET(_request, { params }) {
  const builderPath = process.env.BLOG_BUILDER_PATH;
  if (!builderPath) {
    return Response.json(
      { error: "BLOG_BUILDER_PATH not configured" },
      { status: 500 },
    );
  }

  const { path: segments } = await params;
  const sub = (segments || []).map(decodeURIComponent).join("/");
  const base = path.join(builderPath, "output");
  const target = path.resolve(base, sub);

  // path traversal guard
  const baseResolved = path.resolve(base) + path.sep;
  if (target !== path.resolve(base) && !target.startsWith(baseResolved)) {
    return Response.json({ error: "bad path" }, { status: 400 });
  }

  let st;
  try {
    st = await stat(target);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  if (st.isDirectory()) {
    const entries = await readdir(target, { withFileTypes: true });
    return Response.json({
      path: sub,
      entries: entries.map((e) => ({
        name: e.name,
        dir: e.isDirectory(),
      })),
    });
  }

  const data = await readFile(target);
  const ext = path.extname(target).toLowerCase();
  return new Response(data, {
    headers: {
      "content-type": MIME[ext] || "application/octet-stream",
      "cache-control": "no-cache",
    },
  });
}
