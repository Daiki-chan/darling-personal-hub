import {
  getCobaltApiBases,
  getInvidiousApiBases,
  getPipedApiBases,
  isSafeRemoteUrl,
  selectAudioStream,
  selectInvidiousAudioStream,
  type InvidiousVideoResponse,
  type PipedStreamResponse,
} from "@/lib/piped";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CachedStream = {
  expiresAt: number;
  mimeType: string;
  url: string;
};

type CobaltResponse = {
  status?: string;
  url?: string;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Range",
};

const streamCache = new Map<string, CachedStream>();

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: CORS_HEADERS });
}

async function resolveCobaltStream(videoId: string) {
  const bases = getCobaltApiBases();
  const apiKey = process.env.COBALT_API_KEY?.trim();

  for (const base of bases) {
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "DarlingPersonalHub/1.0",
    };
    if (apiKey) {
      headers.Authorization = `Api-Key ${apiKey}`;
    }

    try {
      const response = await fetch(`${base}/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${videoId}`,
          downloadMode: "audio",
          audioFormat: "best",
          alwaysProxy: true,
          disableMetadata: true,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as CobaltResponse;
      if ((payload.status !== "tunnel" && payload.status !== "redirect" && payload.status !== "picker") || !payload.url) {
        continue;
      }
      if (!isSafeRemoteUrl(payload.url)) {
        continue;
      }

      return {
        expiresAt: Date.now() + 3 * 60 * 1000,
        mimeType: "audio/webm",
        url: payload.url,
      };
    } catch {
      continue;
    }
  }

  return null;
}

async function resolveStream(videoId: string) {
  const cached = streamCache.get(videoId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  // 1. Try Cobalt API instances
  const cobaltStream = await resolveCobaltStream(videoId);
  if (cobaltStream) {
    streamCache.set(videoId, cobaltStream);
    return cobaltStream;
  }

  // 2. Fallback to Piped API instances
  for (const base of getPipedApiBases()) {
    try {
      const metadata = await fetch(`${base}/streams/${videoId}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "DarlingPersonalHub/1.0",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });

      if (!metadata.ok) {
        continue;
      }

      const payload = (await metadata.json()) as PipedStreamResponse;
      const selected = selectAudioStream(payload.audioStreams);
      if (!selected?.url || !isSafeRemoteUrl(selected.url)) {
        continue;
      }

      const resolved = {
        expiresAt: Date.now() + 4 * 60 * 1000,
        mimeType: selected.mimeType || "audio/mp4",
        url: selected.url,
      };
      streamCache.set(videoId, resolved);
      return resolved;
    } catch {
      continue;
    }
  }

  // 3. Fallback to Invidious API instances
  for (const base of getInvidiousApiBases()) {
    try {
      const metadata = await fetch(`${base}/api/v1/videos/${videoId}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "DarlingPersonalHub/1.0",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });

      if (!metadata.ok) {
        continue;
      }

      const payload = (await metadata.json()) as InvidiousVideoResponse;
      const selected = selectInvidiousAudioStream(payload.adaptiveFormats);
      if (!selected?.url || !isSafeRemoteUrl(selected.url)) {
        continue;
      }

      const resolved = {
        expiresAt: Date.now() + 4 * 60 * 1000,
        mimeType: selected.type || "audio/webm",
        url: selected.url,
      };
      streamCache.set(videoId, resolved);
      return resolved;
    } catch {
      continue;
    }
  }

  throw new Error("AUDIO_STREAM_NOT_FOUND");
}

export async function GET(request: Request) {
  const videoId = new URL(request.url).searchParams.get("videoId")?.trim() ?? "";
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return errorResponse("videoId không hợp lệ.", 400);
  }

  try {
    const stream = await resolveStream(videoId);
    const range = request.headers.get("range");
    const headers: HeadersInit = {
      Accept: stream.mimeType,
      "User-Agent": "DarlingPersonalHub/1.0",
    };
    if (range) {
      headers.Range = range;
    }

    const upstream = await fetch(stream.url, {
      headers,
      cache: "no-store",
      redirect: "follow",
    });

    if (!upstream.ok || !upstream.body) {
      return errorResponse("Luồng âm thanh tạm thời không khả dụng.", 502);
    }

    const responseHeaders = new Headers({
      "Accept-Ranges": upstream.headers.get("accept-ranges") || "bytes",
      "Cache-Control": "private, no-store",
      "Content-Type": upstream.headers.get("content-type") || stream.mimeType,
      ...CORS_HEADERS,
    });

    for (const name of ["content-length", "content-range", "etag", "last-modified"]) {
      const value = upstream.headers.get(name);
      if (value) {
        responseHeaders.set(name, value);
      }
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return errorResponse("Không thể tạo luồng phát cho bài hát này.", 502);
  }
}
