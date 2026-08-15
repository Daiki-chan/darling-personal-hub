// ==========================================================================
// DARLING PERSONAL HUB — MEMORY ARCHIVE DATA MODEL & CONTROLLED SPREADS
// ==========================================================================
// Architecture: Black Label Thematic Memory Archive (GAME / PLACE)
// Note: Authentic personal memories are added directly by the user.

export type MemorySubject = "game" | "place";
export type EditorialScale = "feature" | "standard" | "compact" | "panorama";
export type AspectRatio = "16:9" | "21:9" | "3:4" | "4:3" | "1:1" | "16:10";

export interface BaseMemoryFragment {
  id: string; // e.g. "G/001" or "P/001"
  subject: MemorySubject;
  title: string;
  image: string;
  aspectRatio: AspectRatio;
  editorialScale: EditorialScale;
  date?: string;
  year?: string;
  caption?: string;
  featured?: boolean;
}

export interface GameMemoryFragment extends BaseMemoryFragment {
  subject: "game";
  gameTitle: string;
  area?: string;
  character?: string;
}

export interface PlaceMemoryFragment extends BaseMemoryFragment {
  subject: "place";
  location: string;
  coordinates?: string;
}

export type MemoryFragment = GameMemoryFragment | PlaceMemoryFragment;

// --------------------------------------------------------------------------
export const GAME_MEMORIES: GameMemoryFragment[] = [
  {
    id: "G/001",
    subject: "game",
    title: "Sanctuary",
    gameTitle: "Sky: Children of the Light",
    area: "Sanctuary",
    year: "2021",
    date: "2021-12",
    caption: "Kỷ niệm.",
    aspectRatio: "16:9",
    editorialScale: "feature",
    featured: true,
    image: "https://res.cloudinary.com/dndfpxmef/image/upload/v1786779542/sky_1_iunx5o.jpg",
  },
  {
    id: "G/002",
    subject: "game",
    title: "The Crescent Oasis",
    gameTitle: "Sky: Children of the Light",
    area: "The Crescent Oasis",
    year: "2026",
    date: "2026-02",
    caption: "Trùng phùng.",
    aspectRatio: "16:9",
    editorialScale: "standard",
    image: "https://res.cloudinary.com/dndfpxmef/image/upload/v1786803921/de1d68a9819c2fbeb1e351dee9d4e272_u4z2v9.webp",
  },
];

// --------------------------------------------------------------------------
// 02 / PLACE — PLACES I REMEMBER (Personal captures provided by user)
// --------------------------------------------------------------------------
export const PLACE_MEMORIES: PlaceMemoryFragment[] = [];

// --------------------------------------------------------------------------
// SPREAD PATTERNS & COMPOSER TYPES
// --------------------------------------------------------------------------
export type GameSpreadPattern =
  | "feature-secondary" // 2 items: 1 large feature (8 cols) + 1 secondary (4 cols)
  | "triptych"          // 3 items: 3 equal 16:9 items (4 cols each)
  | "cinematic"         // 1 item: full width 21:9 panorama / lead frame (12 cols)
  | "duo"               // 2 items: 2 balanced 16:9 items (6 cols each)
  | "solo";             // 1 item: centered/wide single item fallback (12 cols)

export interface GameSpread {
  id: string;
  pattern: GameSpreadPattern;
  items: GameMemoryFragment[];
}

export type PlaceSpreadPattern =
  | "landscape-portrait" // 2 items: Left 16:10 / 4:3 (7 cols) + Right 3:4 (5 cols)
  | "offset-duo"         // 2 items: Left 3:4 (5 cols) + Right 4:3 (7 cols) with controlled vertical offset
  | "panorama"           // 1 item: Full width 21:9 travel panorama (12 cols)
  | "duo"                // 2 items: 2 balanced items (6 / 6)
  | "solo";              // 1 item: single landscape or portrait (centered/wide)

export interface PlaceSpread {
  id: string;
  pattern: PlaceSpreadPattern;
  items: PlaceMemoryFragment[];
}

export type EditorialSpread = GameSpread | PlaceSpread;

// --------------------------------------------------------------------------
// CONTROLLED SPREAD COMPOSERS (Guarantees zero orphan items & zero empty holes)
// --------------------------------------------------------------------------
export function composeGameSpreads(memories: GameMemoryFragment[]): GameSpread[] {
  const spreads: GameSpread[] = [];
  let i = 0;
  let spreadIndex = 0;

  while (i < memories.length) {
    const remaining = memories.length - i;
    const current = memories[i];

    // Case: Panorama scale item takes a full cinematic spread
    if (current.editorialScale === "panorama" || current.aspectRatio === "21:9") {
      spreads.push({
        id: `game-spread-${++spreadIndex}`,
        pattern: "cinematic",
        items: [current],
      });
      i += 1;
      continue;
    }

    // Remaining count handlers
    if (remaining === 1) {
      spreads.push({
        id: `game-spread-${++spreadIndex}`,
        pattern: "solo",
        items: [memories[i]],
      });
      i += 1;
    } else if (remaining === 2) {
      const pattern =
        current.editorialScale === "feature" || memories[i + 1]?.editorialScale === "feature"
          ? "feature-secondary"
          : "duo";
      spreads.push({
        id: `game-spread-${++spreadIndex}`,
        pattern,
        items: [memories[i], memories[i + 1]],
      });
      i += 2;
    } else if (remaining === 3) {
      spreads.push({
        id: `game-spread-${++spreadIndex}`,
        pattern: "triptych",
        items: [memories[i], memories[i + 1], memories[i + 2]],
      });
      i += 3;
    } else if (remaining === 4) {
      spreads.push({
        id: `game-spread-${++spreadIndex}`,
        pattern: "duo",
        items: [memories[i], memories[i + 1]],
      });
      spreads.push({
        id: `game-spread-${++spreadIndex}`,
        pattern: "duo",
        items: [memories[i + 2], memories[i + 3]],
      });
      i += 4;
    } else {
      // 5 or more items left:
      if (current.editorialScale === "feature" || remaining === 5) {
        spreads.push({
          id: `game-spread-${++spreadIndex}`,
          pattern: "feature-secondary",
          items: [memories[i], memories[i + 1]],
        });
        i += 2;
      } else {
        spreads.push({
          id: `game-spread-${++spreadIndex}`,
          pattern: "triptych",
          items: [memories[i], memories[i + 1], memories[i + 2]],
        });
        i += 3;
      }
    }
  }

  return spreads;
}

export function composePlaceSpreads(memories: PlaceMemoryFragment[]): PlaceSpread[] {
  const spreads: PlaceSpread[] = [];
  let i = 0;
  let spreadIndex = 0;

  while (i < memories.length) {
    const remaining = memories.length - i;
    const current = memories[i];

    // Case: Panorama scale item takes a full panorama spread
    if (current.editorialScale === "panorama" || current.aspectRatio === "21:9") {
      spreads.push({
        id: `place-spread-${++spreadIndex}`,
        pattern: "panorama",
        items: [current],
      });
      i += 1;
      continue;
    }

    if (remaining === 1) {
      spreads.push({
        id: `place-spread-${++spreadIndex}`,
        pattern: "solo",
        items: [memories[i]],
      });
      i += 1;
    } else if (remaining === 2) {
      const isPortrait = current.aspectRatio === "3:4" || memories[i + 1]?.aspectRatio === "3:4";
      const pattern = isPortrait ? "landscape-portrait" : "duo";
      spreads.push({
        id: `place-spread-${++spreadIndex}`,
        pattern,
        items: [memories[i], memories[i + 1]],
      });
      i += 2;
    } else if (remaining === 3) {
      spreads.push({
        id: `place-spread-${++spreadIndex}`,
        pattern: "landscape-portrait",
        items: [memories[i], memories[i + 1]],
      });
      spreads.push({
        id: `place-spread-${++spreadIndex}`,
        pattern: "solo",
        items: [memories[i + 2]],
      });
      i += 3;
    } else {
      // 4 or more items: alternate between landscape-portrait and offset-duo
      const pattern = spreadIndex % 2 === 0 ? "landscape-portrait" : "offset-duo";
      spreads.push({
        id: `place-spread-${++spreadIndex}`,
        pattern,
        items: [memories[i], memories[i + 1]],
      });
      i += 2;
    }
  }

  return spreads;
}

// --------------------------------------------------------------------------
// COMBINED ARCHIVE & DERIVED STATS UTILITIES
// --------------------------------------------------------------------------
export const ALL_MEMORIES: MemoryFragment[] = [
  ...GAME_MEMORIES,
  ...PLACE_MEMORIES,
];

export function getGameMemories(): GameMemoryFragment[] {
  return GAME_MEMORIES;
}

export function getPlaceMemories(): PlaceMemoryFragment[] {
  return PLACE_MEMORIES;
}

export function getMemoriesStats() {
  const gameCount = GAME_MEMORIES.length;
  const placeCount = PLACE_MEMORIES.length;
  const total = gameCount + placeCount;

  const featuredGame = GAME_MEMORIES.find((m) => m.featured) || GAME_MEMORIES[0] || null;
  const featuredPlace = PLACE_MEMORIES.find((m) => m.featured) || PLACE_MEMORIES[0] || null;

  return {
    total,
    gameCount,
    placeCount,
    featuredGame,
    featuredPlace,
  };
}

export function getRandomMemory(excludeId?: string): MemoryFragment | null {
  if (ALL_MEMORIES.length === 0) return null;
  const pool = excludeId
    ? ALL_MEMORIES.filter((m) => m.id !== excludeId)
    : ALL_MEMORIES;

  if (pool.length === 0) return ALL_MEMORIES[0] || null;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || null;
}
