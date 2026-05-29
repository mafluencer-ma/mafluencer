import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://:mafluencer_redis@redis:6379";

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on("error", (err) => {
  // Log but never crash the process on Redis connection errors
  console.error("[Redis] connection error:", err.message);
});

// ── Sliding-window rate limiter (same API as @upstash/ratelimit) ──────────────
// Uses sorted sets: members are timestamped, window is trimmed on each call.
class SlidingWindowRateLimiter {
  constructor(
    private readonly client: Redis,
    private readonly maxRequests: number,
    private readonly windowMs: number,
    private readonly prefix: string
  ) {}

  async limit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const key   = `${this.prefix}:${identifier}`;
    const now   = Date.now();
    const floor = now - this.windowMs;

    const pipeline = this.client.pipeline();
    pipeline.zremrangebyscore(key, 0, floor);             // drop expired entries
    pipeline.zadd(key, now, `${now}-${Math.random()}`);  // add current request
    pipeline.zcard(key);                                  // count in window
    pipeline.pexpire(key, this.windowMs);                 // auto-expire the key

    const results = await pipeline.exec();
    const count   = (results?.[2]?.[1] as number) ?? 0;

    return {
      success:   count <= this.maxRequests,
      limit:     this.maxRequests,
      remaining: Math.max(0, this.maxRequests - count),
      reset:     now + this.windowMs,
    };
  }
}

// 10 req / 10 s — general API routes
export const ratelimit = new SlidingWindowRateLimiter(redis, 10, 10_000, "@mafluencer/ratelimit");

// 5 req / 60 s — auth routes
export const authRatelimit = new SlidingWindowRateLimiter(redis, 5, 60_000, "@mafluencer/auth-ratelimit");
