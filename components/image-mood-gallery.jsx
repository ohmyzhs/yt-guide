"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

function CopyToast({ visible, message }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[80] rounded-full bg-slate-950/90 px-4 py-3 text-sm font-bold text-white shadow-2xl transition ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none"
      }`}
    >
      {message}
    </div>
  );
}

export function ImageMoodGallery({ data }) {
  const [viewerMode, setViewerMode] = useState("detail");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const item = data[currentIndex];

  const total = data.length;

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key === "ArrowLeft") setCurrentIndex((index) => (index - 1 + total) % total);
      if (event.key === "ArrowRight") setCurrentIndex((index) => (index + 1) % total);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, total]);

  const subtitle = useMemo(() => `${data.length}개의 스타일 카드를 탐색하고 프롬프트를 바로 복사하세요.`, [data.length]);

  async function copyText(value) {
    await navigator.clipboard.writeText(value);
    setToast("프롬프트를 복사했습니다.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">Image Prompt Vault</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">이미지 분위기 프롬프트</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{subtitle}</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/8 bg-white/70 p-2">
            <span className="px-3 text-xs font-bold text-slate-400">열기 방식</span>
            <button
              type="button"
              onClick={() => setViewerMode("detail")}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${viewerMode === "detail" ? "bg-sky-600 text-white" : "text-slate-500"}`}
            >
              카드형 상세
            </button>
            <button
              type="button"
              onClick={() => setViewerMode("fullscreen")}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${viewerMode === "fullscreen" ? "bg-sky-600 text-white" : "text-slate-500"}`}
            >
              풀뷰 캐러셀
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {data.map((galleryItem, index) => (
          <article
            key={galleryItem.id}
            className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-slate-950 text-white shadow-[0_20px_48px_rgba(2,6,23,0.22)] transition hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(2,6,23,0.28)]"
          >
            <button type="button" className="block w-full text-left" onClick={() => { setCurrentIndex(index); setIsOpen(true); }}>
              <div className="relative aspect-square overflow-hidden bg-slate-900">
                <Image
                  src={galleryItem.image}
                  alt={galleryItem.name}
                  fill
                  sizes="(min-width: 1536px) 22vw, (min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </button>
            <div className="space-y-3 p-4">
              <div>
                <h3 className="text-base font-bold">{galleryItem.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/58">{galleryItem.prompt}</p>
              </div>
              <button
                type="button"
                onClick={() => copyText(galleryItem.prompt)}
                className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-500"
              >
                프롬프트 복사
              </button>
            </div>
          </article>
        ))}
      </section>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] bg-[#020617]/88 backdrop-blur-lg" onClick={(event) => event.target === event.currentTarget && setIsOpen(false)}>
          <button type="button" onClick={() => setIsOpen(false)} className="absolute right-5 top-5 z-[71] h-12 w-12 rounded-full bg-white/10 text-xl text-white">
            ✕
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => (index - 1 + total) % total)}
            className="absolute left-5 top-1/2 z-[71] h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-2xl text-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => (index + 1) % total)}
            className="absolute right-5 top-1/2 z-[71] h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-2xl text-white"
          >
            ›
          </button>

          {viewerMode === "fullscreen" ? (
            <div className="flex h-full flex-col">
              <div className="relative flex min-h-0 flex-1 items-center justify-center px-6 pb-56 pt-20">
                <div className="relative h-full w-full">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="100vw"
                    className="object-contain drop-shadow-[0_24px_60px_rgba(0,0,0,0.42)]"
                  />
                </div>
              </div>
              <div className="absolute inset-x-6 bottom-6 rounded-[1.75rem] border border-white/12 bg-slate-950/72 p-6 backdrop-blur-xl">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-400">Scene Reference</p>
                    <h2 className="mt-2 text-2xl font-black">{item.name}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(item.prompt)}
                    className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-500"
                  >
                    프롬프트 복사
                  </button>
                </div>
                <p className="app-scrollbar mt-4 max-h-32 overflow-auto text-sm leading-7 text-white/78">{item.prompt}</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto grid h-full max-w-[1500px] grid-cols-1 overflow-hidden px-6 py-20 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
              <div className="relative flex min-h-0 items-center justify-center rounded-l-[2rem] bg-slate-950 p-6">
                <div className="relative h-full min-h-[60vh] w-full">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1280px) 60vw, 100vw"
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex min-h-0 flex-col rounded-r-[2rem] bg-slate-900 p-8">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-400">Prompt</p>
                <h2 className="mt-3 text-3xl font-black">{item.name}</h2>
                <div className="app-scrollbar mt-6 min-h-0 flex-1 overflow-auto rounded-[1.5rem] border border-white/8 bg-black/20 p-5 text-sm leading-7 text-white/82">
                  {item.prompt}
                </div>
                <button
                  type="button"
                  onClick={() => copyText(item.prompt)}
                  className="mt-5 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-500"
                >
                  프롬프트 복사
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <CopyToast visible={Boolean(toast)} message={toast} />
    </div>
  );
}
