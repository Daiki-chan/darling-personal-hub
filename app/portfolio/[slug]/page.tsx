import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ARCHIVE_PROJECTS, FEATURED_PROJECTS, type Project } from "@/lib/portfolio-data";
import { ProjectMediaAperture } from "@/components/portfolio/project-media-aperture";

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
    title: `${project.title} — Case Study & Monograph | Phạm Hoàng Phúc`,
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
        {/* Navigation Back Link Strip */}
        <div className="section-shell phuc-cs-nav-back">
          <Link href="/portfolio" className="phuc-back-btn">
            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
            <span>QUAY LẠI PORTFOLIO (WORKSPACE)</span>
          </Link>

          <div className="phuc-cs-nav-tags">
            <span className="phuc-cs-monograph-tag">MONOGRAPH ARCHIVE // {project.index}</span>
            <span className="phuc-cs-nav-sep" aria-hidden="true">·</span>
            <span className="phuc-cs-nav-cat">{project.category}</span>
          </div>
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
              <span className="lbl">VAI TRÒ THỰC HIỆN</span>
              <span className="val">{project.role.join(", ")}</span>
            </div>
            <div className="phuc-cs-meta-item">
              <span className="lbl">ĐỐI TÁC / LĨNH VỰC</span>
              <span className="val">{project.client}</span>
            </div>
            <div className="phuc-cs-meta-item">
              <span className="lbl">THỜI GIAN THỰC HIỆN</span>
              <span className="val">{project.duration}</span>
            </div>
            {project.capabilities && (
              <div className="phuc-cs-meta-item">
                <span className="lbl">NĂNG LỰC CỐT LÕI</span>
                <span className="val">{project.capabilities.join(" · ")}</span>
              </div>
            )}
          </div>
        </section>

        {/* Hero Media Visual Stage */}
        <section className="section-shell phuc-cs-media-hero">
          <ProjectMediaAperture
            variant={project.mediaVariant}
            aspect={project.aspectRatio || "wide"}
            index={project.index}
            className="phuc-cs-media-frame"
          />
        </section>

        {/* Key Metrics Telemetry Banner */}
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

        {/* Detailed Narrative Monograph Chapters */}
        <div className="section-shell phuc-cs-narrative">
          {project.overview && (
            <article className="phuc-cs-block">
              <div className="phuc-cs-block-header">
                <span className="phuc-cs-block-label">01 / TỔNG QUAN & BỐI CẢNH</span>
                <span className="phuc-cs-block-sub">CONTEXT & SCOPE</span>
              </div>
              <h2>Quy mô & Bối cảnh Dự án</h2>
              <p>{project.overview}</p>
            </article>
          )}

          {project.challenge && (
            <article className="phuc-cs-block">
              <div className="phuc-cs-block-header">
                <span className="phuc-cs-block-label">02 / THỬ THÁCH TRỌNG TÂM</span>
                <span className="phuc-cs-block-sub">CORE CHALLENGE</span>
              </div>
              <h2>Nút thắt Hệ thống & Thách thức Tăng trưởng</h2>
              <p>{project.challenge}</p>
            </article>
          )}

          {project.insight && (
            <article className="phuc-cs-block phuc-cs-block--highlight">
              <div className="phuc-cs-block-header">
                <span className="phuc-cs-block-label">03 / PHÂN TÍCH Ý ĐỊNH & THỊ TRƯỜNG</span>
                <span className="phuc-cs-block-sub">SEARCH INTENT & INSIGHT</span>
              </div>
              <h2>Khám phá Ý định Cốt lõi & Điểm Chuyển hóa</h2>
              <p>{project.insight}</p>
            </article>
          )}

          {project.strategy && (
            <article className="phuc-cs-block">
              <div className="phuc-cs-block-header">
                <span className="phuc-cs-block-label">04 / CHIẾN LƯỢC & KIẾN TRÚC</span>
                <span className="phuc-cs-block-sub">STRATEGY & ARCHITECTURE</span>
              </div>
              <h2>Khung Giải pháp & Cấu trúc Thực thi</h2>
              <p>{project.strategy}</p>
            </article>
          )}

          {project.execution && project.execution.length > 0 && (
            <article className="phuc-cs-block">
              <div className="phuc-cs-block-header">
                <span className="phuc-cs-block-label">05 / LỘ TRÌNH THỰC THI</span>
                <span className="phuc-cs-block-sub">TECHNICAL ROADMAP</span>
              </div>
              <h2>Các bước Triển khai Tuần tự</h2>
              <ul className="phuc-cs-step-list">
                {project.execution.map((step, idx) => (
                  <li key={step}>
                    <span className="idx">0{idx + 1}</span>
                    <span className="text">{step}</span>
                  </li>
                ))}
              </ul>
            </article>
          )}

          {project.results && (
            <article className="phuc-cs-block">
              <div className="phuc-cs-block-header">
                <span className="phuc-cs-block-label">06 / KẾT QUẢ ĐO LƯỜNG</span>
                <span className="phuc-cs-block-sub">MEASURED IMPACT</span>
              </div>
              <h2>Tác động & Chỉ số Đo lường Thực tế</h2>
              <p>{project.results}</p>
            </article>
          )}

          {project.learnings && (
            <article className="phuc-cs-block">
              <div className="phuc-cs-block-header">
                <span className="phuc-cs-block-label">07 / BÀI HỌC RÚT RA</span>
                <span className="phuc-cs-block-sub">SYSTEM TAKEAWAYS</span>
              </div>
              <h2>Giá trị cho Tăng trưởng & Kiến trúc Bền vững</h2>
              <p>{project.learnings}</p>
            </article>
          )}
        </div>

        {/* Next Project Seamless Transition Bridge */}
        <section className="section-shell phuc-cs-next-bridge">
          <div className="phuc-next-header">
            <span className="phuc-tag">TIẾP THEO // NEXT MONOGRAPH</span>
            <span className="phuc-next-idx">{nextProject.index} / {ALL_PROJECTS.length}</span>
          </div>

          <Link href={`/portfolio/${nextProject.slug}`} className="phuc-next-card">
            <div className="phuc-next-info">
              <div className="phuc-next-tags">
                <span className="idx">{nextProject.index}</span>
                <span className="cat">{nextProject.category} · {nextProject.year}</span>
              </div>
              <h2 className="title">{nextProject.title}</h2>
              <p className="summary">{nextProject.summary}</p>
              <div className="btn">
                <span>KHÁM PHÁ MONOGRAPH TIẾP THEO</span>
                <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </div>
            </div>

            <div className="phuc-next-media">
              <ProjectMediaAperture
                variant={nextProject.mediaVariant}
                aspect="landscape"
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
