import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ARCHIVE_PROJECTS, FEATURED_PROJECTS, type Project } from "@/lib/portfolio-data";
import { PortfolioMediaPlaceholder } from "@/components/portfolio/portfolio-media-placeholder";

const ALL_PROJECTS = [...FEATURED_PROJECTS, ...ARCHIVE_PROJECTS.filter((p) => !p.featured)];

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_PROJECTS.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = ALL_PROJECTS.find((p) => p.slug === slug);
  if (!project) return { title: "Không tìm thấy Case Study | Darling" };

  return {
    title: `${project.title} — Case Study | Phạm Hoàng Phúc`,
    description: project.summary,
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const projectIndex = ALL_PROJECTS.findIndex((p) => p.slug === slug);
  if (projectIndex === -1) notFound();

  const project: Project = ALL_PROJECTS[projectIndex];
  const nextProject: Project = ALL_PROJECTS[(projectIndex + 1) % ALL_PROJECTS.length];

  return (
    <>
      <SiteHeader active="portfolio" />
      <main className="phuc-cs-page inner-page">
        {/* Navigation Back Link */}
        <div className="section-shell phuc-cs-nav-back">
          <Link href="/portfolio" className="phuc-back-btn">
            <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
            <span>Quay lại Danh mục Portfolio</span>
          </Link>
          <span className="phuc-cs-demo-badge">DỮ LIỆU CASE STUDY DEMO</span>
        </div>

        {/* Hero Section */}
        <section className="section-shell phuc-cs-hero" aria-labelledby="cs-title">
          <div className="phuc-cs-hero__header">
            <span className="phuc-cs-index">{project.index}</span>
            <span className="phuc-cs-cat">{project.category} · {project.year}</span>
          </div>

          <h1 id="cs-title" className="phuc-cs-hero__title">
            {project.title}
          </h1>
          <p className="phuc-cs-hero__summary">{project.summary}</p>

          <div className="phuc-cs-hero__meta-grid">
            <div className="phuc-cs-meta-item">
              <span className="lbl">VAI TRÒ</span>
              <span className="val">{project.role.join(", ")}</span>
            </div>
            <div className="phuc-cs-meta-item">
              <span className="lbl">KHÁCH HÀNG / LĨNH VỰC</span>
              <span className="val">{project.client}</span>
            </div>
            <div className="phuc-cs-meta-item">
              <span className="lbl">THỜI GIAN</span>
              <span className="val">{project.duration}</span>
            </div>
          </div>
        </section>

        {/* Hero Media Visual */}
        <section className="section-shell phuc-cs-media-hero">
          <PortfolioMediaPlaceholder
            variant={project.mediaVariant}
            aspectRatio="wide"
            index={project.index}
            label={`Đồ họa mô phỏng: ${project.title}`}
          />
        </section>

        {/* Key Metrics Banner */}
        <section className="section-shell phuc-cs-metrics-banner">
          <div className="phuc-cs-metrics-grid">
            {project.metrics.map((m) => (
              <div key={m.label} className="phuc-cs-metric-box">
                <span className="num">{m.value}</span>
                <span className="lbl">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Narrative Sections */}
        <div className="section-shell phuc-cs-narrative">
          {project.overview && (
            <article className="phuc-cs-block">
              <span className="phuc-cs-block-label">01 / TỔNG QUAN</span>
              <h2>Quy mô & Bối cảnh Dự án</h2>
              <p>{project.overview}</p>
            </article>
          )}

          {project.challenge && (
            <article className="phuc-cs-block">
              <span className="phuc-cs-block-label">02 / THỬ THÁCH</span>
              <h2>Nút thắt Tăng trưởng Tự nhiên</h2>
              <p>{project.challenge}</p>
            </article>
          )}

          {project.insight && (
            <article className="phuc-cs-block phuc-cs-block--highlight">
              <span className="phuc-cs-block-label">03 / Ý ĐỊNH TÌM KIẾM</span>
              <h2>Khám phá Ý định Cốt lõi</h2>
              <p>{project.insight}</p>
            </article>
          )}

          {project.strategy && (
            <article className="phuc-cs-block">
              <span className="phuc-cs-block-label">04 / CHIẾN LƯỢC</span>
              <h2>Khung Giải pháp Tìm kiếm</h2>
              <p>{project.strategy}</p>
            </article>
          )}

          {project.execution && project.execution.length > 0 && (
            <article className="phuc-cs-block">
              <span className="phuc-cs-block-label">05 / LỘ TRÌNH THỰC THI</span>
              <h2>Các bước Triển khai</h2>
              <ul className="phuc-cs-step-list">
                {project.execution.map((step, idx) => (
                  <li key={step}>
                    <span className="idx">0{idx + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </article>
          )}

          {project.results && (
            <article className="phuc-cs-block">
              <span className="phuc-cs-block-label">06 / KẾT QUẢ ĐO LƯỜNG</span>
              <h2>Tác động & Chỉ số</h2>
              <p>{project.results}</p>
            </article>
          )}

          {project.learnings && (
            <article className="phuc-cs-block">
              <span className="phuc-cs-block-label">07 / BÀI HỌC RÚT RA</span>
              <h2>Giá trị cho Tăng trưởng Bền vững</h2>
              <p>{project.learnings}</p>
            </article>
          )}
        </div>

        {/* Next Project Seamless Transition Bridge */}
        <section className="section-shell phuc-cs-next-bridge">
          <span className="phuc-tag">CASE STUDY TIẾP THEO</span>
          <Link href={`/portfolio/${nextProject.slug}`} className="phuc-next-card">
            <div className="phuc-next-info">
              <span className="idx">{nextProject.index}</span>
              <span className="cat">{nextProject.category} · {nextProject.year}</span>
              <h2 className="title">{nextProject.title}</h2>
              <p className="summary">{nextProject.summary}</p>
              <div className="btn">
                <span>ĐỌC DỰ ÁN TIẾP THEO</span>
                <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </div>
            </div>
            <div className="phuc-next-media">
              <PortfolioMediaPlaceholder
                variant={nextProject.mediaVariant}
                aspectRatio="landscape"
                index={nextProject.index}
              />
            </div>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
