"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BriefcaseBusiness, Headphones, Images } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useEffect, useRef, useState } from "react";
import { consumeInitialDocumentVisit } from "@/lib/document-visit";

const softEase = [0.16, 1, 0.3, 1] as const;
const floatEase = [0.37, 0, 0.63, 1] as const;

export const IntroGate = memo(function IntroGate() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [isRouteReady, setIsRouteReady] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const isInitialVisit = consumeInitialDocumentVisit();

    if (isInitialVisit) {
      if (window.location.hash) {
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
      }
    } else if (window.location.hash === "#portals") {
      setStep(2);
    }
    setIsRouteReady(true);
  }, []);

  useEffect(() => {
    router.prefetch("/thu-vien");
    router.prefetch("/am-nhac");
    router.prefetch("/portfolio");
  }, [router]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
      }
    };
  }, []);

  const advance = () => {
    if (!isRouteReady) return;
    if (step < 2) {
      setStep((current) => (current + 1) as 0 | 1 | 2);
    }
  };

  const handleKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (step < 2 && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      advance();
    }
  };

  const enterPath = (target: string) => {
    if (isLeaving) return;

    setIsLeaving(true);
    router.prefetch(target);
    const closeDelay = reduceMotion ? 0 : 240;
    closeTimer.current = window.setTimeout(() => {
      router.push(target);
    }, closeDelay);
  };

  const floatingMotion = reduceMotion ? {} : { y: [0, -6, 0] };

  return (
    <motion.main
      className="intro-layer"
      initial={{ opacity: 1 }}
      aria-busy={!isRouteReady}
      animate={{ opacity: isLeaving ? 0 : 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: softEase }}
    >
          <div className="intro-halo intro-halo--violet" aria-hidden="true" />
          <div className="intro-halo intro-halo--indigo" aria-hidden="true" />

          {isRouteReady ? (
            <div
              className={`intro-stage ${step < 2 ? "intro-stage--clickable" : ""}`}
              onClick={advance}
              onKeyDown={handleKeyboard}
              role={step < 2 ? "button" : undefined}
              tabIndex={step < 2 ? 0 : undefined}
              aria-label={step < 2 ? "Tiếp tục phần giới thiệu" : undefined}
            >
            <div className="intro-scene">
              <AnimatePresence mode="sync">
                {step === 0 ? (
                  <motion.div
                    key="welcome"
                    className="intro-copy"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: reduceMotion ? 0 : 1.1, ease: softEase }}
                  >
                    <motion.h1
                      animate={floatingMotion}
                      transition={{ duration: 8.8, repeat: Infinity, ease: floatEase }}
                    >
                      Darling, ohayō
                    </motion.h1>
                    <p>Click anywhere to step inside</p>
                  </motion.div>
                ) : null}

                {step === 1 ? (
                  <motion.div
                    key="japanese"
                    className="intro-copy intro-copy--japanese"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: reduceMotion ? 0 : 1.15, ease: softEase }}
                  >
                    <motion.h1
                      animate={floatingMotion}
                      transition={{ duration: 9.4, repeat: Infinity, ease: floatEase }}
                    >
                      私の人生へようこそ
                    </motion.h1>
                    <p>Click again to reveal the paths</p>
                  </motion.div>
                ) : null}

                {step === 2 ? (
                  <motion.div
                    key="portals"
                    className="portal-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: reduceMotion ? 0 : 0.72, ease: softEase }}
                  >
                    <Portal
                      className="portal--library"
                      title="Thư viện"
                      description="Những khung hình giữ lại cảm xúc."
                      icon={<Images aria-hidden="true" size={24} strokeWidth={1.5} />}
                      index={0}
                      reduceMotion={Boolean(reduceMotion)}
                      onClick={() => enterPath("/thu-vien")}
                    />
                    <Portal
                      className="portal--music"
                      title="Âm nhạc"
                      description="Một căn phòng dành cho những âm thanh riêng."
                      icon={<Headphones aria-hidden="true" size={24} strokeWidth={1.5} />}
                      index={1}
                      reduceMotion={Boolean(reduceMotion)}
                      onClick={() => enterPath("/am-nhac")}
                    />
                    <Portal
                      className="portal--work"
                      title="Portfolio"
                      description="Công việc, thử nghiệm và những điều đang thành hình."
                      icon={<BriefcaseBusiness aria-hidden="true" size={24} strokeWidth={1.5} />}
                      index={2}
                      reduceMotion={Boolean(reduceMotion)}
                      onClick={() => enterPath("/portfolio")}
                    />
                  </motion.div>
                ) : null}
                </AnimatePresence>
              </div>
            </div>
          ) : null}
        </motion.main>
      );
});

type PortalProps = {
  className: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  reduceMotion: boolean;
  onClick: () => void;
};

const Portal = memo(function Portal({
  className,
  title,
  description,
  icon,
  index,
  reduceMotion,
  onClick,
}: PortalProps) {
  return (
    <motion.button
      type="button"
      className={`portal ${className}`}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.62, delay: reduceMotion ? 0 : index * 0.08, ease: softEase }}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <span className="portal__icon">{icon}</span>
      <span className="portal__copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <span className="portal__arrow" aria-hidden="true">
        <ArrowUpRight size={18} strokeWidth={1.5} />
      </span>
    </motion.button>
  );
});
