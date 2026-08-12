"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowDown, ArrowUp, GripVertical, Trash2, X } from "lucide-react";
import { useMusicPlayer } from "./music-player-core";
import styles from "./music-app.module.css";

export function QueuePanel({ compact = false }: { compact?: boolean }) {
  const { clearQueue, playNow, removeFromQueue, reorderQueue, state } = useMusicPlayer();
  const draggingRef = useRef<number | null>(null);

  return (
    <section aria-labelledby={compact ? "expanded-queue-title" : "queue-title"} className={styles.queuePanel}>
      <div className={styles.chapterHeading}>
        <div>
          <h2 id={compact ? "expanded-queue-title" : "queue-title"} className={styles.chapterTitle}>
            {compact ? "QUEUE MANIFEST" : "QUEUE / 07"}
          </h2>
          <span className={styles.chapterSub}>{state.queue.length} TRACKS IN MANIFEST</span>
        </div>
        <button
          className={styles.queueClearBtn}
          disabled={state.queue.length <= 1}
          onClick={clearQueue}
          type="button"
        >
          <Trash2 aria-hidden="true" size={14} />
          <span>CLEAR MANIFEST</span>
        </button>
      </div>

      {!state.queue.length ? (
        <div className={styles.emptyPanel}>
          <strong>MANIFEST DORMANT</strong>
          <span>Search or select tracks to append to the active queue.</span>
        </div>
      ) : (
        <ol className={styles.queueList}>
          {state.queue.map((track, index) => {
            const current = track.videoId === state.currentTrack?.videoId;
            const unavailable = state.unavailableVideoIds.includes(track.videoId);
            const formattedIndex = String(index + 1).padStart(2, "0");

            return (
              <li
                key={track.videoId}
                className={`${styles.queueRow} ${current ? styles.queueRowActive : ""}`}
                draggable
                onDragOver={(event) => event.preventDefault()}
                onDragStart={() => {
                  draggingRef.current = index;
                }}
                onDrop={() => {
                  if (draggingRef.current !== null) reorderQueue(draggingRef.current, index);
                  draggingRef.current = null;
                }}
              >
                <span className={styles.queueRowIdx}>{formattedIndex}</span>
                <GripVertical aria-hidden="true" className={styles.dragHandle} size={15} />

                <button
                  className={styles.queueMainBtn}
                  disabled={unavailable}
                  onClick={() => playNow(track)}
                  type="button"
                >
                  <Image alt="" height={40} sizes="40px" src={track.thumbnail} width={40} />
                  <div className={styles.queueText}>
                    <strong className={styles.queueTitle} title={track.title}>
                      {track.title}
                    </strong>
                    <small className={styles.queueArtist}>
                      {unavailable ? "UNAVAILABLE" : track.artist}
                    </small>
                  </div>
                </button>

                <div className={styles.queueActions}>
                  <button
                    aria-label="Đưa bài lên"
                    disabled={index === 0}
                    onClick={() => reorderQueue(index, index - 1)}
                    type="button"
                  >
                    <ArrowUp aria-hidden="true" size={13} />
                  </button>
                  <button
                    aria-label="Đưa bài xuống"
                    disabled={index === state.queue.length - 1}
                    onClick={() => reorderQueue(index, index + 1)}
                    type="button"
                  >
                    <ArrowDown aria-hidden="true" size={13} />
                  </button>
                  <button
                    aria-label={`Xóa ${track.title}`}
                    onClick={() => removeFromQueue(track.videoId)}
                    type="button"
                  >
                    <X aria-hidden="true" size={14} />
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
