import "server-only";
import { createHmac } from "node:crypto";
import { ipAddress } from "@vercel/functions";
import { Ratelimit } from "@upstash/ratelimit";
import { getRedisClient } from "./redis";

export type RateLimitType = "search" | "radio";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // in seconds
  retryAfter: number; // in seconds
  environment: string;
};

export type RateLimitConfig = {
  type: RateLimitType;
  store?: unknown;
  now?: () => number;
  ipResolver?: (request: Request) => string;
};

// Memory fallback store for local dev & telemetry
type MemoryRecord = { count: number; expiresAt: number };
const memoryStore = new Map<string, MemoryRecord>();

function cleanMemoryStore(now: number) {
  for (const [key, record] of memoryStore.entries()) {
    if (record.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
}

export function extractClientIp(request: Request): string {
  const vercelIp = ipAddress(request);
  if (vercelIp && vercelIp !== "127.0.0.1" && vercelIp !== "::1") {
    return vercelIp;
  }

  const xRealIp = request.headers.get("x-real-ip")?.trim();
  if (xRealIp) return xRealIp;

  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfConnectingIp) return cfConnectingIp;

  return "127.0.0.1";
}

export function hashIpAddress(ip: string): string {
  if (ip === "127.0.0.1" || ip === "::1") return "localhost";
  const salt = process.env.RATE_LIMIT_IP_SALT?.trim() || "darling-default-salt";
  return createHmac("sha256", salt).update(ip.toLowerCase().trim()).digest("hex").slice(0, 32);
}

export function getRateLimitNamespace(type: RateLimitType): string {
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
  const rawBranch = process.env.VERCEL_GIT_COMMIT_REF?.trim() || "main";
  const normalizedBranch = rawBranch.toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 30);
  const prefix = env === "preview" ? `darling:preview:${normalizedBranch}` : `darling:${env}`;
  return `${prefix}:rate:${type}`;
}

export async function checkRateLimit(
  request: Request,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const nowMs = config.now ? config.now() : Date.now();
  const rawIp = config.ipResolver ? config.ipResolver(request) : extractClientIp(request);
  const hashedIp = hashIpAddress(rawIp);
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
  const namespace = getRateLimitNamespace(config.type);

  // Define limits: Search (10/min, 30/hour), Radio (3/min, 10/hour)
  const minuteLimit = config.type === "search" ? 10 : 3;
  const hourlyLimit = config.type === "search" ? 30 : 10;

  const redis = getRedisClient();

  if (redis) {
    try {
      const minRatelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(minuteLimit, "1 m"),
        prefix: `${namespace}:min`,
      });

      // Sequential evaluation (Option A): evaluate minute window first
      const minRes = await minRatelimit.limit(hashedIp);
      if (!minRes.success) {
        const retryAfter = Math.max(1, Math.ceil(Math.max(0, minRes.reset - nowMs) / 1000));
        return {
          success: false,
          limit: minuteLimit,
          remaining: 0,
          reset: retryAfter,
          retryAfter,
          environment: env,
        };
      }

      // If minute window passes, evaluate 1-hour window
      const hourRatelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(hourlyLimit, "1 h"),
        prefix: `${namespace}:hour`,
      });

      const hourRes = await hourRatelimit.limit(hashedIp);
      if (!hourRes.success) {
        const retryAfter = Math.max(1, Math.ceil(Math.max(0, hourRes.reset - nowMs) / 1000));
        return {
          success: false,
          limit: hourlyLimit,
          remaining: 0,
          reset: retryAfter,
          retryAfter,
          environment: env,
        };
      }

      const remaining = Math.min(minRes.remaining, hourRes.remaining);
      const minResetSec = Math.ceil(Math.max(0, minRes.reset - nowMs) / 1000);
      const hourResetSec = Math.ceil(Math.max(0, hourRes.reset - nowMs) / 1000);
      const reset = Math.max(1, minRes.remaining <= hourRes.remaining ? minResetSec : hourResetSec);

      return {
        success: true,
        limit: minRes.remaining <= hourRes.remaining ? minuteLimit : hourlyLimit,
        remaining: Math.max(0, remaining),
        reset,
        retryAfter: 0,
        environment: env,
      };
    } catch (err) {
      console.error("[Redis RateLimit Error]", err);
    }
  }

  // Production Controlled Fail-Open when Redis is unconfigured or failing
  if (env === "production" && !redis) {
    console.error("[CRITICAL] Upstash Redis environment variables missing in Production! Failing open.");
    return {
      success: true,
      limit: minuteLimit,
      remaining: minuteLimit,
      reset: 60,
      retryAfter: 0,
      environment: env,
    };
  }

  // Memory fallback for local dev & preview
  cleanMemoryStore(nowMs);
  const minKey = `${namespace}:min:${hashedIp}`;
  const hourKey = `${namespace}:hour:${hashedIp}`;

  const checkWindow = (key: string, limit: number, windowMs: number) => {
    const record = memoryStore.get(key);
    if (!record || record.expiresAt <= nowMs) {
      return { count: 0, expiresAt: nowMs + windowMs, remaining: limit, success: true };
    }
    const remaining = Math.max(0, limit - record.count);
    return { count: record.count, expiresAt: record.expiresAt, remaining, success: record.count < limit };
  };

  const minState = checkWindow(minKey, minuteLimit, 60000);
  if (!minState.success) {
    const retryAfter = Math.max(1, Math.ceil((minState.expiresAt - nowMs) / 1000));
    return {
      success: false,
      limit: minuteLimit,
      remaining: 0,
      reset: retryAfter,
      retryAfter,
      environment: env,
    };
  }

  const hourState = checkWindow(hourKey, hourlyLimit, 3600000);
  if (!hourState.success) {
    const retryAfter = Math.max(1, Math.ceil((hourState.expiresAt - nowMs) / 1000));
    return {
      success: false,
      limit: hourlyLimit,
      remaining: 0,
      reset: retryAfter,
      retryAfter,
      environment: env,
    };
  }

  memoryStore.set(minKey, { count: minState.count + 1, expiresAt: minState.expiresAt });
  memoryStore.set(hourKey, { count: hourState.count + 1, expiresAt: hourState.expiresAt });

  const minRem = Math.max(0, minState.remaining - 1);
  const hourRem = Math.max(0, hourState.remaining - 1);
  const remaining = Math.min(minRem, hourRem);

  const reset = Math.max(1, minRem <= hourRem
    ? Math.ceil((minState.expiresAt - nowMs) / 1000)
    : Math.ceil((hourState.expiresAt - nowMs) / 1000));

  return {
    success: true,
    limit: minRem <= hourRem ? minuteLimit : hourlyLimit,
    remaining,
    reset,
    retryAfter: 0,
    environment: env,
  };
}

export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "Cache-Control": "private, no-store",
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(result.reset),
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };

  if (!result.success) {
    headers["Retry-After"] = String(result.retryAfter);
  }

  return headers;
}
