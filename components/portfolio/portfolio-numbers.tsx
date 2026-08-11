import { NUMBERS_DATA } from "@/lib/portfolio-data";

export function PortfolioNumbers() {
  return (
    <section className="phuc-numbers section-shell section-space" aria-label="Key Performance Indicators">
      <div className="phuc-numbers__grid">
        {NUMBERS_DATA.map((item) => (
          <div key={item.label} className="phuc-num-card">
            <span className="phuc-num-val">{item.number}</span>
            <span className="phuc-num-lbl">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
