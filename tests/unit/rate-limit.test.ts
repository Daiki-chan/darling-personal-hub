import { describe, expect, it } from "vitest";
import { checkRateLimit, extractClientIp, hashIpAddress } from "@/lib/server/rate-limit";

describe("rate-limit utilities", () => {
  it("extracts client IP from request headers", () => {
    const req1 = new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
    });
    expect(extractClientIp(req1)).toBe("203.0.113.195");

    const req2 = new Request("http://localhost/api/test", {
      headers: { "x-real-ip": "198.51.100.1" },
    });
    expect(extractClientIp(req2)).toBe("198.51.100.1");
  });

  it("hashes IP address deterministically with salt", () => {
    const hash1 = hashIpAddress("203.0.113.195");
    const hash2 = hashIpAddress("203.0.113.195");
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe("203.0.113.195");
    expect(hash1.length).toBe(32);
  });

  it("enforces sliding window limits in memory fallback mode", async () => {
    const mockTime = 100000;
    const req = new Request("http://localhost/api/youtube/search?q=test");
    const config = {
      type: "search" as const,
      now: () => mockTime,
      ipResolver: () => "192.0.2.1",
    };

    // First 10 requests should succeed for search (minute limit = 10)
    for (let i = 0; i < 10; i++) {
      const res = await checkRateLimit(req, config);
      expect(res.success).toBe(true);
    }

    // 11th request should be rate limited (429)
    const blockedRes = await checkRateLimit(req, config);
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.retryAfter).toBeGreaterThan(0);
  });
});
