import { EXPERIENCE_TIMELINE, PROFILE_DATA } from "@/lib/portfolio-data";

export function PortfolioExperience() {
  return (
    <section id="experience" className="phuc-experience section-shell section-space" aria-labelledby="exp-title">
      <div className="phuc-section-header">
        <span className="phuc-label">05 / KINH NGHIỆM</span>
      </div>

      <div className="phuc-exp__grid">
        <div className="phuc-exp__left">
          <h2 id="exp-title" className="phuc-exp__name">{PROFILE_DATA.name}</h2>
          <span className="phuc-exp__role">{PROFILE_DATA.role}</span>
          <span className="phuc-exp__badge">{PROFILE_DATA.experience}</span>
        </div>

        <div className="phuc-exp__right">
          <div className="phuc-timeline">
            {EXPERIENCE_TIMELINE.map((item) => (
              <div key={item.year} className="phuc-timeline-item">
                <span className="phuc-tl-year">{item.year}</span>
                <p className="phuc-tl-desc">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
