"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const STATUS_LABEL = {
  idle: "대기 중",
  running: "생성 중",
  done: "완료",
  error: "오류",
  partial: "미완성",
};

function statusClass(status) {
  if (status === "done") return "bg-emerald-100 text-emerald-700";
  if (status === "error") return "bg-red-100 text-red-700";
  if (status === "partial") return "bg-amber-100 text-amber-700";
  return "bg-[var(--accent-soft)] text-[var(--accent-strong)]";
}

function outputUrl(folder, relPath) {
  const seg = relPath.split("/").map(encodeURIComponent).join("/");
  return `/api/blog/output/${encodeURIComponent(folder)}/${seg}`;
}

function StepBar({ steps }) {
  if (!steps?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {steps.map((s, i) => (
        <span
          key={i}
          title={s.optional ? `${s.label} (선택)` : s.label}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            s.done
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {s.done ? "✓ " : ""}
          {s.label}
        </span>
      ))}
    </div>
  );
}

export function BlogBuilderTool() {
  const [keyword, setKeyword] = useState("");
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [log, setLog] = useState("");
  const [result, setResult] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [history, setHistory] = useState([]);
  const [preview, setPreview] = useState(null); // { folder, files, imagePrompts, post }
  const [previewLoading, setPreviewLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const logRef = useRef(null);
  const esRef = useRef(null);
  const pollRef = useRef(null);

  const loadHistory = useCallback(async () => {
    try {
      const r = await fetch("/api/blog/history");
      if (r.ok) {
        const d = await r.json();
        setHistory(d.posts || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Load history once on mount. setState happens after the fetch resolves
    // (not synchronously in the effect body), so the set-state-in-effect rule
    // is a false positive here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  useEffect(
    () => () => {
      esRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    },
    [],
  );

  async function copyPrompt(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {}
  }

  const openPreview = useCallback(async (folder, post = null) => {
    setPreviewLoading(true);
    try {
      let files = [];
      const r = await fetch(`/api/blog/output/${encodeURIComponent(folder)}`);
      if (r.ok) {
        const d = await r.json();
        const entries = d.entries || [];
        files = entries.filter((e) => !e.dir).map((e) => e.name);
        if (entries.some((e) => e.dir && e.name === "images")) {
          try {
            const ri = await fetch(
              `/api/blog/output/${encodeURIComponent(folder)}/images`,
            );
            if (ri.ok) {
              const di = await ri.json();
              files.push(
                ...(di.entries || [])
                  .filter((e) => !e.dir)
                  .map((e) => `images/${e.name}`),
              );
            }
          } catch {}
        }
      }
      let imagePrompts = null;
      if (files.includes("image-prompts.json")) {
        try {
          const pr = await fetch(outputUrl(folder, "image-prompts.json"));
          if (pr.ok) imagePrompts = await pr.json();
        } catch {}
      }
      setPreview({ folder, files, imagePrompts, post });
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const finishUp = useCallback(
    async (id) => {
      try {
        const r = await fetch(`/api/blog/result/${id}`);
        if (!r.ok) return;
        const data = await r.json();
        setResult(data);
        setStatus(data.status || "done");
        if (data.error) setServerError(data.error);
        loadHistory();
        if (data.folder && (data.files || []).includes("post.html")) {
          openPreview(data.folder, data);
        }
      } catch {}
    },
    [loadHistory, openPreview],
  );

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
    es.addEventListener("done", () => {
      es.close();
      finishUp(id);
    });
    es.addEventListener("error", (ev) => {
      try {
        const data = JSON.parse(ev.data || "{}");
        if (data.error) setServerError(data.error);
      } catch {}
      es.close();
      finishUp(id);
    });
  }

  async function start(resumeFolder = null, kwOverride = null) {
    const kw = (kwOverride ?? keyword).trim();
    if (!kw || status === "running") return;
    setServerError(null);
    setLog("");
    setResult(null);
    setStatus("running");

    if (pollRef.current) clearInterval(pollRef.current);

    let res;
    try {
      res = await fetch("/api/blog/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ keyword: kw, resumeFolder }),
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
    // Live step bar: poll result while running (log also streams [진행] lines).
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/blog/result/${data.jobId}`);
        if (r.ok) {
          const d = await r.json();
          setResult(d);
          if (d.status === "done" || d.status === "error") {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch {}
    }, 4000);
  }

  const isRunning = status === "running";
  const incompleteActive =
    result && result.folder && result.complete === false && result.keyword;

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
          로컬 <code className="font-mono text-xs">claude</code> CLI로{" "}
          <code className="font-mono text-xs">/blog-new</code> 파이프라인을
          실행합니다 (리서치 → 본문 → 이미지 프롬프트 → 품질 검증, 3~7분).
          작성된 글은 아래 히스토리에 남아 언제든 다시 볼 수 있습니다.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            start();
          }}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예: 병원 마케팅, 주간 뉴스 정리, 상세페이지 제작 비용"
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
            {incompleteActive && (
              <button
                type="button"
                onClick={() => start(result.folder, result.keyword)}
                className="ml-3 rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
              >
                중단된 단계부터 재개
              </button>
            )}
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
              className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(status)}`}
            >
              {STATUS_LABEL[status] || status}
            </span>
          </div>
          {result?.steps && <StepBar steps={result.steps} />}
          {status === "done" && result && result.complete === false && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              <span>일부 단계가 완료되지 않았습니다 (이미지 프롬프트/패키지 등).</span>
              {incompleteActive && (
                <button
                  type="button"
                  onClick={() => start(result.folder, result.keyword)}
                  className="shrink-0 rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-700"
                >
                  재개
                </button>
              )}
            </div>
          )}
          <pre
            ref={logRef}
            className="mt-4 max-h-80 overflow-auto rounded-[1.2rem] bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100"
          >
            {log || "(아직 출력 없음)"}
          </pre>
        </section>
      )}

      {preview && (
        <PreviewPanel
          preview={preview}
          loading={previewLoading}
          copiedKey={copiedKey}
          onCopy={copyPrompt}
          onResume={(folder, kw) => start(folder, kw)}
          canResume={!isRunning}
        />
      )}

      <HistoryPanel
        posts={history}
        activeFolder={preview?.folder}
        onOpen={(post) => openPreview(post.folder, post)}
        onResume={(post) => start(post.folder, post.keyword)}
        canResume={!isRunning}
        onRefresh={loadHistory}
      />
    </div>
  );
}

function PreviewPanel({ preview, loading, copiedKey, onCopy, onResume, canResume }) {
  const { folder, files, imagePrompts, post } = preview;
  const images = (files || []).filter(
    (f) => f.startsWith("images/") || /\.(png|jpe?g|webp|svg)$/i.test(f),
  );
  const docs = (files || []).filter(
    (f) => !images.includes(f) && f !== "_run.log",
  );
  const incomplete = post && post.complete === false && post.keyword;

  return (
    <section className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">
          미리보기
        </p>
        {post?.status && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(post.status)}`}
          >
            {STATUS_LABEL[post.status] || post.status}
          </span>
        )}
      </div>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">
        {post?.title || folder}
      </h2>
      <p className="mt-1 font-mono text-xs text-slate-400">{folder}</p>

      {post?.error && (
        <p className="mt-2 rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {post.error}
        </p>
      )}
      {incomplete && (
        <button
          type="button"
          disabled={!canResume}
          onClick={() => onResume(folder, post.keyword)}
          className="mt-3 rounded-lg bg-[var(--accent)] px-4 py-1.5 text-xs font-bold text-white hover:bg-[var(--accent-strong)] disabled:opacity-40"
        >
          중단된 단계부터 재개
        </button>
      )}

      {loading && <p className="mt-4 text-sm text-slate-500">불러오는 중…</p>}

      {files.includes("post.html") && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            post.html
          </p>
          <iframe
            src={outputUrl(folder, "post.html")}
            className="mt-3 h-[600px] w-full rounded-[1.2rem] border border-black/10 bg-white"
            title="post preview"
          />
        </div>
      )}

      {imagePrompts?.images?.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            이미지 프롬프트 ({imagePrompts.images.length})
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {imagePrompts.note ||
              "각 프롬프트를 Nano Banana 2 또는 gpt-image-2에 붙여넣어 직접 생성하세요."}
          </p>
          <div className="mt-4 space-y-4">
            {imagePrompts.images.map((img, i) => (
              <div
                key={img.id ?? i}
                className="rounded-[1.35rem] border border-black/8 bg-white/70 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-bold text-[var(--accent-strong)]">
                    #{img.id ?? i + 1}
                  </span>
                  {img.placement && (
                    <span className="text-sm font-semibold text-slate-800">
                      {img.placement}
                    </span>
                  )}
                </div>
                {img.context && (
                  <p className="mt-1.5 text-xs text-slate-500">{img.context}</p>
                )}
                {img.marker && (
                  <p className="mt-1 text-xs italic text-slate-400">
                    마커: {img.marker}
                  </p>
                )}
                <div className="mt-3 space-y-3">
                  {(img.options || []).map((opt, j) => {
                    const key = `${i}-${j}`;
                    return (
                      <div
                        key={key}
                        className="rounded-[1rem] border border-black/8 bg-[var(--surface)] p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {opt.style && (
                              <span className="rounded-full border border-black/10 px-2 py-0.5 font-semibold text-slate-700">
                                {opt.style}
                              </span>
                            )}
                            {opt.aspectRatio && (
                              <span className="font-mono text-slate-400">
                                {opt.aspectRatio}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onCopy(opt.prompt, key)}
                            className="shrink-0 rounded-lg bg-[var(--accent)] px-3 py-1 text-xs font-bold text-white transition hover:bg-[var(--accent-strong)]"
                          >
                            {copiedKey === key ? "복사 완료" : "복사"}
                          </button>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words font-mono text-xs leading-5 text-slate-700">
                          {opt.prompt}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {img.altText && (
                  <p className="mt-2 text-xs text-slate-400">alt: {img.altText}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            이미지
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {images.map((f) => (
              <a
                key={f}
                href={outputUrl(folder, f)}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-[0.8rem] border border-black/8"
              >
                <img
                  src={outputUrl(folder, f)}
                  alt={f}
                  className="aspect-square w-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          파일
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {docs.map((f) => (
            <li key={f}>
              <a
                href={outputUrl(folder, f)}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[var(--accent-strong)] hover:underline"
              >
                {f}
              </a>
            </li>
          ))}
          {files.includes("_run.log") && (
            <li>
              <a
                href={outputUrl(folder, "_run.log")}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-slate-500 hover:underline"
              >
                실행 로그
              </a>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

function HistoryPanel({
  posts,
  activeFolder,
  onOpen,
  onResume,
  canResume,
  onRefresh,
}) {
  return (
    <section className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">
          작성 히스토리 ({posts.length})
        </p>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg border border-black/10 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-black/5"
        >
          새로고침
        </button>
      </div>
      {posts.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">아직 작성된 글이 없습니다.</p>
      ) : (
        <ul className="mt-4 divide-y divide-black/5">
          {posts.map((p) => (
            <li
              key={p.folder}
              className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 py-3 ${
                p.folder === activeFolder ? "rounded-xl bg-black/[0.03] px-2" : ""
              }`}
            >
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusClass(p.status)}`}
              >
                {STATUS_LABEL[p.status] || p.status}
              </span>
              <button
                type="button"
                onClick={() => onOpen(p)}
                className="flex-1 truncate text-left text-sm font-semibold text-slate-800 hover:text-[var(--accent-strong)] hover:underline"
                title={p.title}
              >
                {p.title}
              </button>
              {p.complete === false && (
                <span className="text-[11px] font-medium text-amber-600">
                  {p.nextLabel
                    ? `STEP ${p.nextStep}(${p.nextLabel}) 중단`
                    : "미완성"}
                </span>
              )}
              <span className="font-mono text-[11px] text-slate-400">
                {p.folder}
              </span>
              <div className="flex shrink-0 gap-2">
                {p.previewable && (
                  <button
                    type="button"
                    onClick={() => onOpen(p)}
                    className="rounded-lg border border-black/10 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-black/5"
                  >
                    보기
                  </button>
                )}
                {p.complete === false && p.keyword && (
                  <button
                    type="button"
                    disabled={!canResume}
                    onClick={() => onResume(p)}
                    className="rounded-lg bg-[var(--accent)] px-2.5 py-1 text-xs font-bold text-white hover:bg-[var(--accent-strong)] disabled:opacity-40"
                  >
                    재개
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
