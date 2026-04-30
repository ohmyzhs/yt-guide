import { getJob } from "@/lib/blog-job-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) {
    return Response.json({ error: "job not found" }, { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // replay buffered log
      if (job.log.length) {
        const text = job.log.join("");
        controller.enqueue(
          encoder.encode(
            `event: log\ndata: ${JSON.stringify({ text })}\n\n`,
          ),
        );
      }

      // already finished — send terminal event and close
      if (job.status === "done" || job.status === "error") {
        const event = job.status === "done" ? "done" : "error";
        controller.enqueue(
          encoder.encode(
            `event: ${event}\ndata: ${JSON.stringify({
              status: job.status,
              folder: job.folder,
              error: job.error,
            })}\n\n`,
          ),
        );
        controller.close();
        return;
      }

      // still running — subscribe for live updates
      job.subscribers.add(controller);
    },
    cancel() {
      // browser disconnected — drop the controller
      for (const c of job.subscribers) {
        // controllers don't expose identity to compare; nothing to do here.
        // The set will be cleared on finishJob; orphaned controllers are no-op.
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
