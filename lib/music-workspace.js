"use client";

import { useEffect, useState } from "react";

export const MUSIC_WORKSPACE_KEYS = {
  sunoInput: "yt-guide:suno:input",
  sunoOutput: "yt-guide:suno:output",
  sunoMode: "yt-guide:suno:mode",
  sunoAnalysisText: "yt-guide:suno:analysis-text",
  sunoAnalysisJson: "yt-guide:suno:analysis-json",
  sunoPresetFamily: "yt-guide:suno:preset-family",
  sunoPresetId: "yt-guide:suno:preset-id",
  lyricCraftForm: "yt-guide:lyric-craft:form",
  lyricCraftOutput: "yt-guide:lyric-craft:output",
  lyricCraftDraft: "yt-guide:lyric-craft:draft",
  lyricVisualizerForm: "yt-guide:lyric-visualizer:form",
  lyricVisualizerResults: "yt-guide:lyric-visualizer:results",
  lyricVisualizerTabs: "yt-guide:lyric-visualizer:tabs",
  charSheetTraits: "yt-guide:char-sheet:traits",
  charSheetArtStyle: "yt-guide:char-sheet:art-style",
  charSheetCustomStyle: "yt-guide:char-sheet:custom-style",
  charSheetOutput: "yt-guide:char-sheet:output",
  adMasterForm: "yt-guide:ad-master:form",
  adMasterOutput: "yt-guide:ad-master:output",
};

export function readStoredJson(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredJson(key, value) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function removeStoredJson(key) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(key);
}

export function usePersistedJsonState(key, initialValue) {
  const [state, setState] = useState(() => readStoredJson(key, initialValue));

  useEffect(() => {
    writeStoredJson(key, state);
  }, [key, state]);

  return [state, setState];
}

export function saveLyricCraftDraft(draft) {
  writeStoredJson(MUSIC_WORKSPACE_KEYS.lyricCraftDraft, draft);
}

export function readLyricCraftDraft() {
  return readStoredJson(MUSIC_WORKSPACE_KEYS.lyricCraftDraft, null);
}

export function clearLyricCraftDraft() {
  removeStoredJson(MUSIC_WORKSPACE_KEYS.lyricCraftDraft);
}
