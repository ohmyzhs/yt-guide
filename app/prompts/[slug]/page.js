import { notFound } from "next/navigation";
import { ClientOnly } from "@/components/client-only";
import { PromptDocument } from "@/components/prompt-document";
import { SunoPromptWorkbench } from "@/components/suno-prompt-workbench";
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

  return <PromptDocument {...promptPage} />;
}
