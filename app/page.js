import { overviewCards } from "@/lib/site-content";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-7 shadow-[var(--shadow-lg)]">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">Overview</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.06em] text-slate-900">프롬프트 문서와 제작 도구를 하나의 사이드바 기반 워크스페이스로 재구성했습니다.</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
          기술 스택은 정적 HTML 묶음보다 Vercel에 더 맞는 <strong>Next.js App Router + React + Tailwind</strong>로 옮겼습니다.
          SQLite는 현재 정적 라이브러리와 생성 도구만 쓰는 구조에는 필요하지 않아 넣지 않았습니다.
          나중에 개인 기록, 히스토리, 즐겨찾기, 사용자 계정까지 저장할 때만 데이터베이스를 추가하는 편이 맞습니다.
        </p>
        <div className="mt-6 rounded-[1.6rem] border border-[var(--accent)]/15 bg-[var(--accent-soft)] px-5 py-4 text-sm leading-7 text-slate-700">
          이제 실제 진입과 이동은 모두 좌측 슬라이드 사이드바가 담당합니다. 홈 화면은 구조 설명과 카테고리 개요만 남기고,
          예전의 우측 바로가기 카드 역할은 사이드바 계층 메뉴로 흡수했습니다.
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {overviewCards.map((section) => (
          <article key={section.id} className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">{section.label}</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">{section.description}</h2>
              </div>
              <div className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-bold text-[var(--accent-strong)]">
                {section.count} items
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {section.items.map((item) => (
                <div key={item.id} className="rounded-[1.35rem] border border-black/8 bg-white/70 px-4 py-4">
                  <span className="block text-base font-bold text-slate-900">{item.label}</span>
                  <span className="mt-1 block text-sm text-slate-500">{item.kind === "prompt" ? "Prompt Document" : "Interactive Tool"}</span>
                  <span className="mt-3 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">좌측 메뉴에서 열기</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
