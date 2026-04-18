"use client";

import { createContext, useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MUSIC_WORKSPACE_KEYS, usePersistedJsonState } from "@/lib/music-workspace";

// ─── Constants ────────────────────────────────────────────────────────────────

const FLOW_URL = "https://klingai.com";

const SEEDANCE_TIPS = [
  {
    id: "grid9",
    title: "① 9분할 샷 만들기",
    desc: "모델 얼굴 이미지를 3×3 그리드로 복제 → 시댄스 2.0이 얼굴을 일관되게 인식",
    prompt:
      "A seamless 3×3 grid of the exact same image repeated 9 times, all tiles identical and perfectly aligned, no gaps, no padding, no borders. strict tiling, no transformation, no variation, no reinterpretation. each tile is an exact copy with the same proportions and orientation. the final image preserves the original aspect ratio exactly. flat composition, no perspective, no depth, no additional elements",
  },
  {
    id: "face-lines",
    title: "② 얼굴에 선 긋기",
    desc: "얼굴 랜드마크에 격자선 추가 → 시댄스가 얼굴 구조를 더 정확히 인식",
    prompt:
      "Remove the background and edit the provided image.\n\nAdd a minimal structured interference pattern on the all faces of the attached image:\n - 4 thin, white solid grid lines\n - Evenly distributed across the eyes, nose, and mouth following the facial contours \n\nPreserve identity and likeness. \nDo not blur the entire face. \nDo not block or censor facial features. \nThe face must still look natural to humans",
  },
];

const PLATFORM_OPTIONS = [
  { value: "인스타그램 릴스", label: "인스타그램 릴스" },
  { value: "유튜브 쇼츠", label: "유튜브 쇼츠" },
  { value: "틱톡", label: "틱톡" },
  { value: "유튜브 (일반)", label: "유튜브 (일반)" },
  { value: "기타", label: "기타 (직접 입력)" },
];

const INITIAL_FORM = {
  product: "",
  target: "",
  platform: PLATFORM_OPTIONS[0].value,
  platformCustom: "",
  style: "",
  requirements: "",
};

// ─── Markdown renderer ────────────────────────────────────────────────────────

// Context to tell <code> it's inside a <pre> (block code vs inline)
const InPreCtx = createContext(false);

function MdViewer({ content }) {
  const components = {
    h1: ({ children }) => (
      <h1 className="mb-3 mt-6 text-xl font-black text-white first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-2 mt-5 border-b border-white/10 pb-2 text-base font-bold text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-1.5 mt-4 text-sm font-bold text-violet-300">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-1 mt-3 text-sm font-semibold text-slate-300">{children}</h4>
    ),
    p: ({ children }) => <p className="my-2 leading-7 text-slate-200">{children}</p>,
    ul: ({ children }) => (
      <ul className="my-2 list-disc space-y-1 pl-5 text-slate-300">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-2 list-decimal space-y-1 pl-5 text-slate-300">{children}</ol>
    ),
    li: ({ children }) => <li>{children}</li>,
    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }) => <em className="text-slate-400">{children}</em>,
    hr: () => <hr className="my-4 border-white/10" />,
    blockquote: ({ children }) => (
      <blockquote className="my-3 border-l-4 border-violet-500/50 pl-4 italic text-slate-400">
        {children}
      </blockquote>
    ),
    // Tables
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-800/80">{children}</thead>,
    tbody: ({ children }) => (
      <tbody className="divide-y divide-white/5">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="transition hover:bg-white/[0.03]">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2.5 text-slate-300">{children}</td>
    ),
    // Code blocks — pre provides context so code knows if it's inline or block
    pre: ({ children }) => (
      <InPreCtx.Provider value={true}>
        <pre className="app-scrollbar my-3 overflow-x-auto rounded-xl border border-slate-700/40 bg-slate-950 p-4 text-xs font-mono leading-6">
          {children}
        </pre>
      </InPreCtx.Provider>
    ),
    code: ({ children, className }) => {
      const inPre = useContext(InPreCtx);
      if (inPre) {
        return (
          <code className={`${className || ""} whitespace-pre-wrap text-emerald-300`}>
            {children}
          </code>
        );
      }
      return (
        <code className="rounded bg-slate-700/50 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
          {children}
        </code>
      );
    },
  };

  return (
    <div className="text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

function CopyButton({ label, sub, value, disabled = false, fullWidth = false, tone = "accent", size = "md" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (disabled || !value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const toneClass =
    tone === "dark"
      ? "bg-white/8 text-white hover:bg-white/12"
      : tone === "neutral"
        ? copied
          ? "bg-emerald-600 text-white"
          : "bg-slate-900 text-white hover:bg-slate-700"
        : copied
          ? "bg-emerald-600 text-white"
          : "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]";

  const sizeClass = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-3 text-sm";

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      className={`rounded-2xl font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${toneClass} ${sizeClass} ${fullWidth ? "w-full text-left" : ""}`}
    >
      {copied ? "복사 완료 ✓" : label}
      {sub && !copied && (
        <span className="mt-0.5 block text-[11px] font-medium opacity-55">{sub}</span>
      )}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGeminiText(result) {
  return (
    result?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim() || ""
  );
}

function buildStep1Request(form) {
  const platform =
    form.platform === "기타" ? form.platformCustom || "미정" : form.platform;
  return `아래 광고 정보를 바탕으로 작업을 시작합니다.

제품/서비스: ${form.product.trim()}
타겟층: ${form.target.trim()}
광고 플랫폼: ${platform}
광고 스타일: ${form.style.trim() || "트렌디하고 임팩트 있는 스타일"}
추가 요구사항: ${form.requirements.trim() || "없음"}

지금은 ① 스토리보드 표와 ② 피사체 생성 프롬프트만 출력해주세요.
③ 승인 요청 문장("수정할 내용이 있나요? 없으면 승인을 해주세요.")까지만 출력하고,
④ 최종 영상 프롬프트는 아직 생성하지 마세요.`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdMasterWorkbench({ title, description, tags, content, sectionLabel }) {
  // Persisted state
  const [form, setForm] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.adMasterForm, INITIAL_FORM);
  const [phase, setPhase] = usePersistedJsonState("yt-guide:ad-master:phase", "form");
  const [step1Output, setStep1Output] = usePersistedJsonState("yt-guide:ad-master:step1", "");
  const [step1Request, setStep1Request] = usePersistedJsonState("yt-guide:ad-master:step1-req", "");
  const [step2Output, setStep2Output] = usePersistedJsonState("yt-guide:ad-master:step2", "");

  // Local state
  const [loadingAction, setLoadingAction] = useState(null); // null | 'step1' | 'mod' | 'step2'
  const [modInput, setModInput] = useState("");
  const [error, setError] = useState("");
  const [tipsOpen, setTipsOpen] = useState(false);
  const [formExpanded, setFormExpanded] = useState(true);

  const loading = loadingAction !== null;

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function callGemini(messages) {
    const res = await fetch("/api/gemini-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        payload: {
          contents: messages,
          systemInstruction: { role: "system", parts: [{ text: content }] },
        },
      }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(
        result?.details?.error?.message || result?.error || `API 오류: ${res.status}`
      );
    }
    return getGeminiText(result);
  }

  function showError(msg) {
    setError(msg);
    window.setTimeout(() => setError(""), 4000);
  }

  // ── Actions ──

  async function handleStep1() {
    if (!form.product.trim()) return showError("광고할 제품/서비스를 입력해주세요.");
    if (!form.target.trim()) return showError("타겟층을 입력해주세요.");

    setLoadingAction("step1");
    setError("");
    const req = buildStep1Request(form);
    setStep1Request(req);

    try {
      const out = await callGemini([{ role: "user", parts: [{ text: req }] }]);
      setStep1Output(out || "생성 결과가 비어 있습니다.");
      setPhase("step1");
      setFormExpanded(false);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleModify() {
    if (!modInput.trim()) return;
    setLoadingAction("mod");
    setError("");

    try {
      const modMsg = `[수정 요청]\n${modInput.trim()}\n\n위 내용을 반영하여 ① 스토리보드와 ② 피사체 생성 프롬프트를 수정해주세요.\n③ 승인 요청 문장까지만 출력하고 ④ 최종 영상 프롬프트는 아직 생성하지 마세요.`;
      const out = await callGemini([
        { role: "user", parts: [{ text: step1Request }] },
        { role: "model", parts: [{ text: step1Output }] },
        { role: "user", parts: [{ text: modMsg }] },
      ]);
      setStep1Output(out || "생성 결과가 비어 있습니다.");
      setModInput("");
    } catch (err) {
      showError(err.message);
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleStep2() {
    setLoadingAction("step2");
    setError("");

    try {
      const approveMsg = "승인합니다. ④ 최종 영상 프롬프트(코드블록)를 생성해주세요.";
      const out = await callGemini([
        { role: "user", parts: [{ text: step1Request }] },
        { role: "model", parts: [{ text: step1Output }] },
        { role: "user", parts: [{ text: approveMsg }] },
      ]);
      setStep2Output(out || "생성 결과가 비어 있습니다.");
      setPhase("step2");
    } catch (err) {
      showError(err.message);
    } finally {
      setLoadingAction(null);
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setPhase("form");
    setStep1Output("");
    setStep1Request("");
    setStep2Output("");
    setModInput("");
    setError("");
    setFormExpanded(true);
  }

  // ── Render ──

  const showStep1 = phase !== "form" || loadingAction === "step1";
  const showStep2 = phase === "step2" || loadingAction === "step2";

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,288px)_minmax(0,1fr)]">
      {/* ═══ SIDEBAR ═══════════════════════════════════════════════════════════ */}
      <aside className="space-y-4">
        {/* Info card */}
        <div className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-5 shadow-[var(--shadow-lg)]">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">
            {sectionLabel}
          </p>
          <h1 className="mt-1.5 text-xl font-black tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--accent)]/16 bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--accent-strong)]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Step progress */}
          <div className="mt-5 flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition ${
                phase !== "form"
                  ? "bg-[var(--accent)] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              1
            </div>
            <div className="relative flex-1">
              <div className="h-0.5 w-full rounded-full bg-slate-200" />
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-[var(--accent)] transition-all duration-500 ${
                  phase === "step2" ? "w-full" : "w-0"
                }`}
              />
            </div>
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition ${
                phase === "step2"
                  ? "bg-[var(--accent)] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              2
            </div>
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>피사체 프롬프트</span>
            <span>영상 프롬프트</span>
          </div>
        </div>

        {/* Flow 이동 + 결과 복사 */}
        <div className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-4 shadow-[var(--shadow-lg)] space-y-2">
          <a
            href={FLOW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-4 py-3 text-sm font-bold text-[var(--accent)] transition hover:bg-[var(--accent)]/14"
          >
            <span>Kling Flow 열기</span>
            <span className="text-base leading-none">↗</span>
          </a>
          <CopyButton
            label="생성 결과 복사"
            value={phase === "step2" ? step2Output : step1Output}
            disabled={!step1Output}
            fullWidth
            size="sm"
          />
        </div>

        {/* Seedance 2.0 tips */}
        <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-[var(--surface)] shadow-[var(--shadow-lg)]">
          <button
            type="button"
            onClick={() => setTipsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-black/[0.02]"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)]">
                Seedance 2.0
              </p>
              <p className="text-sm font-bold text-slate-800">모델 얼굴 활용 팁</p>
            </div>
            <span className="text-slate-400 text-lg leading-none">{tipsOpen ? "−" : "+"}</span>
          </button>

          {tipsOpen && (
            <div className="space-y-3 border-t border-black/6 px-5 pb-5 pt-4">
              {SEEDANCE_TIPS.map((tip) => (
                <div key={tip.id} className="rounded-2xl border border-black/8 bg-white p-4">
                  <p className="text-[11px] font-black text-slate-800">{tip.title}</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">{tip.desc}</p>
                  <div className="mt-3">
                    <CopyButton label="프롬프트 복사" value={tip.prompt} size="sm" fullWidth />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Original prompt — large, prominent */}
        <div className="rounded-[2rem] border-2 border-slate-900/12 bg-slate-900 p-5 shadow-[var(--shadow-lg)]">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
            원본 규칙
          </p>
          <p className="mt-1 text-sm font-bold text-white">원본 규칙 복사</p>
          <CopyButton
            label="원본 규칙 복사"
            sub="↓ Claude에 그대로 붙여넣기"
            value={content.trim()}
            tone="neutral"
            fullWidth
          />
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══════════════════════════════════════════════════════ */}
      <section className="space-y-5">

        {/* ── Form card ─────────────────────────────────────────────────────── */}
        <div className="rounded-[2rem] border border-black/8 bg-[var(--surface)] shadow-[var(--shadow-lg)]">
          <button
            type="button"
            onClick={() => setFormExpanded((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">
                1단계 입력
              </p>
              <h2 className="mt-0.5 text-lg font-black tracking-tight text-slate-900">
                광고 정보 입력
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {phase !== "form" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="rounded-xl border border-black/8 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
                >
                  처음부터
                </button>
              )}
              <span className="w-6 text-center text-slate-400 text-lg leading-none">
                {formExpanded ? "−" : "+"}
              </span>
            </div>
          </button>

          {formExpanded && (
            <div className="border-t border-black/6 px-6 pb-6 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="광고 제품 / 서비스 *">
                  <input
                    type="text"
                    value={form.product}
                    onChange={(e) => updateField("product", e.target.value)}
                    placeholder="예) 국산 유기농 그린티 스킨케어"
                    className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--accent)]"
                  />
                </Field>

                <Field label="타겟층 *">
                  <input
                    type="text"
                    value={form.target}
                    onChange={(e) => updateField("target", e.target.value)}
                    placeholder="예) 20~35세 여성, 피부 관리 관심 직장인"
                    className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--accent)]"
                  />
                </Field>

                <Field label="광고 플랫폼">
                  <select
                    value={form.platform}
                    onChange={(e) => updateField("platform", e.target.value)}
                    className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--accent)]"
                  >
                    {PLATFORM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {form.platform === "기타" && (
                    <input
                      type="text"
                      value={form.platformCustom}
                      onChange={(e) => updateField("platformCustom", e.target.value)}
                      placeholder="플랫폼 직접 입력"
                      className="mt-2 w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
                    />
                  )}
                </Field>

                <Field label="광고 스타일">
                  <input
                    type="text"
                    value={form.style}
                    onChange={(e) => updateField("style", e.target.value)}
                    placeholder="예) 감성적 내레이션, 슬로우모션, 에디토리얼"
                    className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--accent)]"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="추가 요구사항">
                    <textarea
                      rows={3}
                      value={form.requirements}
                      onChange={(e) => updateField("requirements", e.target.value)}
                      placeholder="예) 30대 한국 여성 모델, 야외 공원 배경, 자연광, 대사 없음"
                      className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-[var(--accent)]"
                    />
                  </Field>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-sm font-semibold text-rose-500">{error}</p>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleStep1}
                  disabled={loading}
                  className="rounded-2xl bg-[var(--accent)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingAction === "step1" ? "생성 중..." : "① 피사체 프롬프트 생성"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Step 1 Output ──────────────────────────────────────────────────── */}
        {showStep1 && (
          <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-[0_28px_70px_rgba(2,6,23,0.28)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/70 px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-400">
                  1단계 — 스토리보드 + 피사체 프롬프트
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  Kling Flow에서 이미지 생성 → 확인 후 2단계 진행
                </p>
              </div>
              <CopyButton
                label="복사"
                value={step1Output}
                disabled={!step1Output}
                tone="dark"
                size="sm"
              />
            </div>

            <div className="app-scrollbar min-h-[280px] overflow-auto px-6 py-6">
              {loadingAction === "step1" ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-slate-400">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
                  <p className="animate-pulse text-sm">스토리보드 + 피사체 프롬프트 생성 중…</p>
                </div>
              ) : step1Output ? (
                <MdViewer content={step1Output} />
              ) : null}
            </div>
          </div>
        )}

        {/* ── Modify + Approve ───────────────────────────────────────────────── */}
        {phase === "step1" && step1Output && (
          <div className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">
              수정 또는 승인
            </p>
            <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900">
              이미지 생성 후 진행해주세요
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              위 피사체 프롬프트로 <strong>Kling Flow</strong>에서 이미지를 먼저 생성하세요.
              수정이 필요하면 아래에 입력하고, 완료되면 <strong>승인</strong>하여 2단계로 진행합니다.
            </p>

            <div className="mt-5 space-y-3">
              <textarea
                rows={3}
                value={modInput}
                onChange={(e) => setModInput(e.target.value)}
                placeholder="수정 요청 사항을 입력하세요 (예: Shot 2 모델 복장을 청바지로 변경, Shot 4 제거 후 재구성)"
                className="w-full rounded-2xl border border-black/8 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-[var(--accent)]"
              />

              {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleModify}
                  disabled={loading || !modInput.trim()}
                  className="flex-1 rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingAction === "mod" ? "수정 중…" : "수정 요청"}
                </button>
                <button
                  type="button"
                  onClick={handleStep2}
                  disabled={loading}
                  className="flex-[2] rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-black text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingAction === "step2" ? "생성 중…" : "② 승인 → 장면 프롬프트 생성"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2 Output ──────────────────────────────────────────────────── */}
        {showStep2 && (
          <div className="overflow-hidden rounded-[2rem] border border-violet-900/60 bg-slate-950 shadow-[0_28px_70px_rgba(2,6,23,0.28)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-violet-950/40 px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-400">
                  2단계 — 최종 영상 프롬프트
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  Kling Flow / Seedance 2.0 영상 생성에 사용
                </p>
              </div>
              <CopyButton
                label="복사"
                value={step2Output}
                disabled={!step2Output}
                tone="dark"
                size="sm"
              />
            </div>

            <div className="app-scrollbar min-h-[280px] overflow-auto px-6 py-6">
              {loadingAction === "step2" ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-slate-400">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
                  <p className="animate-pulse text-sm">최종 영상 프롬프트 생성 중…</p>
                </div>
              ) : step2Output ? (
                <MdViewer content={step2Output} />
              ) : null}
            </div>
          </div>
        )}

        {/* ── Step 2 done — nav buttons ──────────────────────────────────────── */}
        {phase === "step2" && step2Output && (
          <div className="flex flex-wrap gap-3 rounded-[2rem] border border-black/8 bg-[var(--surface)] p-5 shadow-[var(--shadow-lg)]">
            <button
              type="button"
              onClick={() => { setPhase("step1"); setFormExpanded(false); }}
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              ← 1단계로 돌아가기
            </button>
            <button
              type="button"
              onClick={handleStep2}
              disabled={loading}
              className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-4 py-3 text-sm font-bold text-[var(--accent)] transition hover:bg-[var(--accent)]/14 disabled:opacity-50"
            >
              2단계 재생성
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm font-bold text-slate-400 transition hover:bg-slate-50"
            >
              처음부터
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
