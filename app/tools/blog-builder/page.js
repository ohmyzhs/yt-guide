import { ClientOnly } from "@/components/client-only";
import { BlogBuilderTool } from "@/components/blog-builder-tool";

export default function BlogBuilderPage() {
  return (
    <ClientOnly>
      <BlogBuilderTool />
    </ClientOnly>
  );
}
