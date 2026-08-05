"use client";

import { useEffect, useRef } from "react";

type AudioVisualizerProps = {
  analyser: AnalyserNode | null;
  active: boolean;
  reducedMotion: boolean;
};

export function AudioVisualizer({ analyser, active, reducedMotion }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const styles = getComputedStyle(canvas);
      const accent = styles.getPropertyValue("--music-accent").trim() || "#8b5cf6";
      const columns = Math.max(28, Math.min(74, Math.floor(width / 9)));
      const gap = 3;
      const barWidth = Math.max(1.5, (width - gap * (columns - 1)) / columns);

      if (data && analyser && active && !reducedMotion) {
        analyser.getByteFrequencyData(data);
      }

      for (let index = 0; index < columns; index += 1) {
        const sampleIndex = data ? Math.floor((index / columns) * data.length * 0.68) : 0;
        const signal = data && active ? data[sampleIndex] / 255 : 0;
        const idle = 0.08 + Math.sin(index * 0.73) * 0.025;
        const strength = reducedMotion ? 0.13 : Math.max(idle, signal);
        const barHeight = Math.max(2, strength * height * 0.82);
        const x = index * (barWidth + gap);
        const y = (height - barHeight) / 2;

        context.globalAlpha = 0.22 + strength * 0.72;
        context.fillStyle = accent;
        context.beginPath();
        context.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        context.fill();
      }

      context.globalAlpha = 1;
      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reducedMotion) {
        draw();
      }
    });

    observer.observe(canvas);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [active, analyser, reducedMotion]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
