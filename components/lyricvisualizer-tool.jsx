"use client";

import { useMemo, useState } from "react";

const GENRES = [
  "기독교/가스펠", "뉴에이지", "댄스", "독일팝", "독일포크", "동요", "라틴", "레게", "록", "보컬", "블루스",
  "빅밴드", "사운드트랙", "스포큰 워드", "싱어송라이터", "아프로비트", "아프로팝", "얼터너티브", "월드뮤직",
  "일렉트로닉", "재즈", "컨트리", "코미디", "팝", "펑크", "포크", "프렌치팝", "피트니스&운동", "홀리데이", "J-pop", "K-pop",
];

const ELECTRONIC_SUBGENRES = [
  "Big Room", "Blackbeat", "Chill Out", "Deep House", "Drum & Bass", "Dubstep", "Electro House",
  "Electronica / Downtempo", "Funk / Soul / Disco", "Glitch Hop", "Hard Dance", "Hardcore / Hard Techno",
  "Hip Hop / R&B", "House", "Indie Dance / Nu Disco", "Minimal / Deep Techno", "Progressive House",
  "Psy Trance", "Reggae / Dancehall / Dub", "Tech House", "Techno", "Trance",
];

const VISUAL_STYLES = [
  "Hyper-realistic Cinematic Movie, 8k, photorealistic, ultra detailed live action",
  "Strict 3D Disney Pixar Animation style, cute characters, bright lighting, volumetric lighting, no live action elements",
  "2D Japanese Anime style, Makoto Shinkai aesthetic, gorgeous scenery, detailed background",
  "Cyberpunk Futurism, neon lights, high tech low life, rainy streets",
  "Vintage 16mm Film, grainy texture, nostalgic colors, film burn",
  "Abstract Dreamcore, surrealistic, weirdcore aesthetic, floating elements",
  "Impressionist Oil Painting, thick brushstrokes, artistic texture",
  "Low-poly PS1 Game aesthetic, pixelated, retro 3D",
  "Noir Movie style, high contrast, black and white, dramatic shadows",
  "Ukiyo-e Japanese Woodblock print style, traditional composition",
];

const MOODS = ["로맨틱", "몽환적인", "에너제틱한", "우울하고 슬픈", "희망찬", "섹시한", "분노에 찬", "차분하고 고요한", "장난스러운", "웅장한", "신비롭고 영적인", "열정적인", "그리운/노스탤직"];
const TIMELINES = ["Historical/Past", "Modern/Present", "Sci-fi/Future"];

const initialState = {
  songTitle: "",
  genre: "일렉트로닉",
  electronicSub: "Big Room",
  mood: "로맨틱",
  visualStyle: VISUAL_STYLES[0],
  timeline: "Modern/Present",
  outputMode: "both",
  char1_age: "20s",
  char1_race: "Korean",
  char1_gender: "Male",
  char2_age: "None",
  char2_race: "Korean",
  char2_gender: "Female",
  lyrics: "",
};

function OutputPanel({ panelKey, panel, activeTab, onSwitchTab }) {
  const imagePrompts = panel.data.image_prompts || [];
  const videoPrompts = panel.data.video_prompts || [];
  const entries = activeTab === "image" ? imagePrompts : videoPrompts;

  async function copyAll(type) {
    const list = type === "image" ? imagePrompts : videoPrompts;
    const text = list.map((item) => item.prompt.trim()).join("\n\n\n");
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    window.alert("모든 프롬프트가 복사되었습니다.");
  }

  async function copyOne(prompt) {
    await navigator.clipboard.writeText(prompt);
  }

  return (
    <section className="space-y-4 rounded-[2rem] border border-slate-800 bg-slate-950 p-5 shadow-[0_28px_70px_rgba(2,6,23,0.28)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-400">{panel.label}</p>
          <h3 className="mt-2 text-xl font-black text-white">
            이미지 {imagePrompts.length}개 / 영상 {videoPrompts.length}개
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => copyAll("image")} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">이미지 전체 복사</button>
          <button type="button" onClick={() => copyAll("video")} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">영상 전체 복사</button>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onSwitchTab(panelKey, "image")} className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold ${activeTab === "image" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400"}`}>
          Midjourney 이미지 프롬프트
        </button>
        <button type="button" onClick={() => onSwitchTab(panelKey, "video")} className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold ${activeTab === "video" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400"}`}>
          Luma/Runway 영상 프롬프트
        </button>
      </div>
      <div className="app-scrollbar max-h-[68vh] overflow-auto pr-1">
        <div className="space-y-4">
          {entries.map((item, index) => (
            <article key={`${panelKey}-${activeTab}-${index}`} className="rounded-[1.5rem] border-l-4 border-l-sky-500 bg-white/4 p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-400">Scene {String(index + 1).padStart(2, "0")}</p>
                  <h4 className="mt-1 text-sm font-bold text-white">{item.scene_name}</h4>
                </div>
                <button type="button" onClick={() => copyOne(item.prompt)} className="rounded-xl bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-300">
                  COPY
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-[1rem] border border-white/5 bg-black/35 p-4 text-xs leading-7 text-slate-300">{item.prompt}</pre>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LyricVisualizerTool() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeTabs, setActiveTabs] = useState({});
  const fullGenre = useMemo(() => form.genre === "일렉트로닉" ? `${form.genre} (${form.electronicSub})` : form.genre, [form.genre, form.electronicSub]);

  function buildSystemPrompt(mode) {
    if (mode === "en") {
      return `You are a world-class cinematic prompt engineer for high-end AI music video production (Midjourney + Luma/Runway).
Analyze the lyrics and all settings carefully. Create a rich, emotionally coherent storyboard with **exactly 40 scenes**.

PROJECT CONTEXT:
- Song Title: ${form.songTitle || "No Title"}
- Genre: ${fullGenre}
- Mood/Atmosphere: ${form.mood}
- Selected Visual Style: ${form.visualStyle}
- Era/Timeline: ${form.timeline}
- Main Character 1: Age: ${form.char1_age}, Race: ${form.char1_race}, Gender: ${form.char1_gender}
${form.char2_age === "None" ? "- Main Character 2: 없음 (단 한 명의 주인공만 등장)" : `- Main Character 2: Age: ${form.char2_age}, Race: ${form.char2_race}, Gender: ${form.char2_gender}`}

CRITICAL REQUIREMENTS:
1. Generate **exactly 40** logical, sequential scenes following the lyrical narrative flow.
2. Each **scene_name** must be written in **Korean** and be descriptive.
3. **All "prompt" fields (both image_prompts and video_prompts) must be written entirely in natural, highly detailed English.**
   - Never output any Korean text inside the prompt except for scene_name.
   - Structure each prompt as: Selected Visual Style + who + when + where + what + how + why + additional cinematic details.
4. Maintain the exact selected visual style strongly without overwriting it with generic cinematic terms.
5. If Main Character 2 is "없음", never include Character 2 in any scene.

OUTPUT FORMAT (Strict JSON only, no extra text):
{
  "image_prompts": [{"scene_name": "한국어 장면 제목", "prompt": "Very detailed English prompt here..."}],
  "video_prompts": [{"scene_name": "한국어 장면 제목", "prompt": "Very detailed English motion prompt here..."}]
}`;
    }

    return `You are a world-class cinematic prompt engineer for high-end AI music video production (Midjourney + Luma/Runway).
Analyze the lyrics and all settings carefully. Create a rich, emotionally coherent storyboard with **exactly 40 scenes**.

PROJECT CONTEXT:
- Song Title: ${form.songTitle || "No Title"}
- Genre: ${fullGenre}
- Mood/Atmosphere: ${form.mood}
- Selected Visual Style: ${form.visualStyle}
- Era/Timeline: ${form.timeline}
- Main Character 1: Age: ${form.char1_age}, Race: ${form.char1_race}, Gender: ${form.char1_gender}
${form.char2_age === "None" ? "- Main Character 2: 없음 (단 한 명의 주인공만 등장)" : `- Main Character 2: Age: ${form.char2_age}, Race: ${form.char2_race}, Gender: ${form.char2_gender}`}

CRITICAL REQUIREMENTS:
1. Generate **exactly 40** logical, sequential scenes following the lyrical narrative.
2. Each scene_name must be in **Korean** and descriptive.
3. 프롬프트는 반드시 다음 순서로 구성: 선택된 Visual Style + 누가 + 언제 + 어디서 + 무엇을 + 어떻게 + 왜 + 기타 세부 명령
4. Main Character 2가 "없음"인 경우, 모든 장면에서 Main Character 2를 절대 등장시키지 말 것. 오직 Main Character 1만으로 스토리를 구성.

OUTPUT FORMAT (Strict JSON only):
{
  "image_prompts": [{"scene_name": "한국어 장면 제목", "prompt": "프롬프트"}],
  "video_prompts": [{"scene_name": "한국어 장면 제목", "prompt": "프롬프트"}]
}`;
  }

  async function fetchGemini(payload, retries = 5) {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await fetch("/api/gemini-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({}));
        if (response.ok) return result;
        if (attempt === retries) {
          throw new Error(result?.details?.error?.message || result?.error || "API Error");
        }
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise((resolve) => window.setTimeout(resolve, 2 ** attempt * 1000));
      }
    }

    throw new Error("API Error");
  }

  async function requestPrompts(mode) {
    const systemPrompt = buildSystemPrompt(mode);
    const userQuery = `Song Lyrics to Process:\n${form.lyrics}`;
    const result = await fetchGemini({
      model: "gemini-2.5-flash",
      payload: {
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userQuery}` }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      },
    });
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("Empty response");
    return JSON.parse(content.trim().replace(/```json|```/g, "").trim());
  }

  async function generate() {
    if (!form.lyrics.trim()) {
      window.alert("가사를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setResults([]);
    try {
      if (form.outputMode === "both") {
        const [koData, enData] = await Promise.all([requestPrompts("ko"), requestPrompts("en")]);
        setResults([
          { key: "ko", label: "한글 프롬프트 출력", data: koData },
          { key: "en", label: "영어 프롬프트 출력", data: enData },
        ]);
        setActiveTabs({ ko: "image", en: "image" });
      } else {
        const data = await requestPrompts(form.outputMode);
        const key = form.outputMode;
        setResults([{ key, label: key === "ko" ? "한글 프롬프트 출력" : "영어 프롬프트 출력", data }]);
        setActiveTabs({ [key]: "image" });
      }
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(340px,460px)_minmax(0,1fr)]">
      <section className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">Music Production</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">뮤비이미지/영상 제작</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">LyricVisualizer Pro의 한글/영문 프롬프트 출력을 하나의 페이지에서 통합해 제어할 수 있게 재구성했습니다.</p>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">곡 정보</span>
            <input className="rounded-2xl border border-black/8 bg-white px-4 py-3" placeholder="제목 - 아티스트" value={form.songTitle} onChange={(event) => setForm((prev) => ({ ...prev, songTitle: event.target.value }))} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">장르</span>
              <select className="rounded-2xl border border-black/8 bg-white px-4 py-3" value={form.genre} onChange={(event) => setForm((prev) => ({ ...prev, genre: event.target.value }))}>
                {GENRES.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
              </select>
            </label>
            {form.genre === "일렉트로닉" ? (
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">일렉트로닉 서브장르</span>
                <select className="rounded-2xl border border-black/8 bg-white px-4 py-3" value={form.electronicSub} onChange={(event) => setForm((prev) => ({ ...prev, electronicSub: event.target.value }))}>
                  {ELECTRONIC_SUBGENRES.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
                </select>
              </label>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">분위기</span>
              <select className="rounded-2xl border border-black/8 bg-white px-4 py-3" value={form.mood} onChange={(event) => setForm((prev) => ({ ...prev, mood: event.target.value }))}>
                {MOODS.map((mood) => <option key={mood} value={mood}>{mood}</option>)}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">배경 시대</span>
              <select className="rounded-2xl border border-black/8 bg-white px-4 py-3" value={form.timeline} onChange={(event) => setForm((prev) => ({ ...prev, timeline: event.target.value }))}>
                {TIMELINES.map((timeline) => <option key={timeline} value={timeline}>{timeline}</option>)}
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">이미지 & 영상 스타일</span>
            <select className="rounded-2xl border border-black/8 bg-white px-4 py-3" value={form.visualStyle} onChange={(event) => setForm((prev) => ({ ...prev, visualStyle: event.target.value }))}>
              {VISUAL_STYLES.map((style) => <option key={style} value={style}>{style}</option>)}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">출력 모드</span>
            <select className="rounded-2xl border border-black/8 bg-white px-4 py-3" value={form.outputMode} onChange={(event) => setForm((prev) => ({ ...prev, outputMode: event.target.value }))}>
              <option value="ko">한글 프롬프트 출력</option>
              <option value="en">영어 프롬프트 출력</option>
              <option value="both">한글 + 영어 둘 다 출력</option>
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Main Character 1</span>
              <div className="grid grid-cols-3 gap-2">
                <select className="rounded-2xl border border-black/8 bg-white px-3 py-3 text-sm" value={form.char1_age} onChange={(event) => setForm((prev) => ({ ...prev, char1_age: event.target.value }))}>
                  {["Child", "Teenager", "20s", "30s", "Middle-aged"].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <select className="rounded-2xl border border-black/8 bg-white px-3 py-3 text-sm" value={form.char1_race} onChange={(event) => setForm((prev) => ({ ...prev, char1_race: event.target.value }))}>
                  {["Korean", "Western"].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <select className="rounded-2xl border border-black/8 bg-white px-3 py-3 text-sm" value={form.char1_gender} onChange={(event) => setForm((prev) => ({ ...prev, char1_gender: event.target.value }))}>
                  {["Male", "Female"].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Main Character 2</span>
              <div className="grid grid-cols-3 gap-2">
                <select className="rounded-2xl border border-black/8 bg-white px-3 py-3 text-sm" value={form.char2_age} onChange={(event) => setForm((prev) => ({ ...prev, char2_age: event.target.value }))}>
                  {["None", "Child", "Teenager", "20s", "30s", "Middle-aged"].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <select disabled={form.char2_age === "None"} className="rounded-2xl border border-black/8 bg-white px-3 py-3 text-sm disabled:opacity-50" value={form.char2_race} onChange={(event) => setForm((prev) => ({ ...prev, char2_race: event.target.value }))}>
                  {["Korean", "Western"].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <select disabled={form.char2_age === "None"} className="rounded-2xl border border-black/8 bg-white px-3 py-3 text-sm disabled:opacity-50" value={form.char2_gender} onChange={(event) => setForm((prev) => ({ ...prev, char2_gender: event.target.value }))}>
                  {["Male", "Female"].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Lyrics</span>
            <textarea rows={8} className="rounded-[1.5rem] border border-black/8 bg-white px-4 py-4 text-sm leading-7" placeholder="가사를 입력하세요..." value={form.lyrics} onChange={(event) => setForm((prev) => ({ ...prev, lyrics: event.target.value }))} />
          </label>

          <button type="button" onClick={generate} disabled={loading} className="rounded-[1.25rem] bg-sky-600 px-5 py-4 text-sm font-black text-white transition hover:bg-sky-500 disabled:opacity-60">
            {loading ? "프롬프트 생성 중..." : "프롬프트 40장면 생성"}
          </button>
        </div>
      </section>

      <section className="space-y-6">
        {loading ? (
          <div className="flex min-h-[560px] flex-col items-center justify-center rounded-[2rem] border border-slate-800 bg-slate-950 p-12 text-center shadow-[0_28px_70px_rgba(2,6,23,0.28)]">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            <p className="mt-6 text-xl font-bold text-sky-400">AI 감독이 시나리오를 구상 중입니다...</p>
            <p className="mt-3 text-sm text-slate-500">
              {form.outputMode === "both"
                ? "한글과 영어 프롬프트를 동시에 생성 중입니다. 약간 더 오래 걸릴 수 있습니다."
                : "약 20~40초 정도 소요될 수 있습니다. (40장면 고품질 생성)"}
            </p>
          </div>
        ) : results.length ? (
          results.map((panel) => (
            <OutputPanel
              key={panel.key}
              panelKey={panel.key}
              panel={panel}
              activeTab={activeTabs[panel.key] || "image"}
              onSwitchTab={(panelKey, tab) => setActiveTabs((prev) => ({ ...prev, [panelKey]: tab }))}
            />
          ))
        ) : (
          <div className="flex min-h-[560px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-700 bg-slate-950/72 p-12 text-center shadow-[0_28px_70px_rgba(2,6,23,0.28)]">
            <div className="text-5xl text-slate-700">▣</div>
            <h3 className="mt-5 text-xl font-bold text-slate-300">데이터 입력 대기 중</h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">왼쪽에서 곡 정보와 스타일, 주인공 설정을 입력한 뒤 생성 버튼을 누르면 이미지/영상 프롬프트가 여기 렌더링됩니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}
