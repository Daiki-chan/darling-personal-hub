"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CAPABILITIES_DATA } from "@/lib/portfolio-data";

gsap.registerPlugin(ScrollTrigger);

export function PortfolioCapabilities() {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const track = tickerRef.current;
    if (!track) return;

    let currentX = 0;
    const baseSpeed = -0.5;
    let speed = baseSpeed;
    let animId = 0;
    let isVisible = false;

    const tick = () => {
      currentX += speed;
      if (currentX <= -50) currentX = 0;
      if (currentX > 0) currentX = -50;
      track.style.transform = `translate3d(${currentX}%, 0, 0)`;
      if (isVisible) {
        animId = requestAnimationFrame(tick);
      } else {
        animId = 0;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          animId = requestAnimationFrame(tick);
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { threshold: 0 }
    );
    observer.observe(track);

    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const vel = self.getVelocity();
        if (vel !== 0) {
          const direction = vel > 0 ? -1 : 1;
          const boost = Math.min(Math.abs(vel) * 0.0015, 3.5);
          speed = baseSpeed + boost * direction;
        } else {
          speed = baseSpeed;
        }
      },
    });

    return () => {
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
      st.kill();
    };
  }, []);

  const allSkills = [
    ...CAPABILITIES_DATA.primary,
    ...CAPABILITIES_DATA.secondary,
    ...CAPABILITIES_DATA.tools,
  ];

  return (
    <section id="capabilities" className="phuc-capabilities section-shell section-space" aria-labelledby="capabilities-title">
      <div className="phuc-section-header">
        <span className="phuc-label">04 / NĂNG LỰC & KỸ NĂNG</span>
      </div>

      <div className="phuc-capabilities__grid">
        <div className="phuc-cap-col">
          <h3 id="capabilities-title" className="phuc-cap-title">KỸ NĂNG CHÍNH</h3>
          <ul className="phuc-cap-list">
            {CAPABILITIES_DATA.primary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="phuc-cap-col">
          <h3 className="phuc-cap-title">KỸ NĂNG MỞ RỘNG</h3>
          <ul className="phuc-cap-list">
            {CAPABILITIES_DATA.secondary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="phuc-cap-col">
          <h3 className="phuc-cap-title">CÔNG CỤ & HỆ THỐNG</h3>
          <ul className="phuc-cap-list phuc-cap-list--tools">
            {CAPABILITIES_DATA.tools.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="phuc-marquee-wrapper" aria-hidden="true">
        <div ref={tickerRef} className="phuc-marquee-track">
          {[...allSkills, ...allSkills].map((skill, idx) => (
            <span key={`${skill}-${idx}`} className="phuc-marquee-item">
              {skill} <span className="phuc-marquee-star">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
