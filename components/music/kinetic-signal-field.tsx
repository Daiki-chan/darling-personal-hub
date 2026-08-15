"use client";

import { useReducedMotion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { getPlayheadScale, shouldRunSignalTicker } from "@/lib/music/signal-motion";
import { useMusicPlayer } from "./music-player-core";
import styles from "./music-app.module.css";

export const KineticSignalField = memo(function KineticSignalField() {
  const { clock, state } = useMusicPlayer();
  const reduceMotion = Boolean(useReducedMotion());
  const track = state.currentTrack;
  const isPlaying = state.isPlaying;

  const containerRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const sliceTopRef = useRef<HTMLSpanElement>(null);
  const sliceMidRef = useRef<HTMLSpanElement>(null);
  const sliceBotRef = useRef<HTMLSpanElement>(null);

  // Local accumulated phase for pause/resume consistency without phase jumps
  const phaseRef = useRef(0);

  // Active track state snapshot for smooth slice displacement transitions
  const [displayTrack, setDisplayTrack] = useState(track);
  const isTransitioningRef = useRef(false);
  const [inViewport, setInViewport] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const runTicker = shouldRunSignalTicker({
    hasTrack: Boolean(track),
    inViewport,
    isDocumentVisible,
    isPlaying,
    reducedMotion: reduceMotion,
  });

  // Track change animation: slice displacement -> mask collapse -> content swap -> opposing mask reveal
  useGSAP(
    () => {
      if (!containerRef.current || reduceMotion || !track) {
        setDisplayTrack(track);
        return;
      }

      if (track?.videoId !== displayTrack?.videoId) {
        isTransitioningRef.current = true;

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          onComplete: () => {
            isTransitioningRef.current = false;
          },
        });

        if (sliceTopRef.current && sliceMidRef.current && sliceBotRef.current) {
          tl.to(sliceTopRef.current, { x: -40, opacity: 0, duration: 0.25 }, 0)
            .to(sliceMidRef.current, { x: 40, opacity: 0, duration: 0.25 }, 0.05)
            .to(sliceBotRef.current, { x: -20, opacity: 0, duration: 0.25 }, 0.1);
        }

        tl.add(() => {
          setDisplayTrack(track);
        }, 0.28);

        if (sliceTopRef.current && sliceMidRef.current && sliceBotRef.current) {
          tl.fromTo(
            sliceTopRef.current,
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.35, ease: "power3.out" },
            0.32
          )
            .fromTo(
              sliceMidRef.current,
              { x: -50, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.35, ease: "power3.out" },
              0.36
            )
            .fromTo(
              sliceBotRef.current,
              { x: 30, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.35, ease: "power3.out" },
              0.4
            );
        }
      }
    },
    { dependencies: [track?.videoId], scope: containerRef }
  );

  // Imperative 60fps Signal Drift via GSAP Ticker (Paused callback removed when paused to FREEZE exact frame)

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDocumentVisibility = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(Boolean(entry?.isIntersecting)),
      { threshold: 0.08 }
    );

    updateDocumentVisibility();
    observer.observe(container);
    document.addEventListener("visibilitychange", updateDocumentVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateDocumentVisibility);
    };
  }, [track?.videoId]);
  useEffect(() => {
    if (!containerRef.current || !runTicker) return;

    const setTopX = gsap.quickSetter(sliceTopRef.current, "x", "px");
    const setMidX = gsap.quickSetter(sliceMidRef.current, "x", "px");
    const setBotX = gsap.quickSetter(sliceBotRef.current, "x", "px");

    const updateSignal = (_time: number, deltaTime: number) => {
      if (isTransitioningRef.current) return;
      const deltaSec = Math.min(deltaTime / 1000, 0.1);
      phaseRef.current += deltaSec * 0.8;

      const phase = phaseRef.current;
      setTopX(Math.sin(phase) * 14);
      setMidX(Math.cos(phase * 0.8) * -18);
      setBotX(Math.sin(phase * 1.2) * 10);
    };

    gsap.ticker.add(updateSignal);
    return () => {
      gsap.ticker.remove(updateSignal);
    };
  }, [runTicker]);

  // Imperative Playhead Cut update via direct clock subscription (0% React rerenders)
  useEffect(() => {
    if (!playheadRef.current || !track) return;

    const setProgressX = gsap.quickSetter(playheadRef.current, "x", "px");

    const updatePlayhead = () => {
      const snap = clock.getSnapshot();
      const dur = snap.duration || state.duration || 0;
      const scale = getPlayheadScale(snap.currentTime || 0, dur);
      const travel = Math.max(0, (containerRef.current?.clientWidth ?? 0) - 1);
      setProgressX(scale * travel);
    };

    updatePlayhead();
    const unsubscribe = clock.subscribe(updatePlayhead);
    return () => {
      unsubscribe();
    };
  }, [clock, state.duration, track]);

  if (!track) {
    return (
      <div ref={containerRef} className={styles.signalFieldRoot} data-has-track={false} aria-hidden="true">
        <div className={styles.signalGrid}>
          <div className={styles.signalHairlineHoriz} />
          <div className={styles.signalHairlineVert} />
        </div>
        <div className={styles.signalDormantWrap}>
          <span className={styles.signalDormantMeta}>SIGNAL / 00</span>
          <h3 className={styles.signalDormantTitle}>DORMANT SOUNDSPACE</h3>
          <p className={styles.signalDormantSub}>SELECT A TRACK TO INITIALIZE KINETIC SIGNAL</p>
        </div>
      </div>
    );
  }

  const titleText = displayTrack?.title || track.title;
  const artistText = displayTrack?.artist || track.artist;
  const statusLabel = isPlaying ? "ACTIVE" : "PAUSED";

  return (
    <div
      ref={containerRef}
      className={styles.signalFieldRoot}
      data-has-track={true}
      data-playing={isPlaying}
      data-ticker-active={runTicker}
      aria-hidden="true"
    >
      {/* Layer A: Architectural Hairline Grid */}
      <div className={styles.signalGrid}>
        <div className={styles.signalHairlineHoriz} />
        <div className={styles.signalHairlineVert} />
      </div>

      {/* Layer B: Typographic Sculpture Slices */}
      <div className={styles.signalSculpture}>
        <div className={styles.signalSliceLine}>
          <span ref={sliceTopRef} className={`${styles.signalSlice} ${styles.signalSliceTop}`}>
            {titleText}
          </span>
        </div>
        <div className={styles.signalSliceLine}>
          <span ref={sliceMidRef} className={`${styles.signalSlice} ${styles.signalSliceMid}`}>
            {titleText}
          </span>
        </div>
        <div className={styles.signalSliceLine}>
          <span ref={sliceBotRef} className={`${styles.signalSlice} ${styles.signalSliceBot}`}>
            {titleText}
          </span>
        </div>
        <p className={styles.signalSubArtist}>{artistText}</p>
      </div>

      {/* Layer C: Playhead Cut & Technical Metadata */}
      <div ref={playheadRef} className={styles.signalPlayhead} />

      <div className={styles.signalMeta}>
        <span className={styles.signalMetaTag}>SIGNAL / 02</span>
        <span className={styles.signalMetaStatus}>{statusLabel}</span>
      </div>
    </div>
  );
});
