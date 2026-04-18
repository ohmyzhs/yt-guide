import galleryData from "@/data/gallery.json";
import { promptLibrary } from "@/data/prompts";

const allPrompts = promptLibrary.categories.flatMap((category) =>
  category.prompts.map((prompt) => ({
    ...prompt,
    sourceCategoryId: category.id,
    sourceCategoryName: category.name,
  })),
);

const promptById = Object.fromEntries(allPrompts.map((prompt) => [prompt.id, prompt]));

export const navigation = [
  {
    id: "script-writing",
    label: "대본 제작",
    description: "01~04 작성 흐름",
    items: [
      {
        id: "script-01",
        label: "01. 대본 만들기",
        href: "/prompts/script-01",
        kind: "prompt",
        promptId: "script-master",
      },
      {
        id: "script-02",
        label: "02. 분위기+인물 만들기",
        href: "/prompts/script-02",
        kind: "prompt",
        promptId: "character-style",
      },
      {
        id: "script-03",
        label: "03. 도입부 장면 만들기",
        href: "/prompts/script-03",
        kind: "prompt",
        promptId: "intro-scene",
      },
      {
        id: "script-04",
        label: "04. 나머지 섹션들 장면 만들기",
        href: "/prompts/script-04",
        kind: "prompt",
        promptId: "section-scene",
      },
    ],
  },
  {
    id: "character-scene",
    label: "캐릭터/장면",
    description: "시트와 분위기 보관함",
    items: [
      {
        id: "character-sheet-master",
        label: "캐릭터시트 마스터",
        href: "/prompts/character-sheet-master",
        kind: "prompt",
        promptId: "character-sheet",
      },
      {
        id: "image-mood-prompts",
        label: "이미지 분위기 프롬프트",
        href: "/tools/image-mood-prompts",
        kind: "tool",
      },
    ],
  },
  {
    id: "ad-production",
    label: "광고 제작",
    description: "광고용 워크플로우",
    items: [
      {
        id: "ad-master",
        label: "광고 마스터 프롬프트",
        href: "/prompts/ad-master",
        kind: "prompt",
        promptId: "ad-master",
      },
    ],
  },
  {
    id: "music-production",
    label: "음악 제작",
    description: "음악/뮤비 생성 도구",
    items: [
      {
        id: "suno-prompt",
        label: "수노프롬프트 생성",
        href: "/prompts/suno-prompt",
        kind: "prompt",
        promptId: "suno-master",
      },
      {
        id: "subtitle-maker",
        label: "자막 제작",
        href: "/tools/subtitle-maker",
        kind: "tool",
      },
      {
        id: "music-video-maker",
        label: "뮤비이미지/영상 제작",
        href: "/tools/music-video-maker",
        kind: "tool",
      },
    ],
  },
];

export const toolPages = {
  "/tools/image-mood-prompts": {
    title: "이미지 분위기 프롬프트",
    summary: "기존 이미지 스타일 카드 라이브러리를 React로 옮긴 갤러리형 탐색 화면",
    eyebrow: "Character & Scene",
  },
  "/tools/subtitle-maker": {
    title: "자막 제작",
    summary: "LyricCraft AI를 React 페이지로 옮긴 음악 가사/자막 제작 도구",
    eyebrow: "Music Production",
  },
  "/tools/music-video-maker": {
    title: "뮤비이미지/영상 제작",
    summary: "LyricVisualizer Pro를 통합한 이미지/영상 프롬프트 생성 도구",
    eyebrow: "Music Production",
  },
};

export const overviewCards = navigation.map((section) => ({
  ...section,
  count: section.items.length,
}));

export function getPromptPageBySlug(slug) {
  const item = navigation.flatMap((section) => section.items).find((entry) => entry.href === `/prompts/${slug}`);
  if (!item || !item.promptId) return null;

  const prompt = promptById[item.promptId];
  if (!prompt) return null;

  const section = navigation.find((group) => group.items.some((entry) => entry.id === item.id));

  return {
    slug,
    title: item.label,
    href: item.href,
    sectionLabel: section?.label ?? prompt.sourceCategoryName,
    description: prompt.summary,
    tags: prompt.tags,
    content: prompt.content,
  };
}

export function getAllPromptSlugs() {
  return navigation
    .flatMap((section) => section.items)
    .filter((item) => item.kind === "prompt")
    .map((item) => item.href.replace("/prompts/", ""));
}

export function getPageMetaByPath(pathname) {
  if (pathname === "/") {
    return {
      title: "YT Guide Workspace",
      eyebrow: "Overview",
      summary: "대본, 캐릭터, 광고, 음악 제작 도구를 하나의 앱 셸 안에 묶은 통합 워크스페이스",
    };
  }

  const promptPage = getPromptPageBySlug(pathname.replace("/prompts/", ""));
  if (pathname.startsWith("/prompts/") && promptPage) {
    return {
      title: promptPage.title,
      eyebrow: promptPage.sectionLabel,
      summary: promptPage.description,
    };
  }

  if (toolPages[pathname]) {
    return toolPages[pathname];
  }

  return {
    title: "YT Guide",
    eyebrow: "Workspace",
    summary: "제작 도구와 프롬프트를 이동 없이 탐색할 수 있는 작업 공간",
  };
}

export function getGalleryItems() {
  return galleryData.items.map((item) => ({
    ...item,
    image: item.image.replace(/^\.\//, "/"),
  }));
}
