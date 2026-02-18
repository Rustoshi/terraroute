import { z } from "zod";
import { ServiceType, ShipmentStatus, ShipmentType, ShipmentMode, ConsignmentType, Currency, PaymentMethod, PaymentStatus } from "@/types";

/**
 * Zod validation schemas for API input validation.
 * Provides runtime type checking and data sanitization.
 */

// ============================================================================
// Common Schemas
// ============================================================================

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const dimensionsSchema = z.object({
  length: z.number().positive("Length must be positive"),
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
});

export const packageDetailsSchema = z.object({
  weight: z.number().positive("Weight must be positive"),
  dimensions: dimensionsSchema,
  value: z.number().min(0, "Value must be non-negative").optional(),
  currency: z.nativeEnum(Currency).optional(),
  description: z.string().max(500).optional(),
});

export const contactInfoSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(5).max(20),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5).max(500),
  coordinates: coordinatesSchema.optional(),
});

// Location info schema for origin/destination (city, state, country)
export const locationInfoSchema = z.object({
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  coordinates: coordinatesSchema.optional(),
});

// ============================================================================
// Shipment Schemas
// ============================================================================

const packageImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
});

export const createShipmentSchema = z.object({
  // Classification
  consignmentType: z.nativeEnum(ConsignmentType).optional(),
  shipmentType: z.nativeEnum(ShipmentType).optional(),
  shipmentMode: z.nativeEnum(ShipmentMode).optional(),
  serviceType: z.nativeEnum(ServiceType).optional(),
  // Parties
  sender: contactInfoSchema,
  receiver: contactInfoSchema,
  // Package
  package: packageDetailsSchema,
  // Route
  origin: z.string().min(2).max(200),
  destination: z.string().min(2).max(200),
  originLocation: locationInfoSchema.optional(),
  destinationLocation: locationInfoSchema.optional(),
  estimatedDeliveryDate: z.string().optional(),
  packageImages: z.array(packageImageSchema).max(5).optional(),
  sendNotification: z.boolean().optional(),
  // Optional freight & carrier at creation
  freightCharges: z.object({
    baseCharge: z.number().min(0),
    fuelSurcharge: z.number().min(0).optional(),
    handlingFee: z.number().min(0).optional(),
    insuranceFee: z.number().min(0).optional(),
    customsDuty: z.number().min(0).optional(),
    tax: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    total: z.number().min(0),
    currency: z.nativeEnum(Currency),
    isPaid: z.boolean(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus),
    paymentReference: z.string().optional(),
  }).optional(),
  carrier: z.string().optional(),
  carrierTrackingCode: z.string().optional(),
});

export const freightChargesSchema = z.object({
  baseCharge: z.number().min(0),
  fuelSurcharge: z.number().min(0).optional(),
  handlingFee: z.number().min(0).optional(),
  insuranceFee: z.number().min(0).optional(),
  customsDuty: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  total: z.number().min(0),
  currency: z.nativeEnum(Currency),
  isPaid: z.boolean(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus),
  paidAt: z.string().optional(),
  paymentReference: z.string().optional(),
});

export const updateShipmentSchema = z.object({
  // Classification
  consignmentType: z.nativeEnum(ConsignmentType).optional(),
  shipmentType: z.nativeEnum(ShipmentType).optional(),
  shipmentMode: z.nativeEnum(ShipmentMode).optional(),
  serviceType: z.nativeEnum(ServiceType).optional(),
  // Parties
  sender: contactInfoSchema.optional(),
  receiver: contactInfoSchema.optional(),
  // Package
  package: packageDetailsSchema.optional(),
  // Route
  origin: z.string().min(2).max(200).optional(),
  destination: z.string().min(2).max(200).optional(),
  originLocation: locationInfoSchema.optional(),
  destinationLocation: locationInfoSchema.optional(),
  estimatedDeliveryDate: z.string().optional(),
  currentLocation: z.string().max(200).optional(),
  packageImages: z.array(packageImageSchema).max(5).optional(),
  freightCharges: freightChargesSchema.optional(),
  carrier: z.string().optional(),
  carrierTrackingCode: z.string().optional(),
});

export const updateShipmentStatusSchema = z.object({
  status: z.nativeEnum(ShipmentStatus),
  location: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
});

// ============================================================================
// Quote Schemas
// ============================================================================

export const createQuoteSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5).max(20),
  origin: z.string().min(2).max(200),
  destination: z.string().min(2).max(200),
  packageDetails: packageDetailsSchema,
  serviceType: z.nativeEnum(ServiceType),
});

export const respondQuoteSchema = z.object({
  estimatedPrice: z.number().positive("Price must be positive"),
  adminResponse: z.string().min(1).max(1000),
});

// ============================================================================
// Email Schemas
// ============================================================================

export const sendEmailSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1).max(200),
  htmlContent: z.string().min(1),
  relatedShipmentId: z.string().optional(),
});

// ============================================================================
// Upload Schemas
// ============================================================================

export const uploadRequestSchema = z.object({
  shipmentId: z.string().optional(),
  filename: z.string().optional(),
});

// ============================================================================
// Query Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const trackingQuerySchema = z.object({
  code: z
    .string()
    .min(1, "Tracking code is required")
    .transform((val) => val.toUpperCase().trim()),
});

export const mapboxQuerySchema = z.object({
  q: z.string().min(2, "Query must be at least 2 characters").max(200),
});

// ============================================================================
// Validation Helper
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Coordinate Normalization Helper
// ============================================================================

interface RawCoordinates {
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
}

interface NormalizedCoordinates {
  lat: number;
  lng: number;
}

/**
 * Normalize coordinates to always use lat/lng format.
 * Handles both lat/lng and latitude/longitude input formats.
 */
export function normalizeCoordinates(coords: RawCoordinates | undefined | null): NormalizedCoordinates | undefined {
  if (!coords) return undefined;
  
  const lat = coords.lat ?? coords.latitude;
  const lng = coords.lng ?? coords.longitude;
  
  if (lat === undefined || lng === undefined) return undefined;
  
  return { lat, lng };
}

interface RawLocationInfo {
  city: string;
  state: string;
  country: string;
  coordinates?: RawCoordinates;
}

interface NormalizedLocationInfo {
  city: string;
  state: string;
  country: string;
  coordinates?: NormalizedCoordinates;
}

/**
 * Normalize location info, ensuring coordinates use lat/lng format.
 */
export function normalizeLocationInfo(location: RawLocationInfo | undefined | null): NormalizedLocationInfo | undefined {
  if (!location) return undefined;
  
  return {
    city: location.city,
    state: location.state,
    country: location.country,
    coordinates: normalizeCoordinates(location.coordinates),
  };
}

interface RawContactInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  coordinates?: RawCoordinates;
}

interface NormalizedContactInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  coordinates?: NormalizedCoordinates;
}

/**
 * Normalize contact info, ensuring coordinates use lat/lng format.
 */
export function normalizeContactInfo(contact: RawContactInfo | undefined | null): NormalizedContactInfo | undefined {
  if (!contact) return undefined;
  
  return {
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    address: contact.address,
    coordinates: normalizeCoordinates(contact.coordinates),
  };
}

/**
 * Validate data against a Zod schema with error formatting.
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format Zod errors into a readable string
  const errors = result.error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });

  return {
    success: false,
    error: errors.join("; "),
  };
}
