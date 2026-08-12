"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useMusicPlayer } from "./music-player-core";
import styles from "./music-app.module.css";

function seedValue(input: string) {
  let value = 2166136261;
  for (const character of input) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return Math.abs(value >>> 0);
}

export function SimulatedVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const { clock, state } = useMusicPlayer();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !state.currentTrack) return;
    let frame = 0;
    let width = 0;
    let height = 0;
    let lastPaint = 0;
    let energy = state.isPlaying ? 0.85 : 0.08;
    const seed = seedValue(state.currentTrack.videoId);
    const accent = state.accent || "#8f8a82";

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const paint = (timestamp: number) => {
      if (document.hidden || width <= 1 || height <= 1) {
        frame = 0;
        return;
      }
      if (timestamp - lastPaint < 33 && !reduceMotion) {
        frame = requestAnimationFrame(paint);
        return;
      }
      lastPaint = timestamp;

      const { currentTime, duration } = clock.getSnapshot();
      const progress = duration ? currentTime / duration : 0;
      const effectiveVolFactor = state.volume.muted ? 0 : state.volume.volume / 100;
      const targetEnergy = state.isPlaying ? 0.45 + effectiveVolFactor * 0.55 : 0.05;
      energy += (targetEnergy - energy) * (state.isPlaying ? 0.08 : 0.04);

      context.clearRect(0, 0, width, height);

      const bars = Math.max(20, Math.min(48, Math.floor(width / 8)));
      const gap = 2;
      const barWidth = Math.max(1.5, (width - gap * (bars - 1)) / bars);

      for (let index = 0; index < bars; index += 1) {
        const phase = timestamp * 0.0012 + index * 0.45 + seed * 0.00001;
        const slow = Math.sin(phase) * 0.5 + 0.5;
        const detail = Math.sin(phase * 0.73 + progress * Math.PI * 6) * 0.5 + 0.5;
        const strength = reduceMotion ? 0.12 : (0.12 + slow * 0.52 + detail * 0.22) * energy;
        const barHeight = Math.max(2, strength * height * 0.82);
        const x = index * (barWidth + gap);
        const y = (height - barHeight) / 2;

        context.globalAlpha = 0.25 + strength * 0.65;
        context.fillStyle = index % 3 === 0 ? "#f3f3f5" : accent;
        context.fillRect(x, y, barWidth, barHeight);
      }
      context.globalAlpha = 1;

      if (!reduceMotion) frame = requestAnimationFrame(paint);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    frame = requestAnimationFrame(paint);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [clock, reduceMotion, state.accent, state.currentTrack?.videoId, state.isPlaying, state.volume.volume]);

  return (
    <div className={styles.visualizer}>
      <canvas aria-hidden="true" ref={canvasRef} />
      <span>MOTION FIELD</span>
    </div>
  );
}
