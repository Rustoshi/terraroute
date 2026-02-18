/**
 * Zod validation schemas for frontend forms.
 * 
 * NOTE: Backend validation schemas are in /utils/validation.ts
 * This file contains frontend-specific schemas with form-friendly error messages.
 * For shared schemas, import from /utils/validation.ts
 */

import { z } from "zod";
import { ShipmentStatus, ServiceType, ShipmentType, ShipmentMode, ConsignmentType } from "@/types";

// Re-export backend schemas that can be used on frontend
export {
  freightChargesSchema,
  updateShipmentSchema as backendUpdateShipmentSchema,
} from "@/utils/validation";

// ============================================================================
// Auth Schemas
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// Contact Info Schema
// ============================================================================

export const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const contactInfoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().min(5, "Address is required"),
  coordinates: coordinatesSchema.optional(),
});

export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;

// Location info schema for origin/destination (city, state, country)
export const locationInfoSchema = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  coordinates: coordinatesSchema.optional(),
});

export type LocationInfoFormData = z.infer<typeof locationInfoSchema>;

// ============================================================================
// Package Schema
// ============================================================================

export const packageDetailsSchema = z.object({
  weight: z.number().positive("Weight must be positive"),
  dimensions: z.object({
    length: z.number().positive("Length must be positive"),
    width: z.number().positive("Width must be positive"),
    height: z.number().positive("Height must be positive"),
  }),
  value: z.number().optional(),
  description: z.string().optional(),
});

export type PackageDetailsFormData = z.infer<typeof packageDetailsSchema>;

// ============================================================================
// Shipment Schemas
// ============================================================================

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
  originLocation: locationInfoSchema.optional(),
  destinationLocation: locationInfoSchema.optional(),
  estimatedDeliveryDate: z.string().optional(),
});

export type CreateShipmentFormData = z.infer<typeof createShipmentSchema>;

export const updateStatusSchema = z.object({
  status: z.nativeEnum(ShipmentStatus),
  location: z.string().optional(),
  description: z.string().optional(),
  sendNotification: z.boolean().optional(),
});

export type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

// ============================================================================
// Quote Schemas
// ============================================================================

export const respondToQuoteSchema = z.object({
  adminResponse: z.string().min(10, "Response must be at least 10 characters"),
  estimatedPrice: z.number().positive().optional(),
  sendEmail: z.boolean().optional(),
});

export type RespondToQuoteFormData = z.infer<typeof respondToQuoteSchema>;

// ============================================================================
// Email Schemas
// ============================================================================

export const sendEmailSchema = z.object({
  to: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  html: z.string().min(10, "Email content is required"),
  relatedShipmentId: z.string().optional(),
});

export type SendEmailFormData = z.infer<typeof sendEmailSchema>;

// ============================================================================
// Package Image Schema
// ============================================================================

export const packageImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  uploadedAt: z.string().optional(),
});

export type PackageImageFormData = z.infer<typeof packageImageSchema>;
