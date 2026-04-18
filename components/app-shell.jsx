"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { getPageMetaByPath, navigation } from "@/lib/site-content";

function SidebarGroup({ section, pathname, onNavigate }) {
  const [expanded, setExpanded] = useState(true);
  const isActiveGroup = section.items.some((item) => item.href === pathname);
  const isExpanded = expanded || isActiveGroup;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/4 p-3">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left transition hover:bg-white/6"
      >
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#f0b18f]">{section.label}</p>
          <p className="mt-1 text-xs text-white/55">{section.description}</p>
        </div>
        <span className="text-lg text-white/70">{isExpanded ? "−" : "+"}</span>
      </button>
      {isExpanded ? (
        <div className="mt-2 grid gap-1">
          {section.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onNavigate}
                className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-[#f0b18f]/14 text-white ring-1 ring-[#f0b18f]/30"
                    : "text-white/78 hover:bg-white/6 hover:text-white"
                }`}
              >
                <span className="block">{item.label}</span>
                <span className="mt-1 block text-[11px] font-medium text-white/45">
                  {item.kind === "prompt" ? "Prompt Document" : "Interactive Tool"}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export function AppShell({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageMeta = useMemo(() => getPageMetaByPath(pathname), [pathname]);

  return (
    <div className="min-h-screen">
      <div
        className={`fixed inset-0 z-40 bg-[#020617]/60 backdrop-blur-sm transition lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] overflow-y-auto border-r border-white/10 bg-[linear-gradient(180deg,#11212d_0%,#0b171f_100%)] px-5 py-6 text-white shadow-2xl transition-transform duration-300 app-scrollbar ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full"}`}
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f0b18f]">YT Guide</p>
            <h1 className="mt-2 text-2xl font-black tracking-[-0.04em]">Creative Workspace</h1>
            <p className="mt-2 text-sm leading-6 text-white/62">
              프롬프트와 제작 툴을 단일 사이드바에서 이동하는 구조로 재편한 최신 작업 셸
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-2xl border border-white/10 bg-white/6 p-2 text-white/70 lg:hidden"
          >
            ✕
          </button>
        </div>

        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className={`mb-5 flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
            pathname === "/"
              ? "border-[#f0b18f]/35 bg-[#f0b18f]/14 text-white"
              : "border-white/10 bg-white/5 text-white/78 hover:bg-white/8 hover:text-white"
          }`}
        >
          <div>
            <span className="block text-sm font-bold">워크스페이스 홈</span>
            <span className="block text-[11px] text-white/50">카테고리 요약과 빠른 진입</span>
          </div>
          <span className="text-lg">→</span>
        </Link>

        <div className="grid gap-3">
          {navigation.map((section) => (
            <SidebarGroup
              key={section.id}
              section={section}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </div>
      </aside>

      <div className={`min-h-screen transition-[margin] duration-300 ${sidebarOpen ? "lg:ml-[var(--sidebar-width)]" : "lg:ml-0"}`}>
        <header className="sticky top-0 z-30 border-b border-black/6 bg-[rgba(255,250,242,0.72)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/8 bg-white/75 text-lg text-slate-700 shadow-sm lg:hidden"
              >
                ☰
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen((value) => !value)}
                className="hidden h-11 items-center gap-2 rounded-2xl border border-black/8 bg-white/75 px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white lg:inline-flex"
              >
                {sidebarOpen ? "사이드바 숨기기" : "사이드바 열기"}
              </button>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--accent)]">{pageMeta.eyebrow}</p>
                <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-900">{pageMeta.title}</h2>
              </div>
            </div>
            <p className="hidden max-w-xl text-right text-sm leading-6 text-slate-500 xl:block">{pageMeta.summary}</p>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
