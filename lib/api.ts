/**
 * Typed API Client for Admin Frontend
 * All API calls go through this module
 */

import type {
  ShipmentStatus,
  ServiceType,
  ShipmentType,
  ShipmentMode,
  ConsignmentType,
  QuoteStatus,
  Currency,
  PaymentMethod,
  PaymentStatus,
} from "@/types";

// ============================================================================
// Types
// ============================================================================

export interface Coordinates {
  lat: number;
  lng: number;
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
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value?: number;
  currency?: Currency;
  description?: string;
}

export interface PackageImage {
  url: string;
  publicId: string;
  uploadedAt: string;
}

export interface TrackingEvent {
  _id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location: string;
  coordinates?: Coordinates;
  description: string;
  createdAt: string;
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
  paidAt?: string;
  paymentReference?: string;
}

export interface Carrier {
  _id: string;
  name: string;
  code: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  trackingUrlTemplate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  _id: string;
  trackingCode: string;
  // Classification
  consignmentType: ConsignmentType;
  shipmentType: ShipmentType;
  shipmentMode: ShipmentMode;
  serviceType: ServiceType;
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
  estimatedDeliveryDate?: string;
  trackingEvents: TrackingEvent[];
  packageImages: PackageImage[];
  // Freight & Payment
  freightCharges?: FreightCharges;
  carrier?: Carrier;
  carrierTrackingCode?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  _id: string;
  name: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  package: PackageDetails;
  serviceType: ServiceType;
  estimatedPrice?: number;
  status: QuoteStatus;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  _id: string;
  to: string;
  subject: string;
  htmlContent: string;
  relatedShipmentId?: string;
  sentBy: string;
  status: "SENT" | "FAILED";
  errorMessage?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MapboxContext {
  id: string;
  text: string;
  short_code?: string;
}

export interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
  context?: MapboxContext[];
}

export interface LocationInfo {
  city: string;
  state: string;
  country: string;
  coordinates?: Coordinates;
}

export interface CloudinaryUploadParams {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

// ============================================================================
// API Client
// ============================================================================

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      json.error || json.message || "An error occurred",
      json
    );
  }

  // For paginated responses, keep both data and pagination
  if (json.success !== undefined && json.data !== undefined && json.pagination !== undefined) {
    return { data: json.data, pagination: json.pagination } as T;
  }

  // Extract data from API response wrapper { success, data, ... }
  if (json.success !== undefined && json.data !== undefined) {
    return json.data as T;
  }

  return json as T;
}

const BASE_URL = "";

// ============================================================================
// Shipments API
// ============================================================================

export interface CreateShipmentPayload {
  // Classification
  consignmentType?: ConsignmentType;
  shipmentType?: ShipmentType;
  shipmentMode?: ShipmentMode;
  serviceType?: ServiceType;
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
  packageImages?: { url: string; publicId: string }[];
  sendNotification?: boolean;
  // Optional freight & carrier at creation
  freightCharges?: FreightCharges;
  carrier?: string;
  carrierTrackingCode?: string;
}

export interface UpdateShipmentPayload extends Partial<CreateShipmentPayload> {
  currentLocation?: string;
  packageImages?: { url: string; publicId: string }[];
  freightCharges?: FreightCharges;
  carrier?: string;
  carrierTrackingCode?: string;
}

export interface ShipmentFilters {
  page?: number;
  limit?: number;
  status?: ShipmentStatus;
  serviceType?: ServiceType;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const shipmentsApi = {
  list: async (filters: ShipmentFilters = {}): Promise<PaginatedResponse<Shipment>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });
    const res = await fetch(`${BASE_URL}/api/admin/shipments?${params}`, {
      credentials: "include",
    });
    return handleResponse(res);
  },

  get: async (id: string): Promise<Shipment> => {
    const res = await fetch(`${BASE_URL}/api/admin/shipments/${id}`, {
      credentials: "include",
    });
    return handleResponse(res);
  },

  create: async (payload: CreateShipmentPayload): Promise<Shipment> => {
    const res = await fetch(`${BASE_URL}/api/admin/shipments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  update: async (id: string, payload: UpdateShipmentPayload): Promise<Shipment> => {
    const res = await fetch(`${BASE_URL}/api/admin/shipments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/admin/shipments/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await handleResponse(res);
  },

  updateStatus: async (
    id: string,
    payload: { status: ShipmentStatus; location?: string; description?: string; sendNotification?: boolean }
  ): Promise<Shipment> => {
    const res = await fetch(`${BASE_URL}/api/admin/shipments/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  updateTrackingEvent: async (
    shipmentId: string,
    eventId: string,
    payload: { location?: string; description?: string }
  ): Promise<TrackingEvent> => {
    const res = await fetch(`${BASE_URL}/api/admin/shipments/${shipmentId}/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  deleteTrackingEvent: async (shipmentId: string, eventId: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/admin/shipments/${shipmentId}/events/${eventId}`, {
      method: "DELETE",
      credentials: "include",
    });
    await handleResponse(res);
  },
};

// ============================================================================
// Quotes API
// ============================================================================

export interface QuoteFilters {
  page?: number;
  limit?: number;
  status?: QuoteStatus;
}

export interface RespondToQuotePayload {
  adminResponse: string;
  estimatedPrice?: number;
  sendEmail?: boolean;
}

export const quotesApi = {
  list: async (filters: QuoteFilters = {}): Promise<PaginatedResponse<Quote>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });
    const res = await fetch(`${BASE_URL}/api/admin/quotes?${params}`, {
      credentials: "include",
    });
    return handleResponse(res);
  },

  respond: async (id: string, payload: RespondToQuotePayload): Promise<Quote> => {
    const res = await fetch(`${BASE_URL}/api/admin/quotes/${id}/respond`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
};

// ============================================================================
// Emails API
// ============================================================================

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  relatedShipmentId?: string;
}

export interface EmailLogFilters {
  page?: number;
  limit?: number;
  status?: "SENT" | "FAILED";
  startDate?: string;
  endDate?: string;
}

export const emailsApi = {
  send: async (payload: SendEmailPayload): Promise<{ success: boolean; messageId?: string }> => {
    const res = await fetch(`${BASE_URL}/api/admin/emails/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  getLogs: async (filters: EmailLogFilters = {}): Promise<PaginatedResponse<EmailLog>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });
    const res = await fetch(`${BASE_URL}/api/admin/emails/logs?${params}`, {
      credentials: "include",
    });
    return handleResponse(res);
  },
};

// ============================================================================
// Uploads API
// ============================================================================

export const uploadsApi = {
  getSignedParams: async (): Promise<CloudinaryUploadParams> => {
    const res = await fetch(`${BASE_URL}/api/admin/uploads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    });
    return handleResponse(res);
  },

  uploadToCloudinary: async (
    file: File,
    params: CloudinaryUploadParams
  ): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", params.signature);
    formData.append("timestamp", String(params.timestamp));
    formData.append("api_key", params.apiKey);
    formData.append("folder", params.folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(res.status, data.error?.message || "Upload failed");
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  },
};

// ============================================================================
// Carriers API
// ============================================================================

export interface CreateCarrierPayload {
  name: string;
  code: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  trackingUrlTemplate?: string;
  isActive?: boolean;
}

export interface UpdateCarrierPayload extends Partial<CreateCarrierPayload> {}

export const carriersApi = {
  list: async (activeOnly = false): Promise<Carrier[]> => {
    const params = activeOnly ? "?active=true" : "";
    const res = await fetch(`${BASE_URL}/api/admin/carriers${params}`, {
      credentials: "include",
    });
    return handleResponse(res);
  },

  get: async (id: string): Promise<Carrier> => {
    const res = await fetch(`${BASE_URL}/api/admin/carriers/${id}`, {
      credentials: "include",
    });
    return handleResponse(res);
  },

  create: async (data: CreateCarrierPayload): Promise<Carrier> => {
    const res = await fetch(`${BASE_URL}/api/admin/carriers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: UpdateCarrierPayload): Promise<Carrier> => {
    const res = await fetch(`${BASE_URL}/api/admin/carriers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/admin/carriers/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse(res);
  },
};

// ============================================================================
// Mapbox API
// ============================================================================

export const mapboxApi = {
  autocomplete: async (query: string): Promise<MapboxFeature[]> => {
    if (!query || query.length < 2) return [];
    const res = await fetch(
      `${BASE_URL}/api/mapbox/autocomplete?q=${encodeURIComponent(query)}`
    );
    const data = await handleResponse<{ features: MapboxFeature[] }>(res);
    return data.features || [];
  },

  geocode: async (query: string): Promise<Coordinates | null> => {
    const res = await fetch(
      `${BASE_URL}/api/mapbox/geocode?q=${encodeURIComponent(query)}`
    );
    const data = await handleResponse<{ coordinates?: Coordinates }>(res);
    return data.coordinates || null;
  },
};

// ============================================================================
// Dashboard API
// ============================================================================

export interface DashboardStats {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  pendingQuotes: number;
  failedEmails: number;
  recentShipments: Shipment[];
  recentQuotes: Quote[];
  shipmentsByStatus: { status: string; count: number }[];
  shipmentsByDate: { date: string; count: number }[];
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    // Aggregate from multiple endpoints
    const [shipmentsRes, quotesRes] = await Promise.all([
      shipmentsApi.list({ limit: 100 }),
      quotesApi.list({ limit: 100 }),
    ]);

    const shipments = shipmentsRes.data;
    const quotes = quotesRes.data;

    // Calculate stats
    const statusCounts: Record<string, number> = {};
    shipments.forEach((s) => {
      statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
    });

    // Shipments by date (last 7 days)
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = shipments.filter(
        (s) => s.createdAt.split("T")[0] === dateStr
      ).length;
      last7Days.push({ date: dateStr, count });
    }

    return {
      totalShipments: shipmentsRes.pagination.total,
      inTransit: statusCounts["IN_TRANSIT"] || 0,
      delivered: statusCounts["DELIVERED"] || 0,
      pendingQuotes: quotes.filter((q) => q.status === "PENDING").length,
      failedEmails: 0, // Would need email logs endpoint
      recentShipments: shipments.slice(0, 5),
      recentQuotes: quotes.slice(0, 5),
      shipmentsByStatus: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      })),
      shipmentsByDate: last7Days,
    };
  },
};

// ============================================================================
// Company Settings API
// ============================================================================

export interface CompanySettings {
  companyName: string;
  officeAddress: string;
  phone: string;
  email: string;
  website?: string;
}

export const settingsApi = {
  get: async (): Promise<CompanySettings> => {
    const res = await fetch(`${BASE_URL}/api/admin/settings`, {
      credentials: "include",
    });
    return handleResponse(res);
  },

  update: async (data: Partial<CompanySettings>): Promise<CompanySettings> => {
    const res = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ message: string }> => {
    const res = await fetch(`${BASE_URL}/api/admin/settings/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

export { ApiError };
