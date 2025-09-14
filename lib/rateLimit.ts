// Simple in-memory rate limiter
// In production, use Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options;

  return (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
    const now = Date.now();
    const key = identifier;
    
    // Get existing entry or create new one
    let entry = rateLimitMap.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitMap.set(key, entry);
    }
    
    // Increment count
    entry.count++;
    
    // Check if limit exceeded
    const allowed = entry.count <= maxRequests;
    const remaining = Math.max(0, maxRequests - entry.count);
    
    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
    };
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Rate limit configurations
export const rateLimitConfigs = {
  // General API rate limit: 100 requests per 15 minutes
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  }),
  
  // Create/Update rate limit: 10 requests per minute
  createUpdate: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  }),
  
  // Import rate limit: 5 requests per hour
  import: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
  }),
};
