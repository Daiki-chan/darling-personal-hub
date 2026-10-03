import { NextResponse } from "next/server";
import { fetchPublishedVaultTracks } from "@/lib/music/catalog-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const tracks = await fetchPublishedVaultTracks();
  return NextResponse.json({
    tracks,
    count: tracks.length,
  });
}
