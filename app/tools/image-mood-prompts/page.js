import { ImageMoodGallery } from "@/components/image-mood-gallery";
import { getGalleryItems } from "@/lib/site-content";

export default function ImageMoodPromptsPage() {
  return <ImageMoodGallery data={getGalleryItems()} />;
}
