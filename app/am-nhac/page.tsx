import type { Metadata } from "next";
import { MusicApp } from "@/components/music/music-app";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "\u00c2m nh\u1ea1c | Darling",
  description: "YouTube-powered personal music hub v\u1edbi playlist, h\u00e0ng \u0111\u1ee3i v\u00e0 l\u1eddi \u0111\u1ed3ng b\u1ed9.",
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
