import { PROFILE_DATA } from "@/lib/portfolio-data";

export function PortfolioContact() {
  return (
    <section id="contact" className="phuc-contact section-shell" aria-labelledby="contact-title">
      <div className="phuc-contact__wrap">
        <span className="phuc-label">06 / LIÊN HỆ</span>

        <h2 id="contact-title" className="phuc-contact__headline">
          CÙNG NHAU TẠO NÊN DỰ ÁN
          <br />
          ĐÁNG ĐỂ TÌM THẤY.
        </h2>

        <p className="phuc-contact__sub">Sẵn sàng cho các cơ hội hợp tác Marketing, SEO và Tăng trưởng Kỹ thuật số.</p>

        <div className="phuc-contact__actions">
          <a
            className="phuc-btn-primary"
            href="mailto:your-email@example.com"
            aria-label="Gửi email để bắt đầu trao đổi"
          >
            <span>BẮT ĐẦU TRÒ CHUYỆN</span>
            <span className="phuc-btn-arrow" aria-hidden="true">
              ↗
            </span>
          </a>

          <div className="phuc-contact__secondary">
            <a href="mailto:your-email@example.com" className="phuc-link">
              EMAIL
            </a>
            <span className="dot">•</span>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="phuc-link"
            >
              LINKEDIN ↗
            </a>
          </div>
        </div>

        <div className="phuc-contact__meta">
          <span>{PROFILE_DATA.name}</span>
          <span className="dot">•</span>
          <span>{PROFILE_DATA.location}</span>
          <span className="dot">•</span>
          <span>{PROFILE_DATA.role.toUpperCase()}</span>
        </div>
      </div>
    </section>
  );
}
