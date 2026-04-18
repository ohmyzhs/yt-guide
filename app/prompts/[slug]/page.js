import { notFound } from "next/navigation";
import { ClientOnly } from "@/components/client-only";
import { PromptDocument } from "@/components/prompt-document";
import { SunoPromptWorkbench } from "@/components/suno-prompt-workbench";
import { CharacterSheetWorkbench } from "@/components/character-sheet-workbench";
import { AdMasterWorkbench } from "@/components/ad-master-workbench";
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
    return (
      <ClientOnly>
        <SunoPromptWorkbench {...promptPage} />
      </ClientOnly>
    );
  }

  if (slug === "character-sheet-master") {
    return (
      <ClientOnly>
        <CharacterSheetWorkbench {...promptPage} />
      </ClientOnly>
    );
  }

  if (slug === "ad-master") {
    return (
      <ClientOnly>
        <AdMasterWorkbench {...promptPage} />
      </ClientOnly>
    );
  }

  return <PromptDocument {...promptPage} />;
}
