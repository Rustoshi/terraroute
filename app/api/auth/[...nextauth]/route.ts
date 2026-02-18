import { handlers } from "@/lib/auth";

/**
 * NextAuth.js route handlers.
 * Handles all authentication routes (/api/auth/*)
 */
export const { GET, POST } = handlers;
