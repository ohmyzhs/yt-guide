"use client";

import { useState } from "react";
import { MUSIC_WORKSPACE_KEYS, usePersistedJsonState } from "@/lib/music-workspace";

const ART_STYLE_OPTIONS = [
  {
    value: "beautiful Korean webtoon manhwa style, detailed expressive line art, vibrant colors, soft cel shading",
    label: "웹툰 스타일",
  },
  {
    value: "soft watercolor illustration style, delicate brushstrokes, warm muted tones, dreamy atmospheric washes",
    label: "수채화 일러스트",
  },
  {
    value: "traditional East Asian ink painting style, elegant calligraphic brush strokes, ink wash with subtle color accents",
    label: "동양화 풍",
  },
  {
    value: "hyperrealistic digital concept art, cinematic dramatic lighting, detailed textures, photorealistic rendering",
    label: "사실적 디지털 아트",
  },
  {
    value: "premium anime illustration style, detailed character design, large expressive eyes, clean sharp linework, vibrant cel shading",
    label: "고품질 애니메이션",
  },
  {
    value: "classical oil painting style, rich jewel-toned colors, dramatic chiaroscuro lighting, Renaissance composition",
    label: "유화 클래식",
  },
  { value: "__custom__", label: "직접 입력" },
];

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

function getGeneratedText(result) {
  return result?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim() || "";
}

export function CharacterSheetWorkbench({ title, description, tags, content, sectionLabel }) {
  const [traits, setTraits] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.charSheetTraits, "");
  const [artStyleKey, setArtStyleKey] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.charSheetArtStyle, ART_STYLE_OPTIONS[0].value);
  const [customStyle, setCustomStyle] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.charSheetCustomStyle, "");
  const [output, setOutput] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.charSheetOutput, "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const artStyleValue = artStyleKey === "__custom__" ? customStyle : artStyleKey;

  async function handleGenerate() {
    if (!traits.trim()) {
      setError("캐릭터 특징을 입력해주세요.");
      window.setTimeout(() => setError(""), 3000);
      return;
    }
    if (!artStyleValue.trim()) {
      setError("Art Style을 입력해주세요.");
      window.setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    const userMessage = `아래는 STEP 1과 STEP 2의 사용자 답변입니다.

[STEP 1] 캐릭터의 특징:
${traits.trim()}

[STEP 2] Art Style:
${artStyleValue.trim()}

이 두 가지 입력을 바탕으로 STEP 4부터 순서대로 진행하여 최종 캐릭터 시트 프롬프트를 한 번에 완성해주세요.`;

    try {
      const res = await fetch("/api/gemini-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
    setTraits("");
    setArtStyleKey(ART_STYLE_OPTIONS[0].value);
    setCustomStyle("");
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
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">Character Sheet Generator</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">캐릭터 정보를 입력해주세요</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                특징과 스타일을 입력하면 4분할 캐릭터 시트 프롬프트를 생성합니다.
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
                {loading ? "생성 중..." : "캐릭터 시트 만들기"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Art Style
              </label>
              <select
                value={artStyleKey}
                onChange={(e) => setArtStyleKey(e.target.value)}
                className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--accent)]"
              >
                {ART_STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {artStyleKey === "__custom__" && (
                <input
                  type="text"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  placeholder="예) gothic fantasy dark art style, detailed ink illustration"
                  className="mt-2 w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--accent)]"
                />
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                캐릭터 특징
              </label>
              <textarea
                rows={7}
                value={traits}
                onChange={(e) => setTraits(e.target.value)}
                className="w-full rounded-2xl border border-black/8 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-[var(--accent)]"
                placeholder={`예) 20대 초반 여성, 긴 흑발, 마른 체형, 키 165cm
차갑고 도도한 인상, 날카로운 눈매, 큰 눈
검은색 교복 착용, 흰 넥타이
왼손에 책을 들고 있음`}
              />
            </div>

            <p className="min-h-5 text-sm font-semibold text-rose-500">{error}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-[0_28px_70px_rgba(2,6,23,0.28)]">
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/70 px-5 py-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-400">Generated Character Sheet</p>
              <p className="mt-1 text-sm text-white/45">Gemini가 생성한 캐릭터 시트 프롬프트</p>
            </div>
            <CopyButton label="결과 복사" value={output.trim()} disabled={!output.trim()} tone="dark" />
          </div>
          <div className="app-scrollbar min-h-[320px] overflow-auto bg-[radial-gradient(circle_at_top_right,#1e293b_0%,#0f172a_100%)] px-6 py-6 text-slate-200">
            {loading ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-slate-400">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
                <p className="animate-pulse">캐릭터 시트 프롬프트를 생성하고 있습니다...</p>
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap text-sm leading-8">{output}</pre>
            ) : (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center text-slate-500">
                <div className="text-5xl opacity-20">◈</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-300">생성 대기 중</h3>
                  <p className="mt-2 text-sm">캐릭터 특징과 스타일을 입력하고 시트를 만들어보세요.</p>
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
