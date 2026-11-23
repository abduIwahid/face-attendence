/**
 * Rate limiting — v1: in-memory fixed-window counters (brain/DECISIONS.md
 * ADR-007). The limits themselves are the API_SPEC.md contract; only the
 * storage is simple. Serverless instances do not share this memory, so the
 * effective limit is per-instance — accepted for classroom scale in v1;
 * the upgrade path is a Supabase counter table.
 */

interface Bucket {
  count: number;
  windowStartMs: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  nowMs: number = Date.now(),
): RateLimitResult {
  const bucket = buckets.get(key);
  if (!bucket || nowMs - bucket.windowStartMs >= windowMs) {
    buckets.set(key, { count: 1, windowStartMs: nowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(
        (bucket.windowStartMs + windowMs - nowMs) / 1000,
      ),
    };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** API_SPEC.md limits, named once. */
export const RATE_LIMITS = {
  verifyPerRoll: { limit: 10, windowMs: 10 * 60 * 1000 },
  registerPerIp: { limit: 5, windowMs: 60 * 60 * 1000 },
} as const;
