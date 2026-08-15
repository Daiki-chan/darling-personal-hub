import { describe, expect, it } from "vitest";
import {
  ALL_MEMORIES,
  composeGameSpreads,
  composePlaceSpreads,
  getGameMemories,
  getMemoriesStats,
  getPlaceMemories,
  getRandomMemory,
  type GameMemoryFragment,
  type PlaceMemoryFragment,
} from "@/lib/memories-data";

describe("Memory Archive Data & Utilities", () => {
  it("should retrieve authentic memory collections correctly", () => {
    const games = getGameMemories();
    const places = getPlaceMemories();

    expect(games.length).toBe(2);
    expect(games[0].id).toBe("G/001");
    expect(games[0].gameTitle).toBe("Sky: Children of the Light");
    expect(games[1].id).toBe("G/002");
    expect(games[1].area).toBe("The Crescent Oasis");
    expect(places.length).toBe(0);
    expect(ALL_MEMORIES.length).toBe(2);
  });

  it("should calculate accurate derived statistics", () => {
    const stats = getMemoriesStats();

    expect(stats.gameCount).toBe(2);
    expect(stats.placeCount).toBe(0);
    expect(stats.total).toBe(2);
    expect(stats.featuredGame?.id).toBe("G/001");
    expect(stats.featuredPlace).toBeNull();
  });

  it("should return a valid memory fragment on getRandomMemory", () => {
    const random = getRandomMemory();
    expect(["G/001", "G/002"]).toContain(random?.id);
  });

  it("should compose controlled game spreads with zero orphan items for mock datasets", () => {
    const createMockGame = (
      idx: number,
      scale: "feature" | "standard" | "compact" | "panorama" = "standard",
      aspectRatio: "16:9" | "21:9" = "16:9"
    ): GameMemoryFragment => ({
      id: `G/${String(idx).padStart(3, "0")}`,
      subject: "game",
      title: `Mock Game ${idx}`,
      gameTitle: "Mock Game",
      image: "/mock.jpg",
      aspectRatio,
      editorialScale: scale,
    });

    [1, 2, 3, 4, 5, 7, 10].forEach((count) => {
      const mockList = Array.from({ length: count }, (_, i) =>
        createMockGame(i + 1, i === 0 ? "feature" : "standard")
      );
      const spreads = composeGameSpreads(mockList);

      const flattenedItems = spreads.flatMap((s) => s.items);
      expect(flattenedItems.length).toBe(count);
      expect(flattenedItems.map((i) => i.id)).toEqual(mockList.map((i) => i.id));

      spreads.forEach((spread) => {
        expect(["feature-secondary", "triptych", "cinematic", "duo", "solo"]).toContain(
          spread.pattern
        );
        expect(spread.items.length).toBeGreaterThan(0);
      });
    });
  });

  it("should compose controlled place spreads with valid photographic spreads for mock datasets", () => {
    const createMockPlace = (
      idx: number,
      scale: "feature" | "standard" | "compact" | "panorama" = "standard",
      aspectRatio: "16:10" | "3:4" | "4:3" | "21:9" = "16:10"
    ): PlaceMemoryFragment => ({
      id: `P/${String(idx).padStart(3, "0")}`,
      subject: "place",
      title: `Mock Place ${idx}`,
      location: "Mock Location",
      image: "/mock.jpg",
      aspectRatio,
      editorialScale: scale,
    });

    [1, 2, 3, 4, 6, 8].forEach((count) => {
      const mockList = Array.from({ length: count }, (_, i) =>
        createMockPlace(i + 1, i === 0 ? "feature" : "standard", i % 2 === 0 ? "16:10" : "3:4")
      );
      const spreads = composePlaceSpreads(mockList);

      const flattenedItems = spreads.flatMap((s) => s.items);
      expect(flattenedItems.length).toBe(count);
      expect(flattenedItems.map((i) => i.id)).toEqual(mockList.map((i) => i.id));

      spreads.forEach((spread) => {
        expect(["landscape-portrait", "offset-duo", "panorama", "duo", "solo"]).toContain(
          spread.pattern
        );
        expect(spread.items.length).toBeGreaterThan(0);
      });
    });
  });

  it("should support graceful missing metadata", () => {
    const minimalGame: GameMemoryFragment = {
      id: "G/999",
      subject: "game",
      title: "Test Game",
      gameTitle: "Test",
      image: "/test.jpg",
      aspectRatio: "16:9",
      editorialScale: "standard",
    };

    expect(minimalGame.area).toBeUndefined();
    expect(minimalGame.caption).toBeUndefined();
    expect(minimalGame.character).toBeUndefined();

    const minimalPlace: PlaceMemoryFragment = {
      id: "P/999",
      subject: "place",
      title: "Test Place",
      location: "Test Location",
      image: "/test.jpg",
      aspectRatio: "4:3",
      editorialScale: "compact",
    };

    expect(minimalPlace.coordinates).toBeUndefined();
    expect(minimalPlace.caption).toBeUndefined();
  });
});
