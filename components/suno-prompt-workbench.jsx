"use client";

import { useMemo, useState } from "react";
import { MUSIC_WORKSPACE_KEYS, usePersistedJsonState } from "@/lib/music-workspace";

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
      className={`rounded-2xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${toneClass} ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {copied ? "복사 완료" : label}
    </button>
  );
}

function getGenerationRules(content) {
  return content
    .replace(/다음 절차를 반드시 순서대로 따르시오:[\s\S]*?### KNOWLEDGE BASE:/, "### KNOWLEDGE BASE:")
    .replace(/\n### 사용 샘플[\s\S]*$/, "")
    .trim();
}

function getGeneratedText(result) {
  return result?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "";
}

export function SunoPromptWorkbench({ title, description, tags, content, sectionLabel }) {
  const [userInput, setUserInput] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.sunoInput, "");
  const [generatedPrompt, setGeneratedPrompt] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.sunoOutput, "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const rules = useMemo(() => getGenerationRules(content), [content]);

  async function handleGenerate() {
    if (!userInput.trim()) {
      setError("만들고 싶은 음악의 방향을 먼저 입력해주세요.");
      window.setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedPrompt("");

    const userPrompt = `아래는 STEP 1 질문에 대한 사용자의 답변입니다.\n\n${userInput.trim()}\n\n이 답변을 바탕으로 위 지침을 모두 적용해 최종 결과를 생성하세요.`;

    try {
      const response = await fetch("/api/gemini-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          payload: {
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            systemInstruction: {
              role: "system",
              parts: [{ text: rules }],
            },
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.details?.error?.message || result?.error || `API 오류: ${response.status}`);
      }

      const text = getGeneratedText(result);
      setGeneratedPrompt(text || "생성 결과가 비어 있습니다.");
    } catch (generationError) {
      console.error(generationError);
      setError(generationError instanceof Error ? generationError.message : "프롬프트 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
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
          <CopyButton label="생성 결과 복사" value={generatedPrompt.trim()} disabled={!generatedPrompt.trim()} fullWidth />
          <CopyButton label="원본 규칙 복사" value={content.trim()} fullWidth />
          <CopyButton label="질문 문구 복사" value={"만들고 싶은 음악의 장르와 분위기, 장르, 가수 보컬 등을 설정해 주세요."} fullWidth />
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">Suno Generator</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">
                만들고 싶은 음악의 장르와 분위기, 장르, 가수 보컬 등을 설정해 주세요.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                ex) 비 오는 날 창밖을 보며 마시는 커피 같은 느낌. 차분하고 좀 우울한데 세련된 재즈 힙합으로 만들어줘. 여자 보컬.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setUserInput("");
                  setGeneratedPrompt("");
                  setError("");
                }}
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
                {loading ? "생성 중..." : "프롬프트 만들기"}
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <textarea
              rows={5}
              value={userInput}
              onChange={(event) => setUserInput(event.target.value)}
              className="rounded-[1.5rem] border border-black/8 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-[var(--accent)]"
              placeholder="만들고 싶은 음악의 무드, 장르, 보컬, 질감, 참고하고 싶은 분위기를 자유롭게 적어주세요."
            />
            <p className="min-h-5 text-sm font-semibold text-rose-500">{error}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-[0_28px_70px_rgba(2,6,23,0.28)]">
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/70 px-5 py-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-400">Generated Prompt</p>
              <p className="mt-1 text-sm text-white/45">Gemini가 생성한 Suno용 결과</p>
            </div>
            <CopyButton label="결과 복사" value={generatedPrompt.trim()} disabled={!generatedPrompt.trim()} tone="dark" />
          </div>
          <div className="app-scrollbar min-h-[320px] overflow-auto bg-[radial-gradient(circle_at_top_right,#1e293b_0%,#0f172a_100%)] px-6 py-6 text-slate-200">
            {loading ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-slate-400">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
                <p className="animate-pulse">Suno용 프롬프트를 구성하고 있습니다...</p>
              </div>
            ) : generatedPrompt ? (
              <pre className="whitespace-pre-wrap text-sm leading-8">{generatedPrompt}</pre>
            ) : (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center text-slate-500">
                <div className="text-6xl opacity-20">♪</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-300">생성 대기 중</h3>
                  <p className="mt-2 text-sm">위 입력란에 원하는 음악 방향을 적고 프롬프트를 만들어보세요.</p>
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
          <pre className="app-scrollbar max-h-[calc(100vh-16rem)] overflow-auto rounded-[1.5rem] border border-black/6 bg-[var(--surface-strong)] p-5 text-sm leading-7 whitespace-pre-wrap font-mono text-slate-800">
            {content.trim()}
          </pre>
        </div>
      </section>
    </div>
  );
}
