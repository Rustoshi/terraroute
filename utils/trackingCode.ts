import { v4 as uuidv4 } from "uuid";

/**
 * Tracking code generator utility.
 * Generates human-readable, unique tracking codes for shipments.
 *
 * Format: CRR-XXXXXXXX-XX
 * - CRR: Platform prefix (Courier)
 * - XXXXXXXX: 8 alphanumeric characters from UUID
 * - XX: Random 2-character suffix for additional uniqueness
 *
 * Example: CRR-A1B2C3D4-KZ
 */

const PREFIX = "CRR";
const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Generate a random alphanumeric string of specified length.
 */
function randomChars(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC.charAt(Math.floor(Math.random() * ALPHANUMERIC.length));
  }
  return result;
}

/**
 * Generate a unique, human-readable tracking code.
 * Uses UUID for uniqueness with added readability formatting.
 */
export function generateTrackingCode(): string {
  // Get first 8 characters from UUID (without hyphens), uppercase
  const uuidPart = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();

  // Add random 2-character suffix
  const suffix = randomChars(2);

  return `${PREFIX}-${uuidPart}-${suffix}`;
}

/**
 * Validate tracking code format.
 * Returns true if the code matches expected format.
 */
export function isValidTrackingCode(code: string): boolean {
  const pattern = /^CRR-[A-Z0-9]{8}-[A-Z0-9]{2}$/;
  return pattern.test(code.toUpperCase());
}

/**
 * Normalize tracking code (uppercase, trim whitespace).
 */
export function normalizeTrackingCode(code: string): string {
  return code.toUpperCase().trim();
}
