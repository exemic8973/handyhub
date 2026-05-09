// Simple in-memory rate limiter.
// NOTE: state is per-process only — for multi-instance deployments replace
// the Map with a Redis-backed store (e.g. @upstash/ratelimit).

interface Entry {
  count: number
  reset: number
}

const store = new Map<string, Entry>()

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return { allowed: true, retryAfterMs: 0 }
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.reset - now }
  }

  entry.count++
  return { allowed: true, retryAfterMs: 0 }
}
