import type { PersistedMusicState } from "./types";

const DATABASE_NAME = "darling-music-hub";
const STORE_NAME = "music-state";
const STATE_KEY = "player-core-v2";
const LEGACY_KEYS = ["darling-music-player", "darling-audio-cache", "music-stream-url", "yt-stream-cache"];
let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Không thể mở bộ nhớ nhạc."));
  });
  return databasePromise;
}

export async function loadPersistedMusicState() {
  if (typeof window === "undefined" || !("indexedDB" in window)) return null;
  const database = await openDatabase();
  return new Promise<PersistedMusicState | null>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(STATE_KEY);
    request.onsuccess = () => resolve((request.result as PersistedMusicState | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error("Không thể đọc bộ nhớ nhạc."));
  });
}

export async function savePersistedMusicState(state: PersistedMusicState) {
  if (typeof window === "undefined" || !("indexedDB" in window)) return;
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(state, STATE_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Không thể lưu bộ nhớ nhạc."));
  });
}

export function cleanLegacyMusicStorage() {
  if (typeof window === "undefined") return;
  try {
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in private or restricted browsing modes.
  }
}
