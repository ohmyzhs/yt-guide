# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current

## Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run lint     # ESLint (Next.js core-web-vitals)
```

Required env var: `GEMINI_API_KEY` (for the `/api/gemini-generate` proxy route).

## Architecture

**yt-guide** is a YouTube creator workspace — a prompt vault + AI tool suite with a persistent dark sidebar. It runs on Next.js App Router (no TypeScript, no database, no auth).

### Routing

```
/                          → overview dashboard
/prompts/[slug]            → static prompt docs (pre-rendered via generateStaticParams)
                             Special case: slug "suno-prompt" renders SunoPromptWorkbench instead of PromptDocument
/tools/image-mood-prompts  → ImageMoodGallery (40+ style cards, keyboard nav, copy)
/tools/subtitle-maker      → LyricCraftTool (lyrics generator)
/tools/music-video-maker   → LyricVisualizerTool (storyboard generator)
/api/gemini-generate       → POST proxy to Google Gemini API
```

### Data Layer

- **`data/prompts.js`** — static prompt library (~841 lines). All prompt pages are statically generated from this at build time.
- **`data/gallery.json`** — ~40 image style cards for the mood gallery.
- **`lib/site-content.js`** — single source of truth for navigation structure and page metadata (`getPageMetaByPath()`). AppShell reads this to build the sidebar and header.
- **No database**. sessionStorage handles persistence (see below).

### State Management

Three patterns, no global state library:

1. **sessionStorage** — `lib/music-workspace.js` exports `usePersistedJsonState(key, initialValue)`. All three music tools auto-persist their form + output state under `yt-guide:*` keys. State survives page refresh but not tab close.
2. **URL / pathname** — `usePathname()` in AppShell drives active sidebar highlighting and `generateStaticParams()` drives pre-rendering.
3. **Local `useState`** — UI-only state (sidebar open, loading, copy toast).

### Key Components

| Component | Role |
|---|---|
| `AppShell` | Global layout shell — dark sidebar (collapsible groups), sticky header, mobile hamburger overlay |
| `PromptDocument` | Two-column doc view: metadata sidebar + monospace prompt preview with copy |
| `SunoPromptWorkbench` | Text → Gemini → Suno prompt generator (wrapped in `<ClientOnly>`) |
| `LyricCraftTool` | Genre/mood/structure form → Gemini → sectional lyrics output |
| `LyricVisualizerTool` | Song + visual style form → Gemini → 40-scene storyboard (Midjourney + Luma/Runway prompts) |
| `ImageMoodGallery` | Modal gallery with search, arrow-key nav, copy-prompt |
| `ClientOnly` | Hydration guard — renders children only in browser (uses `useSyncExternalStore`) |

All AI tool components must be wrapped in `<ClientOnly>` because they use browser APIs (sessionStorage, fetch to Gemini) that break SSR.

### Design Tokens

Defined as CSS variables in `app/globals.css`. Key values:
- `--accent`: `#c56a3d` (warm orange-brown)
- `--background`: `#f4efe8` (cream)
- `--surface-dark`: `#0d1820` (sidebar navy)
- `--sidebar-width`: `20rem`
- Fonts: Noto Sans KR (body), JetBrains Mono (code/prompts)

Path alias `@/*` maps to the project root (configured in `jsconfig.json`).

### Copy-to-Clipboard Pattern

Reused across all tools: after click, show "복사 완료" for 1.5 s then revert. Implemented inline with `useState` — no toast library.
