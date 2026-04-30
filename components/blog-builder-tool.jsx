"use client";

import { useEffect, useRef, useState } from "react";

const STATUS_LABEL = {
  idle: "대기 중",
  running: "생성 중",
  done: "완료",
  error: "오류",
};

export function BlogBuilderTool() {
  const [keyword, setKeyword] = useState("");
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [log, setLog] = useState("");
  const [result, setResult] = useState(null);
  const [serverError, setServerError] = useState(null);
  const logRef = useRef(null);
  const esRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  useEffect(() => () => esRef.current?.close(), []);

  async function start(e) {
    e.preventDefault();
    if (!keyword.trim() || status === "running") return;
    setServerError(null);
    setLog("");
    setResult(null);
    setStatus("running");

    let res;
    try {
      res = await fetch("/api/blog/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
    } catch (err) {
      setStatus("error");
      setServerError(`요청 실패: ${err.message}`);
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("error");
      setServerError(data.error || `HTTP ${res.status}`);
      return;
    }

    setJobId(data.jobId);
    subscribe(data.jobId);
  }

  function subscribe(id) {
    esRef.current?.close();
    const es = new EventSource(`/api/blog/stream/${id}`);
    esRef.current = es;

    es.addEventListener("log", (ev) => {
      try {
        const { text } = JSON.parse(ev.data);
        setLog((prev) => prev + text);
      } catch {}
    });

    es.addEventListener("done", async (ev) => {
      es.close();
      setStatus("done");
      try {
        const r = await fetch(`/api/blog/result/${id}`);
        if (r.ok) setResult(await r.json());
      } catch {}
    });

    es.addEventListener("error", (ev) => {
      try {
        const data = JSON.parse(ev.data || "{}");
        if (data.error) setServerError(data.error);
      } catch {}
      es.close();
      setStatus("error");
    });
  }

  const isRunning = status === "running";
  const folder = result?.folder;
  const filesByKind = groupFiles(result?.files || []);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-7 shadow-[var(--shadow-lg)]">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">
          Blog Builder
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.05em] text-slate-900">
          키워드 한 줄로 블로그 글 한 편을 만듭니다.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          이 페이지는 로컬 PC의 <code className="font-mono text-xs">claude</code> CLI를
          호출해 <code className="font-mono text-xs">/blog-new</code> 파이프라인을
          실행합니다. 리서치 → 본문 작성 → 이미지 생성 → 품질 검증까지 모두
          자동으로 진행됩니다 (3~7분 소요).
        </p>

        <form onSubmit={start} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예: 병원 마케팅, AI 마케팅 트렌드, 상세페이지 제작 비용"
            disabled={isRunning}
            maxLength={80}
            className="flex-1 rounded-[1.2rem] border border-black/10 bg-white px-5 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isRunning || !keyword.trim()}
            className="rounded-[1.2rem] bg-[var(--accent)] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[var(--shadow-lg)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isRunning ? "생성 중..." : "글 만들기"}
          </button>
        </form>

        {serverError && (
          <div className="mt-4 rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}
      </section>

      {(jobId || log) && (
        <section className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">
              실행 로그
            </p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                status === "done"
                  ? "bg-emerald-100 text-emerald-700"
                  : status === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
              }`}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
          <pre
            ref={logRef}
            className="mt-4 max-h-80 overflow-auto rounded-[1.2rem] bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100"
          >
            {log || "(아직 출력 없음)"}
          </pre>
        </section>
      )}

      {status === "done" && folder && (
        <section className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">
            결과
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">
            {folder}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {filesByKind.images.length > 0 && (
              <div className="rounded-[1.35rem] border border-black/8 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  이미지
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {filesByKind.images.map((f) => (
                    <a
                      key={f}
                      href={`/api/blog/output/${encodeURIComponent(folder)}/${f
                        .split("/")
                        .map(encodeURIComponent)
                        .join("/")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-[0.8rem] border border-black/8"
                    >
                      <img
                        src={`/api/blog/output/${encodeURIComponent(folder)}/${f
                          .split("/")
                          .map(encodeURIComponent)
                          .join("/")}`}
                        alt={f}
                        className="aspect-square w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-[1.35rem] border border-black/8 bg-white/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                파일
              </p>
              <ul className="mt-3 space-y-1.5">
                {filesByKind.docs.map((f) => (
                  <li key={f}>
                    <a
                      href={`/api/blog/output/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-[var(--accent-strong)] hover:underline"
                    >
                      {f}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {filesByKind.docs.includes("post.html") && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                미리보기 (post.html)
              </p>
              <iframe
                src={`/api/blog/output/${encodeURIComponent(folder)}/post.html`}
                className="mt-3 h-[600px] w-full rounded-[1.2rem] border border-black/10 bg-white"
                title="post preview"
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function groupFiles(files) {
  const images = [];
  const docs = [];
  for (const f of files) {
    if (f.startsWith("images/") || /\.(png|jpe?g|webp|svg)$/i.test(f)) {
      images.push(f);
    } else {
      docs.push(f);
    }
  }
  return { images, docs };
}
