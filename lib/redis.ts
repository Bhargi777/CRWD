import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "@/lib/env";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error("Missing Upstash Redis env vars");
    }
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export function createRateLimiter(requests: number, window: `${number} ${"s" | "m" | "h"}`) {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(requests, window),
  });
}

/** Checkout: 5 attempts per minute per identifier (user id or IP). */
export const checkoutRateLimit = () => createRateLimiter(5, "1 m");

/** Search: 30 requests per minute per identifier. */
export const searchRateLimit = () => createRateLimiter(30, "1 m");
