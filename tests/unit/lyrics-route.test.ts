import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/music/lyrics/route";

describe("lyrics API identity", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("identifies requests with the public production domain", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json([{
      albumName: "25",
      artistName: "Adele",
      duration: 285,
      id: 1,
      instrumental: false,
      plainLyrics: "Hello",
      syncedLyrics: "[00:01.00]Hello",
      trackName: "Hello",
    }]));
    vi.stubGlobal("fetch", fetchMock);

    await GET(new Request("https://example.test/api/music/lyrics?track_name=Hello&artist_name=Adele"));

    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      "User-Agent": "FujiwaraDaiki/3.0 (https://fujiwaradaiki.vercel.app)",
    });
  });
});
