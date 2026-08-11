import { APPROACH_STEPS } from "@/lib/portfolio-data";

export function PortfolioApproach() {
  return (
    <section id="approach" className="phuc-approach section-shell section-space" aria-labelledby="approach-title">
      <div className="phuc-section-header">
        <span className="phuc-label">03 / PHƯƠNG PHÁP TƯ DUY</span>
      </div>

      <div className="phuc-approach__hero">
        <h2 id="approach-title" className="phuc-approach__headline">
          TÔI KHÔNG THEO ĐUỔI TRAFFIC.
          <br />
          TÔI NGHỊCH Ý ĐỊNH TÌM KIẾM.
        </h2>
        <p className="phuc-approach__lead">
          SEO tốt bắt đầu trước khi có từ khóa. Nó bắt đầu bằng việc hiểu người dùng cần gì, tại sao họ tìm kiếm và trải nghiệm nào nên chờ sẵn khi họ tới.
        </p>
      </div>

      {/* Editorial Process Timeline System (SaaS Cards Removed) */}
      <div className="phuc-approach__timeline-list">
        {APPROACH_STEPS.map((step) => (
          <div key={step.number} className="phuc-editorial-step">
            <div className="phuc-step-header">
              <span className="phuc-step-index">{step.number}</span>
              <h3 className="phuc-step-title">{step.title}</h3>
            </div>
            <div className="phuc-step-body">
              <span className="phuc-step-sub">{step.subtitle}</span>
              <p className="phuc-step-desc">{step.details}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="phuc-approach__statement-block">
        <span className="phuc-tag">TRIẾT LÝ CỐT LÕI</span>
        <blockquote className="phuc-approach__quote">
          DỮ LIỆU NÓI CHO TÔI BIẾT ĐIỀU GÌ ĐÃ XẢY RA.
          <br />
          SỰ TÒ MÒ BẢO TÔI NÊN THỬ NGHIỆM GÌ TIẾP THEO.
        </blockquote>
      </div>
    </section>
  );
}
