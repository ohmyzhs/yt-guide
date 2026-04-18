import { ClientOnly } from "@/components/client-only";
import { LyricCraftTool } from "@/components/lyriccraft-tool";

export default function LyricsMakerPage() {
  return (
    <ClientOnly>
      <LyricCraftTool />
    </ClientOnly>
  );
}
