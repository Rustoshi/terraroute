import { Types } from "mongoose";

// ============================================================================
// Enums
// ============================================================================

export enum UserRole {
  ADMIN = "ADMIN",
}

// Shipment Type - Scope/Nature of shipment
export enum ShipmentType {
  DOMESTIC = "DOMESTIC",
  INTERNATIONAL = "INTERNATIONAL",
  LOCAL = "LOCAL",
  IMPORT = "IMPORT",
  EXPORT = "EXPORT",
}

// Shipment Mode - Transport method
export enum ShipmentMode {
  AIR = "AIR",
  SEA = "SEA",
  ROAD = "ROAD",
  RAIL = "RAIL",
  COURIER = "COURIER",
  MULTIMODAL = "MULTIMODAL",
}

// Service Type - Speed/Priority level
export enum ServiceType {
  ECONOMY = "ECONOMY",
  STANDARD = "STANDARD",
  EXPRESS = "EXPRESS",
  PRIORITY = "PRIORITY",
  SAME_DAY = "SAME_DAY",
  NEXT_DAY = "NEXT_DAY",
  OVERNIGHT = "OVERNIGHT",
}

// Whether this is a regular shipment or consignment
export enum ConsignmentType {
  SHIPMENT = "SHIPMENT",
  CONSIGNMENT = "CONSIGNMENT",
}

export enum ShipmentStatus {
  // Normal flow
  CREATED = "CREATED",
  PICKUP_SCHEDULED = "PICKUP_SCHEDULED",
  PICKED_UP = "PICKED_UP",
  RECEIVED_AT_ORIGIN_HUB = "RECEIVED_AT_ORIGIN_HUB",
  STORED = "STORED", // Consignment only
  READY_FOR_DISPATCH = "READY_FOR_DISPATCH",
  IN_TRANSIT = "IN_TRANSIT",
  ARRIVED_AT_DESTINATION_HUB = "ARRIVED_AT_DESTINATION_HUB",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  // Exception statuses
  ON_HOLD = "ON_HOLD",
  DELIVERY_FAILED = "DELIVERY_FAILED",
  RETURNED_TO_SENDER = "RETURNED_TO_SENDER",
  CANCELLED = "CANCELLED",
  DAMAGED = "DAMAGED",
  SEIZED = "SEIZED",
}

export enum QuoteStatus {
  PENDING = "PENDING",
  RESPONDED = "RESPONDED",
  CONVERTED = "CONVERTED",
}

export enum EmailStatus {
  SENT = "SENT",
  FAILED = "FAILED",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PAYPAL = "PAYPAL",
  STRIPE = "STRIPE",
  CRYPTO = "CRYPTO",
  INVOICE = "INVOICE",
  COD = "COD", // Cash on Delivery
  POD = "POD", // Payment on Delivery
  PREPAID = "PREPAID",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  PARTIAL = "PARTIAL",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

export enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  CAD = "CAD",
  AUD = "AUD",
  JPY = "JPY",
  CNY = "CNY",
  INR = "INR",
  NGN = "NGN",
  ZAR = "ZAR",
  AED = "AED",
  SGD = "SGD",
  CHF = "CHF",
  BRL = "BRL",
  MXN = "MXN",
}

// Package images - up to 5 images per shipment
export interface PackageImage {
  url: string;
  publicId: string;
  uploadedAt: Date;
}

// ============================================================================
// Embedded Types
// ============================================================================

export interface Coordinates {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  coordinates?: Coordinates;
}

// Location info for origin/destination (city, state, country format)
export interface LocationInfo {
  city: string;
  state: string;
  country: string;
  coordinates?: Coordinates;
}

export interface PackageDetails {
  weight: number; // in kg
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value?: number; // declared value in currency
  currency?: Currency; // currency for declared value
  description?: string;
}

export interface FreightCharges {
  baseCharge: number;
  fuelSurcharge?: number;
  handlingFee?: number;
  insuranceFee?: number;
  customsDuty?: number;
  tax?: number;
  discount?: number;
  total: number;
  currency: Currency;
  isPaid: boolean;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt?: Date;
  paymentReference?: string;
}

// ============================================================================
// Document Interfaces
// ============================================================================

export interface ICarrier {
  _id: Types.ObjectId;
  name: string;
  code: string; // Unique carrier code e.g., "DHL", "FEDEX"
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  trackingUrlTemplate?: string; // e.g., "https://track.carrier.com/{trackingCode}"
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShipment {
  _id: Types.ObjectId;
  trackingCode: string;
  // Classification
  consignmentType: ConsignmentType; // Shipment or Consignment
  shipmentType: ShipmentType; // Domestic, International, etc.
  shipmentMode: ShipmentMode; // Air, Sea, Road, etc.
  serviceType: ServiceType; // Economy, Standard, Express, etc.
  // Parties
  sender: ContactInfo;
  receiver: ContactInfo;
  // Package
  package: PackageDetails;
  // Route
  origin: string; // Display string: "City, State, Country"
  destination: string; // Display string: "City, State, Country"
  originLocation?: LocationInfo; // Structured origin location
  destinationLocation?: LocationInfo; // Structured destination location
  // Status
  status: ShipmentStatus;
  currentLocation?: string;
  estimatedDeliveryDate?: Date;
  trackingEvents: Types.ObjectId[];
  packageImages: PackageImage[];
  // Freight & Payment
  freightCharges?: FreightCharges;
  carrier?: Types.ObjectId;
  carrierTrackingCode?: string; // External carrier's tracking code
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITrackingEvent {
  _id: Types.ObjectId;
  shipmentId: Types.ObjectId;
  status: ShipmentStatus;
  location: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuote {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  packageDetails: PackageDetails;
  serviceType: ServiceType;
  estimatedPrice?: number;
  status: QuoteStatus;
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailLog {
  _id: Types.ObjectId;
  to: string;
  subject: string;
  htmlContent: string;
  relatedShipmentId?: Types.ObjectId;
  sentBy: Types.ObjectId;
  status: EmailStatus;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateShipmentInput {
  // Classification
  consignmentType?: ConsignmentType;
  shipmentType?: ShipmentType;
  shipmentMode?: ShipmentMode;
  serviceType: ServiceType;
  // Parties
  sender: ContactInfo;
  receiver: ContactInfo;
  // Package
  package: PackageDetails;
  // Route
  origin: string;
  destination: string;
  originLocation?: LocationInfo;
  destinationLocation?: LocationInfo;
  estimatedDeliveryDate?: string;
}

export interface UpdateShipmentInput {
  // Classification
  consignmentType?: ConsignmentType;
  shipmentType?: ShipmentType;
  shipmentMode?: ShipmentMode;
  serviceType?: ServiceType;
  // Parties
  sender?: ContactInfo;
  receiver?: ContactInfo;
  // Package
  package?: PackageDetails;
  // Route
  origin?: string;
  destination?: string;
  originLocation?: LocationInfo;
  destinationLocation?: LocationInfo;
  estimatedDeliveryDate?: string;
  currentLocation?: string;
}

export interface UpdateShipmentStatusInput {
  status: ShipmentStatus;
  location: string;
  description?: string;
}

export interface CreateQuoteInput {
  name: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  packageDetails: PackageDetails;
  serviceType: ServiceType;
}

export interface RespondQuoteInput {
  estimatedPrice: number;
  adminResponse: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  htmlContent: string;
  relatedShipmentId?: string;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  original_filename: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// Mapbox Types
// ============================================================================

export interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  text: string;
  context?: Array<{
    id: string;
    text: string;
  }>;
}

export interface MapboxAutocompleteResponse {
  features: MapboxFeature[];
}

// ============================================================================
// Auth Types
// ============================================================================

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
