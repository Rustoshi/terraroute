import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";

/**
 * In-memory rate limiting middleware.
 *
 * For production with multiple instances, use Redis or a distributed store.
 * This implementation is suitable for single-instance deployments.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries(): void {
  const now = Date.now();

  // Only clean up once per interval
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }

  lastCleanup = now;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

interface RateLimitConfig {
  maxRequests: number; // Maximum requests per window
  windowMs: number; // Time window in milliseconds
}

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Public tracking endpoint - more generous
  tracking: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests per minute
  },
  // Public quote endpoint - moderate
  quotes: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 requests per minute
  },
  // Mapbox proxy endpoints
  mapbox: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 60 requests per minute
  },
  // Admin API endpoints - authenticated, more generous
  admin: {
    maxRequests: 200,
    windowMs: 60 * 1000, // 200 requests per minute
  },
  // Default for other endpoints
  default: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },
} as const;

/**
 * Get client identifier from request.
 * Uses IP address with optional forwarded header support.
 */
function getClientIdentifier(request: NextRequest): string {
  // Check for forwarded IP (behind proxy/load balancer)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP in the chain
    return forwarded.split(",")[0].trim();
  }

  // Fall back to direct IP
  const ip = request.headers.get("x-real-ip");
  if (ip) {
    return ip;
  }

  // Last resort - use a placeholder (not ideal for rate limiting)
  return "unknown";
}

/**
 * Check rate limit for a request.
 * Returns true if request should be allowed, false if rate limited.
 */
export function checkRateLimit(
  request: NextRequest,
  endpoint: keyof typeof RATE_LIMIT_CONFIGS = "default"
): { allowed: boolean; remaining: number; resetTime: number } {
  cleanupExpiredEntries();

  const config = RATE_LIMIT_CONFIGS[endpoint];
  const clientId = getClientIdentifier(request);
  const key = `${endpoint}:${clientId}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // Create new entry if none exists or window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count <= config.maxRequests;

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware wrapper for route handlers.
 */
export function withRateLimit(
  handler: (request: NextRequest, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse>,
  endpoint: keyof typeof RATE_LIMIT_CONFIGS = "default"
) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const { allowed, remaining, resetTime } = checkRateLimit(request, endpoint);

    if (!allowed) {
      const response: ApiResponse = {
        success: false,
        error: "Too many requests. Please try again later.",
      };

      return NextResponse.json(response, {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(resetTime / 1000)),
          "Retry-After": String(Math.ceil((resetTime - Date.now()) / 1000)),
        },
      });
    }

    // Call the actual handler
    const response = await handler(request, context);

    // Add rate limit headers to response
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetTime / 1000)));

    return response;
  };
}

/**
 * Create a rate limited response.
 */
export function rateLimitedResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: "Too many requests. Please try again later." },
    { status: 429 }
  );
}
