"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { getPageMetaByPath, navigation } from "@/lib/site-content";

function IconChevron({ className }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3l3 3-3 3" />
    </svg>
  );
}

function IconPanel({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="15" height="13" rx="2.5" />
      <path d="M6.5 2.5v13" />
    </svg>
  );
}

function IconHome({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1.5L1.5 7H3v7.5h4v-4h2v4h4V7h1.5L8 1.5z" />
    </svg>
  );
}

function IconClose({ className }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M2 2l10 10M12 2L2 12" />
    </svg>
  );
}

function IconMenu({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M2 4h12M2 8h12M2 12h12" />
    </svg>
  );
}

function SidebarGroup({ section, pathname, onNavigate }) {
  const isActiveGroup = section.items.some((item) => item.href === pathname);
  const [expanded, setExpanded] = useState(isActiveGroup);
  const isExpanded = expanded || isActiveGroup;

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition hover:bg-white/5"
      >
        <IconChevron
          className={`h-2.5 w-2.5 shrink-0 text-white/25 transition-transform duration-150 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/38">
          {section.label}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-0.5 pl-3 pr-1">
          {section.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition duration-100 ${
                  active
                    ? "bg-[var(--accent)]/14 text-white font-medium"
                    : "text-white/55 hover:bg-white/5 hover:text-white/85"
                }`}
              >
                <span
                  className={`inline-block h-[5px] w-[5px] shrink-0 rounded-full ${
                    active ? "bg-[var(--accent)]" : "bg-white/18"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageMeta = useMemo(() => getPageMetaByPath(pathname), [pathname]);

  return (
    <div className="min-h-screen">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col overflow-hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-white shadow-2xl transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full"}`}
      >
        {/* Logo header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--sidebar-border)] px-3.5 py-3">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-white">
                <path d="M7 5.5v9l7.5-4.5z" />
              </svg>
            </div>
            <div className="leading-none">
              <p className="text-[13px] font-bold tracking-tight text-white/90">YT Guide</p>
              <p className="mt-0.5 text-[9.5px] font-medium tracking-widest text-white/28 uppercase">Workspace</p>
            </div>
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1.5 text-white/35 transition hover:bg-white/6 hover:text-white/65 lg:hidden"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>

          {/* Desktop collapse */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="hidden rounded-md p-1.5 text-white/30 transition hover:bg-white/6 hover:text-white/65 lg:block"
            title="사이드바 접기"
          >
            <IconPanel className="h-4 w-4" />
          </button>
        </div>

        {/* Home link */}
        <div className="shrink-0 px-2.5 pt-2.5 pb-1.5">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium transition ${
              pathname === "/"
                ? "bg-[var(--accent)]/14 text-white"
                : "text-white/55 hover:bg-white/5 hover:text-white/85"
            }`}
          >
            <IconHome className="h-3.5 w-3.5 shrink-0" />
            워크스페이스 홈
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-3 mb-1 border-t border-[var(--sidebar-border)]" />

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-2.5 pb-4 pt-1 app-scrollbar">
          <div className="grid gap-px">
            {navigation.map((section) => (
              <SidebarGroup
                key={section.id}
                section={section}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </div>
        </nav>
      </aside>

      {/* Main */}
      <div
        className={`min-h-screen transition-[margin] duration-300 ${
          sidebarOpen ? "lg:ml-[var(--sidebar-width)]" : "lg:ml-0"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-[var(--background)]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Mobile open */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/8 bg-white/80 text-slate-500 shadow-sm transition hover:bg-white lg:hidden"
              >
                <IconMenu className="h-3.5 w-3.5" />
              </button>

              {/* Desktop: show open-sidebar button only when closed */}
              {!sidebarOpen && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="hidden h-8 w-8 items-center justify-center rounded-lg border border-black/8 bg-white/80 text-slate-500 shadow-sm transition hover:bg-white lg:flex"
                  title="사이드바 열기"
                >
                  <IconPanel className="h-4 w-4" />
                </button>
              )}

              <div className="leading-none">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                  {pageMeta.eyebrow}
                </p>
                <h2 className="mt-0.5 text-[17px] font-bold tracking-tight text-slate-900">
                  {pageMeta.title}
                </h2>
              </div>
            </div>

            <p className="hidden max-w-sm text-right text-sm leading-relaxed text-slate-400 xl:block">
              {pageMeta.summary}
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
