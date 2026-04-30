// Module-level job registry for blog-builder.
// Lives in the Next.js Node process — only safe under `next start` (single
// long-lived process), NOT serverless. Vercel deployments must NOT use this.

const store = (globalThis.__blogJobStore ??= {
  jobs: new Map(),
  activeId: null,
});

export function getActiveId() {
  return store.activeId;
}

export function setActiveId(id) {
  store.activeId = id;
}

export function getJob(id) {
  return store.jobs.get(id);
}

export function listJobs(limit = 20) {
  return [...store.jobs.values()]
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, limit)
    .map(({ subscribers, proc, ...rest }) => rest);
}

export function createJob(id, keyword) {
  const job = {
    id,
    keyword,
    status: "pending",
    log: [],
    subscribers: new Set(),
    startedAt: Date.now(),
    finishedAt: null,
    folder: null,
    error: null,
    proc: null,
  };
  store.jobs.set(id, job);
  return job;
}

export function broadcast(job, event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const bytes = new TextEncoder().encode(payload);
  for (const controller of job.subscribers) {
    try {
      controller.enqueue(bytes);
    } catch {
      // controller already closed
    }
  }
}

export function appendLog(job, text) {
  job.log.push(text);
  broadcast(job, "log", { text });
}

export function finishJob(job, patch) {
  Object.assign(job, patch, { finishedAt: Date.now() });
  broadcast(job, job.status === "done" ? "done" : "error", {
    status: job.status,
    folder: job.folder,
    error: job.error,
  });
  for (const controller of job.subscribers) {
    try {
      controller.close();
    } catch {}
  }
  job.subscribers.clear();
  if (store.activeId === job.id) store.activeId = null;
}
