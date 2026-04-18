import { notFound } from "next/navigation";
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

  return <PromptDocument {...promptPage} />;
}
