import { ClientOnly } from "@/components/client-only";
import { LyricVisualizerTool } from "@/components/lyricvisualizer-tool";

export default function MusicVideoMakerPage() {
  return (
    <ClientOnly>
      <LyricVisualizerTool />
    </ClientOnly>
  );
}
