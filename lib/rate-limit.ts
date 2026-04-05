/**
 * Simple in-memory rate limiter for server actions and API routes.
 * Uses a sliding window approach.
 */

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60_000); // Clean every minute

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
    auth: { maxRequests: 10, windowMs: 60_000 },       // 10 req/min for auth
    api: { maxRequests: 60, windowMs: 60_000 },         // 60 req/min for general API
    heavy: { maxRequests: 5, windowMs: 60_000 },        // 5 req/min for heavy operations
};

export function checkRateLimit(
    identifier: string,
    type: keyof typeof RATE_LIMITS = 'api'
): { success: boolean; remaining: number; resetInMs: number } {
    const config = RATE_LIMITS[type];
    const now = Date.now();
    const key = `${type}:${identifier}`;

    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        // New window
        rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
        return { success: true, remaining: config.maxRequests - 1, resetInMs: config.windowMs };
    }

    if (entry.count >= config.maxRequests) {
        return { success: false, remaining: 0, resetInMs: entry.resetTime - now };
    }

    entry.count++;
    return { success: true, remaining: config.maxRequests - entry.count, resetInMs: entry.resetTime - now };
}
