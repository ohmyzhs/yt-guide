"use client";

import { useMemo, useState } from "react";
import { MUSIC_WORKSPACE_KEYS, usePersistedJsonState } from "@/lib/music-workspace";
import { SUNO_PRESET_FAMILIES, SUNO_STYLE_PRESETS } from "@/lib/suno-style-presets";

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

function ScoreBadge({ item }) {
  return (
    <div className="rounded-full border border-[var(--accent)]/18 bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent-strong)]">
      {item.label} <span className="opacity-70">({item.score})</span>
    </div>
  );
}

function PresetFamilyButton({ family, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-slate-900 shadow-[0_14px_30px_rgba(217,119,6,0.12)]"
          : "border-black/8 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black">{family.label}</p>
          <p className="mt-2 text-xs leading-6 opacity-75">{family.description}</p>
        </div>
        <span className="rounded-full border border-black/8 px-2.5 py-1 text-[11px] font-black">
          {count}
        </span>
      </div>
    </button>
  );
}

function PresetCard({ preset, selected, onSelect }) {
  return (
    <article
      className={`rounded-[1.5rem] border p-4 transition ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_16px_32px_rgba(217,119,6,0.12)]"
          : "border-black/8 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">{preset.genre}</p>
          <h4 className="mt-2 text-base font-black text-slate-900">{preset.title}</h4>
          <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-600">{preset.prompt}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--accent-strong)]"
          >
            선택
          </button>
          <button
            type="button"
            disabled
            className="rounded-2xl border border-black/8 bg-white px-4 py-2.5 text-sm font-bold text-slate-400"
            title="음원 연결 전까지 비활성화"
          >
            미리듣기
          </button>
        </div>
      </div>
    </article>
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

function parseScoreList(value) {
  return value
    .split(/\s*,\s*/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.*?)\s*\((\d+(?:\.\d+)?)\)$/);
      if (!match) return null;
      return {
        label: match[1].trim(),
        score: Number(match[2]),
      };
    })
    .filter(Boolean);
}

function extractSection(text, heading, nextHeadings) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nextPattern = nextHeadings
    .map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const pattern = new RegExp(`${escapedHeading}\\s*\\n([\\s\\S]*?)(?=\\n(?:${nextPattern})\\s*\\n|$)`, "i");
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

function parseSonotellerText(rawText) {
  const text = rawText.replace(/\r\n/g, "\n").trim();
  if (!text) {
    throw new Error("Sonoteller 분석 결과를 먼저 붙여넣어 주세요.");
  }

  // 각 섹션 헤더와 다음 헤더 사이만 비탐욕적으로 잘라서, 중간에 다른 필드가 끼어도 섹션 오염이 없게 만든다.
  const summary = extractSection(text, "Summary", ["Moods"]);
  const lyricMoods = extractSection(text, "Moods", ["Themes"]);
  const themes = extractSection(text, "Themes", ["Language", "MUSIC ANALYSIS"]);
  const language = extractSection(text, "Language", ["Explicit", "MUSIC ANALYSIS"]);
  const explicit = extractSection(text, "Explicit", ["MUSIC ANALYSIS"]);
  const genres = extractSection(text, "Genres", ["Subgenres", "Moods", "BPM & Key"]);
  const subgenres = extractSection(text, "Subgenres", ["Moods", "Instruments", "BPM & Key"]);
  const musicMoods = extractSection(text, "Moods", ["Instruments", "BPM & Key"]);
  const instruments = extractSection(text, "Instruments", ["BPM & Key"]);
  const bpmAndKey = extractSection(text, "BPM & Key", ["Vocals"]);
  const vocals = extractSection(text, "Vocals", ["코드를 사용할 때는 주의가 필요합니다."]);

  // "123.05BPM, A Major" 한 줄에서 BPM 숫자와 Key 문자열을 분리한다.
  const bpmKeyMatch = bpmAndKey?.match(/(\d+(?:\.\d+)?)BPM\s*,\s*(.+)/i);

  if (!summary || !lyricMoods || !themes || !genres || !bpmKeyMatch || !vocals) {
    throw new Error("Sonoteller 텍스트 형식을 인식하지 못했습니다. 원문 전체를 그대로 붙여넣어 주세요.");
  }

  return {
    lyrics: {
      summary: summary.trim(),
      moods: parseScoreList(lyricMoods),
      themes: parseScoreList(themes),
      language: language?.trim() || null,
      explicit: explicit?.trim() || null,
    },
    music: {
      genres: parseScoreList(genres).map((entry) => entry.label),
      subgenres: subgenres ? parseScoreList(subgenres).map((entry) => entry.label) : [],
      moods: musicMoods ? parseScoreList(musicMoods) : [],
      instruments: instruments ? instruments.split(/\s*,\s*/).map((item) => item.trim()).filter(Boolean) : [],
      bpm: Number(bpmKeyMatch[1]),
      key: bpmKeyMatch[2].trim(),
      vocals: vocals.trim(),
    },
  };
}

function buildFreeInputPrompt(input) {
  return `아래는 STEP 1 질문에 대한 사용자의 답변입니다.\n\n${input.trim()}\n\n이 답변을 바탕으로 위 지침을 모두 적용해 최종 결과를 생성하세요.`;
}

function buildAnalysisPrompt(parsed) {
  return `아래는 Sonoteller 분석 결과를 구조화한 JSON 데이터입니다.

${JSON.stringify(parsed, null, 2)}

이 분석 데이터를 기반으로 사용자의 음악 스타일을 정밀하게 재구성해 Suno용 최종 프롬프트를 만들어 주세요.
특히 summary, moods, themes, genres, bpm, key, vocals 정보를 빠짐없이 반영하고, 사용자가 바로 복사해 사용할 수 있는 결과 형식으로 답변하세요.`;
}

function openSonotellerWindow() {
  window.open("https://sonoteller.ai/", "_blank", "noopener,noreferrer");
}

function isValidAnalysis(v) {
  return (
    v !== null &&
    typeof v === "object" &&
    v.lyrics &&
    v.music &&
    Array.isArray(v.music.genres) &&
    Array.isArray(v.music.subgenres) &&
    Array.isArray(v.music.moods) &&
    Array.isArray(v.music.instruments)
  );
}

export function SunoPromptWorkbench({ title, description, tags, content, sectionLabel }) {
  const [activeMode, setActiveMode] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.sunoMode, "free");
  const [userInput, setUserInput] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.sunoInput, "");
  const [analysisText, setAnalysisText] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.sunoAnalysisText, "");
  const [parsedAnalysisRaw, setParsedAnalysis] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.sunoAnalysisJson, null);
  const [selectedPresetFamily, setSelectedPresetFamily] = usePersistedJsonState(
    MUSIC_WORKSPACE_KEYS.sunoPresetFamily,
    SUNO_PRESET_FAMILIES[0]?.id || ""
  );
  const [selectedPresetId, setSelectedPresetId] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.sunoPresetId, "");
  // 저장된 데이터가 현재 스키마와 맞지 않으면 null로 처리
  const parsedAnalysis = isValidAnalysis(parsedAnalysisRaw) ? parsedAnalysisRaw : null;
  const [generatedPrompt, setGeneratedPrompt] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.sunoOutput, "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const rules = useMemo(() => getGenerationRules(content), [content]);
  const presetCountByFamily = useMemo(() => {
    return SUNO_STYLE_PRESETS.reduce((counts, preset) => {
      counts[preset.familyId] = (counts[preset.familyId] || 0) + 1;
      return counts;
    }, {});
  }, []);
  const presetGroupsByFamily = useMemo(() => {
    return SUNO_STYLE_PRESETS.reduce((families, preset) => {
      if (!families[preset.familyId]) {
        families[preset.familyId] = [];
      }

      let group = families[preset.familyId].find((item) => item.genre === preset.genre);
      if (!group) {
        group = {
          genre: preset.genre,
          presets: [],
        };
        families[preset.familyId].push(group);
      }

      group.presets.push(preset);
      return families;
    }, {});
  }, []);
  const selectedPreset = useMemo(
    () => SUNO_STYLE_PRESETS.find((preset) => preset.id === selectedPresetId) || null,
    [selectedPresetId]
  );
  const visiblePresetGroups = presetGroupsByFamily[selectedPresetFamily] || [];

  async function requestPromptGeneration(userPrompt) {
    const response = await fetch("/api/gemini-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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

    return getGeneratedText(result) || "생성 결과가 비어 있습니다.";
  }

  function handleParseAnalysis() {
    try {
      const parsed = parseSonotellerText(analysisText);
      setParsedAnalysis(parsed);
      setError("");
    } catch (parseError) {
      setParsedAnalysis(null);
      setError(parseError instanceof Error ? parseError.message : "분석 데이터 추출 중 오류가 발생했습니다.");
    }
  }

  async function handleGenerate() {
    if (activeMode === "free" && !userInput.trim()) {
      setError("만들고 싶은 음악의 방향을 먼저 입력해주세요.");
      window.setTimeout(() => setError(""), 3000);
      return;
    }

    if (activeMode === "analysis" && !parsedAnalysis) {
      setError("먼저 Sonoteller 분석 데이터를 추출해주세요.");
      window.setTimeout(() => setError(""), 3000);
      return;
    }

    if (activeMode === "preset") {
      if (!selectedPreset) {
        setError("오른쪽 목록에서 적용할 프리셋을 먼저 선택해주세요.");
        window.setTimeout(() => setError(""), 3000);
        return;
      }

      setGeneratedPrompt(selectedPreset.prompt);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedPrompt("");

    try {
      const promptText =
        activeMode === "free"
          ? buildFreeInputPrompt(userInput)
          : buildAnalysisPrompt(parsedAnalysis);

      const text = await requestPromptGeneration(promptText);
      setGeneratedPrompt(text);
    } catch (generationError) {
      console.error(generationError);
      setError(generationError instanceof Error ? generationError.message : "프롬프트 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setUserInput("");
    setAnalysisText("");
    setParsedAnalysis(null);
    setSelectedPresetFamily(SUNO_PRESET_FAMILIES[0]?.id || "");
    setSelectedPresetId("");
    setGeneratedPrompt("");
    setError("");
  }

  function handlePresetSelect(preset) {
    setSelectedPresetId(preset.id);
    setGeneratedPrompt(preset.prompt);
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
          <CopyButton label="생성 결과 복사" value={generatedPrompt.trim()} disabled={!generatedPrompt.trim()} fullWidth />
          <CopyButton label="원본 규칙 복사" value={content.trim()} fullWidth />
          <CopyButton label="분석 JSON 복사" value={parsedAnalysis ? JSON.stringify(parsedAnalysis, null, 2) : ""} disabled={!parsedAnalysis} fullWidth />
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">Suno Generator</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">입력 방식을 선택해 Suno 프롬프트를 생성하세요.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                자유 입력, Sonoteller 분석 붙여넣기, PDF 기반 스타일 프리셋 중 원하는 방식으로 결과를 만들 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetAll}
                className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || (activeMode === "preset" && !selectedPreset)}
                className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "생성 중..." : activeMode === "preset" ? "선택한 프리셋 적용" : "프롬프트 만들기"}
              </button>
            </div>
          </div>

          <div className="mt-6 inline-flex rounded-full border border-black/8 bg-white/75 p-2">
            <button
              type="button"
              onClick={() => setActiveMode("free")}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeMode === "free" ? "bg-[var(--accent)] text-white" : "text-slate-500"}`}
            >
              사용자 자유 입력
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("analysis")}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeMode === "analysis" ? "bg-[var(--accent)] text-white" : "text-slate-500"}`}
            >
              기존 유튜브 영상에서 스타일 추출하기
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("preset")}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeMode === "preset" ? "bg-[var(--accent)] text-white" : "text-slate-500"}`}
            >
              음악스타일100종프리셋
            </button>
          </div>

          {activeMode === "free" ? (
            <div className="mt-5 grid gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">만들고 싶은 음악의 장르와 분위기, 장르, 가수 보컬 등을 설정해 주세요.</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  ex) 비 오는 날 창밖을 보며 마시는 커피 같은 느낌. 차분하고 좀 우울한데 세련된 재즈 힙합으로 만들어줘. 여자 보컬.
                </p>
              </div>
              <textarea
                rows={6}
                value={userInput}
                onChange={(event) => setUserInput(event.target.value)}
                className="rounded-[1.5rem] border border-black/8 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-[var(--accent)]"
                placeholder="만들고 싶은 음악의 무드, 장르, 보컬, 질감, 참고하고 싶은 분위기를 자유롭게 적어주세요."
              />
            </div>
          ) : activeMode === "analysis" ? (
            <div className="mt-5 grid gap-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <div className="grid gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Sonoteller 분석 결과 붙여넣기</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Sonoteller를 새 창에서 열어 유튜브 주소를 분석한 뒤, 거기서 나온 `LYRICS ANALYSIS` / `MUSIC ANALYSIS` 원문을 복사해 여기 붙여넣는 흐름입니다.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-[var(--accent)]/14 bg-[var(--accent-soft)] p-4 text-sm leading-7 text-slate-700">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent-strong)]">사용 순서</p>
                    <ol className="mt-3 list-decimal space-y-1 pl-5">
                      <li>`Sonoteller 열기` 버튼으로 새 창을 엽니다.</li>
                      <li>그곳에 유튜브 주소를 넣고 분석 결과가 나올 때까지 기다립니다.</li>
                      <li>분석 결과 전체 텍스트를 복사해서 아래 textarea에 붙여넣습니다.</li>
                      <li>`분석 데이터 추출`을 눌러 JSON으로 정리한 뒤 `프롬프트 만들기`를 누릅니다.</li>
                    </ol>
                  </div>
                  <textarea
                    rows={12}
                    value={analysisText}
                    onChange={(event) => setAnalysisText(event.target.value)}
                    className="rounded-[1.5rem] border border-black/8 bg-white px-4 py-4 font-mono text-sm leading-7 text-slate-800 outline-none transition focus:border-[var(--accent)]"
                    placeholder={`LYRICS ANALYSIS\nSummary\n...\nMoods\nFrustration (80), Exhaustion (75)\nThemes\nModernity (85), Work-life balance (80)\nMUSIC ANALYSIS\nGenres\nPop (85), Hip Hop (75)\nBPM & Key\n112.35BPM, F Major\nVocals\nMid/High pitch`}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={openSonotellerWindow}
                      className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-strong)]"
                    >
                      Sonoteller 열기
                    </button>
                    <button
                      type="button"
                      onClick={handleParseAnalysis}
                      className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      분석 데이터 추출
                    </button>
                    <CopyButton label="분석 원문 복사" value={analysisText.trim()} disabled={!analysisText.trim()} />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-black/8 bg-white/75 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">Parsed JSON</p>
                      <h3 className="mt-2 text-lg font-black text-slate-900">구조화된 분석 데이터</h3>
                    </div>
                    <CopyButton label="JSON 복사" value={parsedAnalysis ? JSON.stringify(parsedAnalysis, null, 2) : ""} disabled={!parsedAnalysis} />
                  </div>

                  {parsedAnalysis ? (
                    <div className="mt-5 space-y-5">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Summary</p>
                        <p className="mt-2 text-sm leading-7 text-slate-700">{parsedAnalysis.lyrics?.summary}</p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Moods</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(parsedAnalysis.lyrics?.moods || []).map((item) => <ScoreBadge key={`${item.label}-${item.score}`} item={item} />)}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Themes</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(parsedAnalysis.lyrics?.themes || []).map((item) => <ScoreBadge key={`${item.label}-${item.score}`} item={item} />)}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1.25rem] border border-black/8 bg-slate-50 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Language</p>
                          <p className="mt-2 text-lg font-black text-slate-900">{parsedAnalysis.lyrics?.language || "-"}</p>
                        </div>
                        <div className="rounded-[1.25rem] border border-black/8 bg-slate-50 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Explicit</p>
                          <p className="mt-2 text-lg font-black text-slate-900">{parsedAnalysis.lyrics?.explicit || "-"}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1.25rem] border border-[var(--accent)]/14 bg-[var(--accent-soft)] p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent-strong)]">BPM & Key</p>
                          <p className="mt-2 text-lg font-black text-slate-900">{parsedAnalysis.music?.bpm} BPM</p>
                          <p className="mt-1 text-sm font-semibold text-slate-600">{parsedAnalysis.music?.key}</p>
                        </div>
                        <div className="rounded-[1.25rem] border border-black/8 bg-slate-50 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Vocals</p>
                          <p className="mt-2 text-lg font-black text-slate-900">{parsedAnalysis.music?.vocals}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Genres</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(parsedAnalysis.music?.genres || []).map((genre) => (
                            <div key={genre} className="rounded-full border border-black/8 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                              {genre}
                            </div>
                          ))}
                        </div>
                      </div>

                      {parsedAnalysis.music?.subgenres?.length ? (
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Subgenres</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(parsedAnalysis.music?.subgenres || []).map((genre) => (
                              <div key={genre} className="rounded-full border border-black/8 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                                {genre}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {parsedAnalysis.music?.moods?.length ? (
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Music Moods</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(parsedAnalysis.music?.moods || []).map((item) => <ScoreBadge key={`${item.label}-${item.score}-music`} item={item} />)}
                          </div>
                        </div>
                      ) : null}

                      {parsedAnalysis.music?.instruments?.length ? (
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Instruments</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(parsedAnalysis.music?.instruments || []).map((instrument) => (
                              <div key={instrument} className="rounded-full border border-black/8 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                                {instrument}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-5 flex min-h-[260px] items-center justify-center rounded-[1.25rem] border border-dashed border-black/8 bg-slate-50/80 p-6 text-center text-sm leading-7 text-slate-500">
                      분석 데이터를 추출하면 moods, themes, genres, BPM, key, vocals가 여기 카드 형태로 정리됩니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">1뎁스 카테고리</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    PDF에 포함된 프리셋을 장르 성격 기준으로 1차 분류했습니다. 카테고리를 누르면 우측에 세부 프리셋이 표시됩니다.
                    원문 PDF에는 실제로 300개 프리셋이 수록되어 있어 모두 반영했습니다.
                  </p>
                </div>
                <div className="space-y-3">
                  {SUNO_PRESET_FAMILIES.map((family) => (
                    <PresetFamilyButton
                      key={family.id}
                      family={family}
                      count={presetCountByFamily[family.id] || 0}
                      active={selectedPresetFamily === family.id}
                      onClick={() => setSelectedPresetFamily(family.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-black/8 bg-white/75 p-5">
                <div className="flex flex-col gap-3 border-b border-black/6 pb-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">Preset Library</p>
                    <h3 className="mt-2 text-lg font-black text-slate-900">
                      {SUNO_PRESET_FAMILIES.find((family) => family.id === selectedPresetFamily)?.label || "프리셋"}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      우측 프리셋 카드의 `선택` 버튼을 누르면 API 호출 없이 하단 Generated Prompt 영역에 영문 프롬프트가 즉시 반영됩니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-full border border-black/8 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                      총 {visiblePresetGroups.reduce((count, group) => count + group.presets.length, 0)}개
                    </div>
                    <CopyButton
                      label="선택 프롬프트 복사"
                      value={selectedPreset?.prompt || ""}
                      disabled={!selectedPreset}
                    />
                  </div>
                </div>

                {selectedPreset ? (
                  <div className="mt-4 rounded-[1.25rem] border border-[var(--accent)]/14 bg-[var(--accent-soft)] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent-strong)]">현재 선택</p>
                    <p className="mt-2 text-base font-black text-slate-900">
                      {selectedPreset.genre} · {selectedPreset.title}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-600">{selectedPreset.prompt}</p>
                  </div>
                ) : null}

                <div className="app-scrollbar mt-5 max-h-[820px] overflow-auto pr-1">
                  <div className="space-y-5">
                    {visiblePresetGroups.map((group) => (
                      <section key={group.genre} className="space-y-3">
                        <div className="sticky top-0 z-10 rounded-2xl border border-black/6 bg-[var(--surface)]/95 px-4 py-3 backdrop-blur">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-900">{group.genre}</p>
                              <p className="mt-1 text-xs text-slate-500">{group.presets.length}개 프리셋</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {group.presets.map((preset) => (
                            <PresetCard
                              key={preset.id}
                              preset={preset}
                              selected={selectedPresetId === preset.id}
                              onSelect={() => handlePresetSelect(preset)}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="mt-4 min-h-5 text-sm font-semibold text-rose-500">{error}</p>
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
                  <p className="mt-2 text-sm">상단 탭에서 입력 방식을 선택한 뒤 프롬프트를 만들어보세요.</p>
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
