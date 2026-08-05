import { MusicHub } from "@/components/music/music-hub";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function MusicLibraryPage() {
  return (
    <>
      <SiteHeader active="music" />
      <main>
        <MusicHub />
      </main>
      <SiteFooter />
    </>
  );
}
