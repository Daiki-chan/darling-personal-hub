import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Headphones, Images, type LucideIcon } from "lucide-react";
import { IntroGate } from "@/components/intro-gate";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const paths: Array<{
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  className: string;
}> = [
  {
    href: "/thu-vien",
    title: "Thư viện ảnh",
    description: "Nơi tôi giữ những bức ảnh mình yêu thích.",
    icon: Images,
    className: "hub-route-card--gallery",
  },
  {
    href: "/am-nhac",
    title: "Thư viện nhạc",
    description: "Nơi tôi lưu những âm thanh luôn muốn nghe lại.",
    icon: Headphones,
    className: "hub-route-card--music",
  },
  {
    href: "/portfolio",
    title: "Portfolio",
    description: "Không gian riêng cho công việc và các dự án đã chọn.",
    icon: BriefcaseBusiness,
    className: "hub-route-card--portfolio",
  },
];

export default function HomePage() {
  return (
    <>
      <IntroGate />
      <SiteHeader />

      <main>
        <section className="hub-landing section-shell" aria-labelledby="hub-title">
          <Reveal className="hub-landing__copy">
            <span className="eyebrow">Personal hub</span>
            <h1 id="hub-title">Ba lối vào. Ba thế giới riêng.</h1>
            <p>Ảnh, nhạc và công việc không còn chen vào cùng một không gian.</p>
          </Reveal>

          <div className="hub-route-grid">
            {paths.map((path, index) => {
              const Icon = path.icon;
              return (
                <Reveal className={"hub-route-card " + path.className} delay={index * 0.07} key={path.href}>
                  <Link href={path.href}>
                    <span className="hub-route-card__icon">
                      <Icon aria-hidden="true" size={24} strokeWidth={1.5} />
                    </span>
                    <span className="hub-route-card__copy">
                      <strong>{path.title}</strong>
                      <span>{path.description}</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" size={20} strokeWidth={1.5} />
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
