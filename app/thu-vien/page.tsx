import type { Metadata } from "next";
import { Images } from "lucide-react";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Thư viện | Darling",
  description: "Bộ sưu tập khoảnh khắc, góc nhìn và hình ảnh đời thường.",
};

const favoriteImages = [
  { label: "Ảnh yêu thích placeholder 01", caption: "Chân dung", aspect: "portrait" as const, tone: "violet" as const },
  { label: "Ảnh yêu thích placeholder 02", caption: "Một khoảng trời", aspect: "wide" as const, tone: "indigo" as const },
  { label: "Ảnh yêu thích placeholder 03", caption: "Khung hình anime", aspect: "landscape" as const, tone: "silver" as const },
  { label: "Ảnh yêu thích placeholder 04", caption: "Thành phố về đêm", aspect: "portrait" as const, tone: "indigo" as const },
  { label: "Ảnh yêu thích placeholder 05", caption: "Ánh sáng", aspect: "square" as const, tone: "violet" as const },
  { label: "Ảnh yêu thích placeholder 06", caption: "Một nơi muốn trở lại", aspect: "landscape" as const, tone: "silver" as const },
  { label: "Ảnh yêu thích placeholder 07", caption: "Chi tiết nhỏ", aspect: "portrait" as const, tone: "violet" as const },
];

export default function GalleryPage() {
  return (
    <>
      <SiteHeader active="gallery" />
      <main className="inner-page">
        <section className="route-hero section-shell route-hero--gallery" aria-labelledby="gallery-title">
          <Reveal className="route-hero__copy">
            <span className="eyebrow">Thư viện ảnh</span>
            <h1 id="gallery-title">Những bức ảnh tôi thích nhìn lại.</h1>
            <p>Đây là bộ sưu tập cá nhân dành cho hình ảnh, ký ức và cảm hứng thị giác.</p>
          </Reveal>
          <Reveal className="route-hero__media" delay={0.1}>
            <MediaPlaceholder label="Ảnh nổi bật placeholder" aspect="landscape" tone="indigo" />
          </Reveal>
        </section>

        <section className="section-shell section-space" aria-labelledby="favorites-title">
          <Reveal className="vertical-heading">
            <Images aria-hidden="true" size={28} strokeWidth={1.5} />
            <h2 id="favorites-title">Ảnh được giữ lại.</h2>
            <p>Mỗi vị trí là một chỗ trống để bạn thay bằng ảnh mình thực sự yêu thích.</p>
          </Reveal>

          <div className="gallery-grid gallery-grid--favorites">
            {favoriteImages.map((item, index) => (
              <Reveal className="gallery-item" delay={index * 0.035} key={item.label}>
                <figure>
                  <MediaPlaceholder label={item.label} aspect={item.aspect} tone={item.tone} />
                  <figcaption>{item.caption}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section-shell library-note" aria-label="Ghi chú thư viện">
          <Reveal>
            <p>Không cần một chủ đề cố định. Chỉ cần đó là bức ảnh bạn muốn giữ.</p>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
