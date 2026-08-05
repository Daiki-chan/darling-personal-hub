import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, Mail } from "lucide-react";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const projects = [
  {
    title: "Dự án thương hiệu",
    type: "Nhận diện và art direction",
    aspect: "portrait" as const,
    tone: "violet" as const,
    className: "project-card--lead",
  },
  {
    title: "Trải nghiệm số",
    type: "Thiết kế web tương tác",
    aspect: "wide" as const,
    tone: "indigo" as const,
    className: "project-card--wide",
  },
  {
    title: "Motion study",
    type: "Chuyển động và kể chuyện",
    aspect: "landscape" as const,
    tone: "silver" as const,
    className: "project-card--small",
  },
];

const process = [
  { title: "Hiểu vấn đề", body: "Xác định mục tiêu, người xem và điều dự án thật sự cần giải quyết." },
  { title: "Tạo hệ thống", body: "Chuyển định hướng thành ngôn ngữ thị giác có quy tắc và khả năng mở rộng." },
  { title: "Làm đến nơi", body: "Tinh chỉnh layout, chuyển động và trạng thái tương tác trước khi bàn giao." },
];

export default function PortfolioPage() {
  return (
    <>
      <SiteHeader active="portfolio" />
      <main className="inner-page">
        <section className="portfolio-hero section-shell" aria-labelledby="portfolio-title">
          <Reveal className="portfolio-hero__copy">
            <span className="eyebrow">Portfolio</span>
            <h1 id="portfolio-title">Tôi thiết kế những trải nghiệm có cảm giác riêng.</h1>
            <p>Không gian này chỉ dành cho công việc, dự án và cách tôi giải quyết vấn đề.</p>
            <a className="button button--primary" href="#work">
              Xem dự án
              <ArrowDownRight aria-hidden="true" size={18} strokeWidth={1.5} />
            </a>
          </Reveal>
          <Reveal className="portfolio-hero__statement" delay={0.1}>
            <BriefcaseBusiness aria-hidden="true" size={30} strokeWidth={1.5} />
            <p>Brand systems, digital experiences and motion direction.</p>
          </Reveal>
        </section>

        <section id="work" className="section-shell section-space" aria-labelledby="selected-work-title">
          <Reveal className="vertical-heading vertical-heading--narrow">
            <h2 id="selected-work-title">Dự án được chọn.</h2>
            <p>Ba vị trí case study placeholder, sẵn sàng thay bằng dự án thật.</p>
          </Reveal>
          <div className="project-grid">
            {projects.map((project, index) => (
              <Reveal className={`project-card ${project.className}`} delay={index * 0.06} key={project.title}>
                <article>
                  <MediaPlaceholder
                    label={`Hình dự án placeholder: ${project.title}`}
                    aspect={project.aspect}
                    tone={project.tone}
                  />
                  <div className="project-copy">
                    <div>
                      <h3>{project.title}</h3>
                      <p>{project.type}</p>
                    </div>
                    <ArrowUpRight aria-hidden="true" size={22} strokeWidth={1.5} />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section-shell section-space process-layout" aria-labelledby="work-process-title">
          <Reveal className="process-intro">
            <h2 id="work-process-title">Cách tôi đưa dự án về đích.</h2>
          </Reveal>
          <div className="process-list">
            {process.map((item, index) => (
              <Reveal className="process-item" delay={index * 0.06} key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <ArrowDownRight aria-hidden="true" size={22} strokeWidth={1.5} />
              </Reveal>
            ))}
          </div>
        </section>

        <section id="contact" className="section-shell contact-section" aria-labelledby="portfolio-contact-title">
          <Reveal className="contact-orbit">
            <Mail aria-hidden="true" size={28} strokeWidth={1.5} />
            <h2 id="portfolio-contact-title">Có một dự án cần được chăm chút?</h2>
            <a className="button button--primary" href="mailto:hello@example.com">
              Gửi lời chào
              <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
            </a>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
