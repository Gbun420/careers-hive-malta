type RateLimitOptions = {
  windowMs: number;
  max: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

type MemoryBucket = {
  count: number;
  resetAt: number;
};

const memoryBuckets = new Map<string, MemoryBucket>();

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }
  return null;
}

export function buildRateLimitKey(
  request: Request,
  route: string,
  identifier?: string | null
): string {
  if (identifier) {
    return `user:${identifier}:${route}`;
  }
  const ip = getClientIp(request) ?? "unknown";
  return `ip:${ip}:${route}`;
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  return { url: url.replace(/\/$/, ""), token };
}

async function upstashCommand<T>(
  config: { url: string; token: string },
  command: string,
  ...args: Array<string | number>
): Promise<T> {
  const encodedArgs = args.map((arg) => encodeURIComponent(String(arg)));
  const endpoint = `${config.url}/${command}/${encodedArgs.join("/")}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Upstash command failed.");
  }

  const payload = (await response.json()) as { result: T };
  return payload.result;
}

export async function rateLimit(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const now = Date.now();
  const config = getUpstashConfig();
  const windowStart = Math.floor(now / options.windowMs) * options.windowMs;

  if (config) {
    const redisKey = `rl:${key}:${windowStart}`;
    try {
      const count = await upstashCommand<number>(config, "incr", redisKey);
      if (count === 1) {
        await upstashCommand(config, "pexpire", redisKey, options.windowMs);
      }
      const remaining = Math.max(options.max - count, 0);
      return {
        ok: count <= options.max,
        remaining,
        resetAt: windowStart + options.windowMs,
      };
    } catch (error) {
      // Fall back to in-memory if Redis fails.
    }
  }

  const existing = memoryBuckets.get(key);
  if (!existing || now > existing.resetAt) {
    const resetAt = now + options.windowMs;
    memoryBuckets.set(key, { count: 1, resetAt });
    return {
      ok: true,
      remaining: options.max - 1,
      resetAt,
    };
  }

  existing.count += 1;
  memoryBuckets.set(key, existing);

  return {
    ok: existing.count <= options.max,
    remaining: Math.max(options.max - existing.count, 0),
    resetAt: existing.resetAt,
  };
}
