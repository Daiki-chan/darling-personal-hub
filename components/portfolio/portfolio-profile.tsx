import { PROFILE_DATA } from "@/lib/portfolio-data";

export function PortfolioProfile() {
  return (
    <section id="profile" className="phuc-profile section-shell section-space" aria-labelledby="profile-title">
      <div className="phuc-section-header">
        <span className="phuc-label">01 / HỒ SƠ</span>
      </div>

      <div className="phuc-profile__grid">
        <div className="phuc-profile__main">
          <h2 id="profile-title" className="phuc-profile__headline">
            SEO KHÔNG CHỈ LÀ THỨ HẠNG.
            <br />
            MÀ LÀ ĐƯỢC THẤY ĐÚNG LÚC NGUYỆN VỌNG.
          </h2>
          <p className="phuc-profile__body">{PROFILE_DATA.body}</p>
        </div>

        <div className="phuc-profile__side">
          <div className="phuc-side-block">
            <h3 className="phuc-side-title">LĨNH VỰC TẬP TRUNG</h3>
            <ul className="phuc-tag-list">
              {PROFILE_DATA.focusAreas.map((area) => (
                <li key={area} className="phuc-pill">
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div className="phuc-side-block">
            <h3 className="phuc-side-title">CÔNG CỤ & HỆ THỐNG</h3>
            <ul className="phuc-tag-list">
              {PROFILE_DATA.tools.map((tool) => (
                <li key={tool} className="phuc-pill phuc-pill--tool">
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
