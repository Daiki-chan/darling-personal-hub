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
    let energy = state.isPlaying ? 1 : 0.16;
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
      if (timestamp - lastPaint < 50 && !reduceMotion) {
        frame = requestAnimationFrame(paint);
        return;
      }
      lastPaint = timestamp;
      const { currentTime, duration } = clock.getSnapshot();
      const progress = duration ? currentTime / duration : 0;
      const targetEnergy = state.isPlaying ? 0.55 + state.volume.volume / 100 * 0.45 : 0.11;
      energy += (targetEnergy - energy) * (state.isPlaying ? 0.08 : 0.035);
      context.clearRect(0, 0, width, height);
      const bars = Math.max(16, Math.min(36, Math.floor(width / 10)));
      const gap = 3;
      const barWidth = Math.max(2, (width - gap * (bars - 1)) / bars);

      for (let index = 0; index < bars; index += 1) {
        const phase = timestamp * 0.0015 + index * 0.61 + seed * 0.00001;
        const slow = Math.sin(phase) * 0.5 + 0.5;
        const detail = Math.sin(phase * 0.41 + progress * Math.PI * 5) * 0.5 + 0.5;
        const strength = reduceMotion ? 0.16 : (0.14 + slow * 0.48 + detail * 0.2) * energy;
        const barHeight = Math.max(3, strength * height * 0.84);
        const x = index * (barWidth + gap);
        const y = (height - barHeight) / 2;
        context.globalAlpha = 0.22 + strength * 0.68;
        context.fillStyle = accent;
        context.beginPath();
        context.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        context.fill();
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
      <span>Chuyển động mô phỏng</span>
    </div>
  );
}
