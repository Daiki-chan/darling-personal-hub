import type { Metadata } from "next";
import { MusicApp } from "@/components/music/music-app";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Âm nhạc | Darling",
  description: "Trình phát nhạc cá nhân kết nối YouTube Data API với danh sách phát, hàng đợi và lời bài hát đồng bộ.",
  alternates: {
    canonical: "/music",
  },
};

export default function MusicLibraryPage() {
  return (
    <>
      <SiteHeader active="music" guardInitialVisit={false} />
      <main>
        <MusicApp />
      </main>
    </>
  );
}
