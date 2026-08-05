"use client";

import { Disc3, Pause, Play, Volume2 } from "lucide-react";
import { useState } from "react";

const tracks = [
  { id: "track-one", title: "Track placeholder 01", mood: "Dream pop" },
  { id: "track-two", title: "Track placeholder 02", mood: "Ambient" },
  { id: "track-three", title: "Track placeholder 03", mood: "Late night" },
  { id: "track-four", title: "Track placeholder 04", mood: "Instrumental" },
];

export function MusicDeck() {
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const activeTitle = tracks.find((track) => track.id === activeTrack)?.title;

  return (
    <div className="music-layout">
      <div className="player-stage">
        <div className="album-placeholder" role="img" aria-label="Bìa album placeholder">
          <Disc3 aria-hidden="true" size={42} strokeWidth={1.5} />
          <span>Bìa album placeholder</span>
        </div>

        <div className="player-meta" aria-live="polite">
          <div>
            <span className="player-label">Now selected</span>
            <strong>{activeTitle ?? "Chọn một track bên cạnh"}</strong>
          </div>
          <Volume2 aria-hidden="true" size={20} strokeWidth={1.5} />
        </div>

        <div className={`waveform ${activeTrack ? "waveform--active" : ""}`} aria-hidden="true">
          {Array.from({ length: 32 }).map((_, index) => (
            <span key={index} style={{ "--bar-index": index } as React.CSSProperties} />
          ))}
        </div>

        <p className="player-note">
          {activeTrack
            ? "Đang mô phỏng phát nhạc. Hãy gắn file audio thật vào track này."
            : "Chưa có file âm thanh. Khu vực player đã sẵn sàng để gắn nhạc."}
        </p>
      </div>

      <div className="track-list" aria-label="Danh sách nhạc placeholder">
        {tracks.map((track) => {
          const isActive = activeTrack === track.id;
          return (
            <button
              type="button"
              className={`track-row ${isActive ? "track-row--active" : ""}`}
              key={track.id}
              onClick={() => setActiveTrack(isActive ? null : track.id)}
              aria-pressed={isActive}
            >
              <span className="track-control">
                {isActive ? (
                  <Pause aria-hidden="true" size={18} strokeWidth={1.5} />
                ) : (
                  <Play aria-hidden="true" size={18} strokeWidth={1.5} />
                )}
              </span>
              <span className="track-copy">
                <strong>{track.title}</strong>
                <span>{track.mood}</span>
              </span>
              <span className="track-status">{isActive ? "Dừng" : "Mô phỏng"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
