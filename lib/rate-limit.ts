interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitOptions {
  interval: number // Time window in milliseconds
  maxRequests: number // Max requests per interval
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { interval: 60000, maxRequests: 10 },
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries
  if (store[key] && store[key].resetTime < now) {
    delete store[key]
  }

  if (!store[key]) {
    store[key] = {
      count: 1,
      resetTime: now + options.interval,
    }
    return {
      success: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      reset: store[key].resetTime,
    }
  }

  if (store[key].count >= options.maxRequests) {
    return {
      success: false,
      limit: options.maxRequests,
      remaining: 0,
      reset: store[key].resetTime,
    }
  }

  store[key].count++

  return {
    success: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - store[key].count,
    reset: store[key].resetTime,
  }
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 60000) // Clean up every minute
