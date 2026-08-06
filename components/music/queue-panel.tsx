"use client";

import { useRef } from "react";
import { ArrowDown, ArrowUp, GripVertical, ListMusic, Trash2, X } from "lucide-react";
import { useMusicPlayer } from "./music-player-core";
import styles from "./music-app.module.css";

export function QueuePanel({ compact = false }: { compact?: boolean }) {
  const { clearQueue, playNow, removeFromQueue, reorderQueue, state } = useMusicPlayer();
  const draggingRef = useRef<number | null>(null);

  return (
    <section aria-labelledby={compact ? "expanded-queue-title" : "queue-title"} className={styles.queuePanel}>
      <div className={styles.panelHeading}>
        <div>
          <h2 id={compact ? "expanded-queue-title" : "queue-title"}>Hàng đợi</h2>
          <span>{state.queue.length ? `${state.queue.length} bài` : "Chưa có bài nào"}</span>
        </div>
        <button disabled={state.queue.length <= 1} onClick={clearQueue} type="button">
          <Trash2 aria-hidden="true" size={16} />
          <span>Xóa hàng đợi</span>
        </button>
      </div>

      {!state.queue.length ? (
        <div className={styles.emptyPanel}>
          <ListMusic aria-hidden="true" size={28} />
          <strong>Hàng đợi đang yên</strong>
          <span>Tìm một bài hát rồi thêm những bài bạn muốn nghe tiếp.</span>
        </div>
      ) : (
        <ol className={styles.queueList}>
          {state.queue.map((track, index) => {
            const current = track.videoId === state.currentTrack?.videoId;
            const unavailable = state.unavailableVideoIds.includes(track.videoId);
            return (
              <li
                className={current ? styles.queueItemActive : undefined}
                draggable
                key={track.videoId}
                onDragOver={(event) => event.preventDefault()}
                onDragStart={() => { draggingRef.current = index; }}
                onDrop={() => {
                  if (draggingRef.current !== null) reorderQueue(draggingRef.current, index);
                  draggingRef.current = null;
                }}
              >
                <GripVertical aria-hidden="true" className={styles.dragHandle} size={17} />
                <button
                  className={styles.queueMain}
                  disabled={unavailable}
                  onClick={() => playNow(track)}
                  type="button"
                >
                  <img alt="" height="48" loading="lazy" src={track.thumbnail} width="48" />
                  <span>
                    <strong>{track.title}</strong>
                    <small>{unavailable ? "Không thể phát" : track.artist}</small>
                  </span>
                </button>
                <div className={styles.queueActions}>
                  <button
                    aria-label="Đưa bài lên"
                    disabled={index === 0}
                    onClick={() => reorderQueue(index, index - 1)}
                    type="button"
                  >
                    <ArrowUp aria-hidden="true" size={15} />
                  </button>
                  <button
                    aria-label="Đưa bài xuống"
                    disabled={index === state.queue.length - 1}
                    onClick={() => reorderQueue(index, index + 1)}
                    type="button"
                  >
                    <ArrowDown aria-hidden="true" size={15} />
                  </button>
                  <button aria-label={`Xóa ${track.title}`} onClick={() => removeFromQueue(track.videoId)} type="button">
                    <X aria-hidden="true" size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
