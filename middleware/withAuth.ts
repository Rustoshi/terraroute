import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { checkRateLimit } from "./rateLimit";

/**
 * Authentication middleware for admin-protected API routes.
 * Validates session and attaches user info to request.
 */

export type AuthenticatedHandler = (
  request: NextRequest,
  context: {
    params: Promise<Record<string, string>>;
    user: { id: string; email: string; name: string };
  }
) => Promise<NextResponse>;

/**
 * Higher-order function to wrap route handlers with authentication.
 * Returns 401 Unauthorized if no valid session exists.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      // Check rate limit for admin endpoints
      const { allowed, remaining, resetTime } = checkRateLimit(request, "admin");
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

      const session = await auth();

      if (!session || !session.user) {
        const response: ApiResponse = {
          success: false,
          error: "Unauthorized - Please log in",
        };
        return NextResponse.json(response, { status: 401 });
      }

      // Attach user to context and call the handler
      const res = await handler(request, {
        params: context.params,
        user: {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.name!,
        },
      });

      // Add rate limit headers
      res.headers.set("X-RateLimit-Remaining", String(remaining));
      res.headers.set("X-RateLimit-Reset", String(Math.ceil(resetTime / 1000)));

      return res;
    } catch (error) {
      console.error("Auth middleware error:", error);
      const response: ApiResponse = {
        success: false,
        error: "Authentication error",
      };
      return NextResponse.json(response, { status: 500 });
    }
  };
}

/**
 * Simple auth check helper for use within route handlers.
 * Returns the user if authenticated, null otherwise.
 */
export async function getAuthUser(): Promise<{
  id: string;
  email: string;
  name: string;
} | null> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name!,
    };
  } catch {
    return null;
  }
}

/**
 * Create an unauthorized response.
 */
export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}
