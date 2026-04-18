import { notFound } from "next/navigation";
import { ClientOnly } from "@/components/client-only";
import { PromptDocument } from "@/components/prompt-document";
import { getAllPromptSlugs, getPromptPageBySlug } from "@/lib/site-content";

export function generateStaticParams() {
  return getAllPromptSlugs().map((slug) => ({ slug }));
}

export default async function PromptPage({ params }) {
  const { slug } = await params;
  const promptPage = getPromptPageBySlug(slug);

  if (!promptPage) {
    notFound();
  }

  if (slug === "suno-prompt") {
    const { SunoPromptWorkbench } = await import("@/components/suno-prompt-workbench");
    return (
      <ClientOnly>
        <SunoPromptWorkbench {...promptPage} />
      </ClientOnly>
    );
  }

  if (slug === "character-sheet-master") {
    const { CharacterSheetWorkbench } = await import("@/components/character-sheet-workbench");
    return (
      <ClientOnly>
        <CharacterSheetWorkbench {...promptPage} />
      </ClientOnly>
    );
  }

  if (slug === "ad-master") {
    const { AdMasterWorkbench } = await import("@/components/ad-master-workbench");
    return (
      <ClientOnly>
        <AdMasterWorkbench {...promptPage} />
      </ClientOnly>
    );
  }

  return <PromptDocument {...promptPage} />;
}
