"use client";

import { useState } from "react";

function CopyButton({ label, value, fullWidth = false }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
        copied
          ? "bg-emerald-600 text-white"
          : "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]"
      } ${fullWidth ? "w-full" : ""}`}
    >
      {copied ? "복사 완료" : label}
    </button>
  );
}

export function PromptDocument({ title, description, tags, content, sectionLabel }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
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
          <CopyButton label="본문 복사" value={content.trim()} fullWidth />
          <CopyButton label="제목 + 본문 복사" value={`${title}\n\n${content.trim()}`} fullWidth />
        </div>
      </aside>

      <section className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Prompt Body</p>
            <p className="mt-2 text-sm text-slate-500">{content.split("\n").length} lines</p>
          </div>
        </div>
        <pre className="app-scrollbar max-h-[calc(100vh-12rem)] overflow-auto rounded-[1.5rem] border border-black/6 bg-[var(--surface-strong)] p-5 text-sm leading-7 whitespace-pre-wrap text-slate-800 font-mono">
          {content.trim()}
        </pre>
      </section>
    </div>
  );
}
