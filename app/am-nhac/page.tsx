import Link from "next/link";
import { ArrowLeft, Disc3, Headphones } from "lucide-react";
import { MusicDeck } from "@/components/music-deck";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const playlists = ["Những đêm dài", "Âm thanh dịu", "Anime memories", "Nghe khi làm việc"];

export default function MusicLibraryPage() {
  return (
    <>
      <SiteHeader active="music" />
      <main className="inner-page">
        <section className="route-hero section-shell route-hero--music" aria-labelledby="music-library-title">
          <Reveal className="route-hero__copy">
            <span className="eyebrow">Thư viện nhạc</span>
            <h1 id="music-library-title">Những bài hát tôi luôn muốn nghe lại.</h1>
            <p>Một nơi riêng để lưu track, album và playlist mình thực sự yêu thích.</p>
          </Reveal>
          <Reveal className="music-orbit" delay={0.1}>
            <Headphones aria-hidden="true" size={48} strokeWidth={1.25} />
            <span>Audio artwork placeholder</span>
          </Reveal>
        </section>

        <section className="section-shell section-space" aria-labelledby="player-title">
          <Reveal className="vertical-heading">
            <h2 id="player-title">Đang nằm trong thư viện.</h2>
            <p>Player đang ở trạng thái mô phỏng và chờ bạn gắn file nhạc thật.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <MusicDeck />
          </Reveal>
        </section>

        <section className="section-shell playlist-section" aria-labelledby="playlist-title">
          <Reveal className="vertical-heading vertical-heading--narrow">
            <h2 id="playlist-title">Các playlist muốn giữ gần.</h2>
          </Reveal>
          <div className="playlist-shelf">
            {playlists.map((playlist, index) => (
              <Reveal className="playlist-placeholder" delay={index * 0.05} key={playlist}>
                <Disc3 aria-hidden="true" size={28} strokeWidth={1.5} />
                <strong>{playlist}</strong>
                <span>Playlist placeholder</span>
              </Reveal>
            ))}
          </div>
          <Link className="text-link" href="/#portals">
            <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.5} />
            Trở về cổng chính
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
