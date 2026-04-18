"use client";

import { useState } from "react";
import { MUSIC_WORKSPACE_KEYS, usePersistedJsonState } from "@/lib/music-workspace";

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

function CopyButton({ label, value, disabled = false, fullWidth = false, tone = "accent" }) {
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
      : copied
        ? "bg-emerald-600 text-white"
        : "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]";

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      className={`rounded-2xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${toneClass} ${fullWidth ? "w-full" : ""}`}
    >
      {copied ? "복사 완료" : label}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function getGeneratedText(result) {
  return result?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim() || "";
}

export function AdMasterWorkbench({ title, description, tags, content, sectionLabel }) {
  const [form, setForm] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.adMasterForm, INITIAL_FORM);
  const [output, setOutput] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.adMasterOutput, "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const platformValue = form.platform === "기타" ? form.platformCustom : form.platform;

  async function handleGenerate() {
    if (!form.product.trim()) {
      setError("광고할 제품/서비스를 입력해주세요.");
      window.setTimeout(() => setError(""), 3000);
      return;
    }
    if (!form.target.trim()) {
      setError("타겟층을 입력해주세요.");
      window.setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    const userMessage = `아래 광고 정보를 바탕으로 광고 영상 프롬프트를 완성해주세요.

제품/서비스: ${form.product.trim()}
타겟층: ${form.target.trim()}
광고 플랫폼: ${platformValue.trim() || "미정"}
광고 스타일: ${form.style.trim() || "트렌디하고 임팩트 있는 스타일"}
추가 요구사항: ${form.requirements.trim() || "없음"}

중요: 모든 단계(① 스토리보드 → ② 피사체 생성 프롬프트 → ④ 최종 영상 프롬프트)를 승인 과정 없이 한 번에 순서대로 완성하여 출력해주세요.`;

    try {
      const res = await fetch("/api/gemini-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          payload: {
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            systemInstruction: { role: "system", parts: [{ text: content }] },
          },
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result?.details?.error?.message || result?.error || `API 오류: ${res.status}`);
      }

      setOutput(getGeneratedText(result) || "생성 결과가 비어 있습니다.");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setOutput("");
    setError("");
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <aside className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">{sectionLabel}</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-900">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--accent)]/16 bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent-strong)]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-8 grid gap-3">
          <CopyButton label="생성 결과 복사" value={output.trim()} disabled={!output.trim()} fullWidth />
          <CopyButton label="원본 규칙 복사" value={content.trim()} fullWidth />
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">Ad Video Generator</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">광고 정보를 입력해주세요</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                제품과 타겟 정보를 입력하면 15초 광고 스토리보드와 영상 프롬프트를 생성합니다.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "생성 중..." : "광고 프롬프트 만들기"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="광고 제품 / 서비스 *">
              <input
                type="text"
                value={form.product}
                onChange={(e) => updateField("product", e.target.value)}
                placeholder="예) 국산 유기농 그린티 스킨케어 라인"
                className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--accent)]"
              />
            </Field>

            <Field label="타겟층 *">
              <input
                type="text"
                value={form.target}
                onChange={(e) => updateField("target", e.target.value)}
                placeholder="예) 20~35세 여성, 피부 관리에 관심 많은 직장인"
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
                  placeholder="플랫폼을 직접 입력해주세요"
                  className="mt-2 w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--accent)]"
                />
              )}
            </Field>

            <Field label="광고 스타일">
              <input
                type="text"
                value={form.style}
                onChange={(e) => updateField("style", e.target.value)}
                placeholder="예) 감성적인 내레이션, 슬로우모션, 뷰티 에디토리얼"
                className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--accent)]"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="추가 요구사항">
                <textarea
                  rows={4}
                  value={form.requirements}
                  onChange={(e) => updateField("requirements", e.target.value)}
                  placeholder="예) 모델은 30대 한국 여성, 야외 공원 배경, 자연광 위주, 대사 없이 배경음악만"
                  className="w-full rounded-2xl border border-black/8 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-[var(--accent)]"
                />
              </Field>
            </div>

            <p className="min-h-5 text-sm font-semibold text-rose-500 sm:col-span-2">{error}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-[0_28px_70px_rgba(2,6,23,0.28)]">
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/70 px-5 py-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-400">Generated Ad Prompt</p>
              <p className="mt-1 text-sm text-white/45">스토리보드 · 피사체 프롬프트 · 영상 프롬프트</p>
            </div>
            <CopyButton label="결과 복사" value={output.trim()} disabled={!output.trim()} tone="dark" />
          </div>
          <div className="app-scrollbar min-h-[320px] overflow-auto bg-[radial-gradient(circle_at_top_right,#1e293b_0%,#0f172a_100%)] px-6 py-6 text-slate-200">
            {loading ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-slate-400">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
                <p className="animate-pulse">광고 프롬프트를 구성하고 있습니다...</p>
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap text-sm leading-8">{output}</pre>
            ) : (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center text-slate-500">
                <div className="text-5xl opacity-20">▶</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-300">생성 대기 중</h3>
                  <p className="mt-2 text-sm">제품과 타겟 정보를 입력하고 광고 프롬프트를 만들어보세요.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Reference Prompt</p>
              <p className="mt-2 text-sm text-slate-500">참고용 원본 프롬프트 규칙</p>
            </div>
            <CopyButton label="원본 복사" value={content.trim()} />
          </div>
          <pre className="app-scrollbar max-h-[calc(100vh-16rem)] overflow-auto rounded-[1.5rem] border border-black/6 bg-[var(--surface-strong)] p-5 font-mono text-sm leading-7 whitespace-pre-wrap text-slate-800">
            {content.trim()}
          </pre>
        </div>
      </section>
    </div>
  );
}
