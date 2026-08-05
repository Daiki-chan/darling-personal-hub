import {
  getPipedApiBases,
  isSafeRemoteUrl,
  selectAudioStream,
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

const streamCache = new Map<string, CachedStream>();

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function resolveCobaltStream(videoId: string) {
  const base = process.env.COBALT_API_URL?.trim().replace(/\/+$/, "");
  if (!base) {
    return null;
  }

  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": "DarlingPersonalHub/1.0",
  };
  const apiKey = process.env.COBALT_API_KEY?.trim();
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
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as CobaltResponse;
    if ((payload.status !== "tunnel" && payload.status !== "redirect") || !payload.url) {
      return null;
    }
    if (!isSafeRemoteUrl(payload.url)) {
      return null;
    }

    return {
      expiresAt: Date.now() + 3 * 60 * 1000,
      mimeType: "audio/webm",
      url: payload.url,
    };
  } catch {
    return null;
  }
}

async function resolveStream(videoId: string) {
  const cached = streamCache.get(videoId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  const cobaltStream = await resolveCobaltStream(videoId);
  if (cobaltStream) {
    streamCache.set(videoId, cobaltStream);
    return cobaltStream;
  }

  for (const base of getPipedApiBases()) {
    try {
      const metadata = await fetch(`${base}/streams/${videoId}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "DarlingPersonalHub/1.0",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
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
