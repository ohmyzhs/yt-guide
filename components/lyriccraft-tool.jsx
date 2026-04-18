"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MUSIC_WORKSPACE_KEYS,
  clearLyricCraftDraft,
  saveLyricCraftDraft,
  usePersistedJsonState,
} from "@/lib/music-workspace";

const GENRES = [
  "기독교/가스펠", "뉴에이지", "댄스", "독일팝", "독일포크", "동요",
  "라틴", "레게", "록", "보컬", "블루스", "빅밴드", "사운드트랙",
  "스포큰 워드", "싱어송라이터", "아프로비트", "아프로팝", "얼터너티브",
  "월드뮤직", "일렉트로닉", "재즈", "컨트리", "코미디", "팝",
  "펑크", "포크", "프렌치팝", "피트니스&운동", "홀리데이", "J-pop", "Kpop",
];

const ELECTRONIC_SUBGENRES = [
  "빅룸", "브레이크비트", "칠 아웃", "딥 하우스", "드럼 앤 베이스", "덥스텝",
  "일렉트로하우스", "일렉트로니카/다운템포", "펑크/소울/디스코", "글리치 합",
  "하드 댄스", "하드코어/하드 테크노", "힙합/R&B", "하우스", "인디 댄스/누 디스코",
  "미니멀/딥 테크", "프로그레시브 하우스", "싸이 트랜스", "레게/댄스홀/덥",
  "테크 하우스", "테크노", "트랜스",
];

const LANGUAGES = ["한국어", "영어", "한국어 70% 영어 30%", "영어 70% 한국어 30%"];
const MOODS = ["몽환적인", "에너제틱한", "우울하고 슬픈", "희망찬", "섹시한", "분노에 찬", "차분하고 고요한", "로맨틱한", "장난스러운", "웅장한"];
const STRUCTURES = [
  "Standard (Intro - Verse 1 - Chorus - Verse 2 - Chorus - Bridge - Chorus - Outro)",
  "Simple (Verse 1 - Chorus - Verse 2 - Chorus)",
  "Extended (Intro - Verse 1 - Pre-Chorus - Chorus - Verse 2 - Pre-Chorus - Chorus - Bridge - Chorus - Outro)",
  "Storytelling (Verse 1 - Verse 2 - Verse 3 - Outro)",
  "EDM Style (Intro - Build Up - Drop - Verse - Build Up - Drop - Outro)",
];

const initialConfig = {
  title: "",
  genre: "팝",
  subGenre: ELECTRONIC_SUBGENRES[0],
  language: LANGUAGES[0],
  chorusLanguage: LANGUAGES[0],
  mood: MOODS[0],
  structure: STRUCTURES[0],
  bpm: 120,
  duration: "03:30",
  motive: "",
};

function FieldLabel({ children, accent = false }) {
  return <span className={`text-sm font-bold ${accent ? "text-indigo-700" : "text-slate-700"}`}>{children}</span>;
}

export function LyricCraftTool() {
  const [config, setConfig] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.lyricCraftForm, initialConfig);
  const [lyrics, setLyrics] = usePersistedJsonState(MUSIC_WORKSPACE_KEYS.lyricCraftOutput, "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isElectronic = useMemo(() => config.genre.includes("일렉트로닉"), [config.genre]);

  useEffect(() => {
    saveLyricCraftDraft({
      title: config.title,
      genre: config.genre,
      electronicSub: config.subGenre,
      mood: config.mood,
      lyrics,
    });
  }, [config.title, config.genre, config.subGenre, config.mood, lyrics]);

  async function handleGenerate() {
    if (!config.motive.trim()) {
      setError("가사의 모티브를 입력해주세요.");
      window.setTimeout(() => setError(""), 4000);
      return;
    }

    setLoading(true);
    setLyrics("");
    setError("");

    const systemPrompt = `당신은 전문 작사가입니다. 사용자가 제공하는 설정을 바탕으로 고퀄리티의 음악 가사를 작성하세요.
가사는 음악적 운율과 감성을 담아야 하며, 지정된 구조를 엄격히 따라야 합니다.
특히 전체 가사 언어 설정과 코러스(Chorus) 전용 언어 설정이 다를 경우 이를 정확히 반영하여 작성하세요.`;

    const userQuery = `
다음 조건에 맞는 노래 가사를 작성해줘:
1. 곡 제목: ${config.title || "미정"}
2. 장르: ${config.genre} ${isElectronic ? `(서브장르: ${config.subGenre})` : ""}
3. 전체 가사 언어: ${config.language}
4. 코러스(Chorus) 전용 언어: ${config.chorusLanguage}
5. 분위기: ${config.mood}
6. 가사 구성: ${config.structure}
7. 곡 정보: BPM ${config.bpm}, 예상 길이 ${config.duration}
8. 가사 모티브: ${config.motive}

각 섹션([Intro], [Verse 1], [Chorus] 등)을 명확히 구분하고, 모티브가 자연스럽게 녹아나게 해줘.`;

    try {
      const response = await fetch("/api/gemini-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: {
            contents: [{ role: "user", parts: [{ text: userQuery }] }],
            systemInstruction: {
              role: "system",
              parts: [{ text: systemPrompt }],
            },
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.details?.error?.message || result?.error || `API 오류: ${response.status}`);
      }

      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "가사를 생성하지 못했습니다.";
      setLyrics(generatedText);
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError instanceof Error ? fetchError.message : "가사 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (!lyrics) return;
    await navigator.clipboard.writeText(lyrics);
    window.alert("가사가 클립보드에 복사되었습니다.");
  }

  function resetWorkspace() {
    setConfig(initialConfig);
    setLyrics("");
    setError("");
    clearLyricCraftDraft();
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(340px,460px)_minmax(0,1fr)]">
      <section className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">Music Production</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">가사 만들기</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            LyricCraft AI를 React 페이지로 이식한 가사 생성기입니다. 페이지를 이동해도 입력값과 결과를 유지하며, 필요할 때만 초기화할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-4">
          <label className="grid min-w-0 gap-2">
            <FieldLabel>곡 제목</FieldLabel>
            <input
              type="text"
              value={config.title}
              onChange={(event) => setConfig((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full min-w-0 rounded-2xl border border-black/8 bg-white px-4 py-3"
              placeholder="예: Midnight Rain Coffee"
            />
          </label>

          <label className="grid min-w-0 gap-2">
            <FieldLabel>장르 선택</FieldLabel>
            <select className="w-full min-w-0 rounded-2xl border border-black/8 bg-white px-4 py-3" value={config.genre} onChange={(event) => setConfig((prev) => ({ ...prev, genre: event.target.value }))}>
              {GENRES.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
            </select>
          </label>

          {isElectronic ? (
            <label className="grid min-w-0 gap-2">
              <FieldLabel>일렉트로닉 세부 장르</FieldLabel>
              <select className="w-full min-w-0 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3" value={config.subGenre} onChange={(event) => setConfig((prev) => ({ ...prev, subGenre: event.target.value }))}>
                {ELECTRONIC_SUBGENRES.map((subGenre) => <option key={subGenre} value={subGenre}>{subGenre}</option>)}
              </select>
            </label>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid min-w-0 gap-2">
              <FieldLabel>가사 언어</FieldLabel>
              <select className="w-full min-w-0 rounded-2xl border border-black/8 bg-white px-4 py-3" value={config.language} onChange={(event) => setConfig((prev) => ({ ...prev, language: event.target.value }))}>
                {LANGUAGES.map((language) => <option key={language} value={language}>{language}</option>)}
              </select>
            </label>
            <label className="grid min-w-0 gap-2">
              <FieldLabel accent>코러스 언어</FieldLabel>
              <select className="w-full min-w-0 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3" value={config.chorusLanguage} onChange={(event) => setConfig((prev) => ({ ...prev, chorusLanguage: event.target.value }))}>
                {LANGUAGES.map((language) => <option key={language} value={language}>{language}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid min-w-0 gap-2">
              <FieldLabel>분위기</FieldLabel>
              <select className="w-full min-w-0 rounded-2xl border border-black/8 bg-white px-4 py-3" value={config.mood} onChange={(event) => setConfig((prev) => ({ ...prev, mood: event.target.value }))}>
                {MOODS.map((mood) => <option key={mood} value={mood}>{mood}</option>)}
              </select>
            </label>
            <label className="grid min-w-0 gap-2">
              <FieldLabel>곡 길이</FieldLabel>
              <input type="text" value={config.duration} onChange={(event) => setConfig((prev) => ({ ...prev, duration: event.target.value }))} className="w-full min-w-0 rounded-2xl border border-black/8 bg-white px-4 py-3" />
            </label>
          </div>

          <label className="grid min-w-0 gap-2">
            <FieldLabel>곡 구성</FieldLabel>
            <select className="w-full min-w-0 rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm" value={config.structure} onChange={(event) => setConfig((prev) => ({ ...prev, structure: event.target.value }))}>
              {STRUCTURES.map((structure) => <option key={structure} value={structure}>{structure}</option>)}
            </select>
          </label>

          <label className="grid min-w-0 gap-2">
            <FieldLabel>BPM ({config.bpm})</FieldLabel>
            <input type="range" min="60" max="200" step="1" value={config.bpm} onChange={(event) => setConfig((prev) => ({ ...prev, bpm: Number(event.target.value) }))} className="accent-[var(--accent)]" />
          </label>

          <label className="grid min-w-0 gap-2">
            <FieldLabel>가사 모티브</FieldLabel>
            <textarea rows={6} value={config.motive} onChange={(event) => setConfig((prev) => ({ ...prev, motive: event.target.value }))} className="w-full min-w-0 rounded-[1.5rem] border border-black/8 bg-white px-4 py-4 text-sm leading-7" placeholder="영화 장면, 감정, 스토리 모티브를 입력하세요." />
          </label>

          <p className="min-h-5 text-xs font-bold text-rose-500">{error}</p>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleGenerate} disabled={loading} className="rounded-[1.25rem] bg-indigo-600 px-5 py-4 text-sm font-black text-white transition hover:bg-indigo-500 disabled:opacity-60">
              {loading ? "가사 생성 중..." : "가사 생성하기"}
            </button>
            <button type="button" onClick={resetWorkspace} className="rounded-[1.25rem] border border-black/8 bg-white px-5 py-4 text-sm font-black text-slate-600 transition hover:bg-slate-50">
              초기화
            </button>
          </div>
        </div>
      </section>

      <section className="flex min-h-[640px] flex-col overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-[0_28px_70px_rgba(2,6,23,0.28)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/70 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-400">Generated Lyrics</p>
            <p className="mt-1 text-sm text-white/45">LyricCraft AI output</p>
          </div>
          <button type="button" onClick={copyToClipboard} disabled={!lyrics} className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-bold text-white/70 disabled:opacity-40">복사</button>
        </div>
        <div className="app-scrollbar flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,#1e293b_0%,#0f172a_100%)] px-6 py-6 text-slate-200">
          {loading ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 text-slate-400">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              <p className="animate-pulse">AI가 가사를 짓고 있습니다...</p>
            </div>
          ) : lyrics ? (
            <pre className="whitespace-pre-wrap text-base leading-8">{lyrics}</pre>
          ) : (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 text-center text-slate-500">
              <div className="text-6xl opacity-20">♫</div>
              <div>
                <h3 className="text-lg font-bold text-slate-300">가사 엔진 준비됨</h3>
                <p className="mt-2 text-sm">입력값은 페이지를 이동해도 유지됩니다. 필요하면 초기화 버튼으로만 지워주세요.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
