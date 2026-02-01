import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if environment variables are set
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

// Create Redis client (only if credentials are provided)
const redis = redisUrl && redisToken
  ? new Redis({
      url: redisUrl,
      token: redisToken
    })
  : null

// Rate limiter: 100 requests per 15 minutes (general API)
export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '15 m'),
      analytics: true,
      prefix: '@upstash/ratelimit'
    })
  : null

// Strict rate limiter for auth endpoints: 5 requests per hour
export const authRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: '@upstash/ratelimit/auth'
    })
  : null

// Moderate rate limiter for creating resources: 20 requests per hour
export const createRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: true,
      prefix: '@upstash/ratelimit/create'
    })
  : null

// Very strict for sensitive actions: 3 requests per hour
export const sensitiveRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: '@upstash/ratelimit/sensitive'
    })
  : null

// Helper to check if rate limiting is enabled
export const isRateLimitEnabled = () => {
  return redis !== null
}

// Export Redis client for custom use
export { redis }
