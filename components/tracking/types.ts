// Tracking page types
export interface TrackingEvent {
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

export interface PackageImage {
  url: string;
  publicId: string;
  uploadedAt?: string;
}

export interface LocationInfo {
  city: string;
  state: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}

export interface FreightCharge {
  baseCharge: number;
  fuelSurcharge?: number;
  insurance?: number;
  handlingFee?: number;
  customsDuty?: number;
  tax?: number;
  discount?: number;
  total: number;
  currency: string;
}

export interface CarrierInfo {
  name?: string;
  mode?: string;
  trackingCode?: string;
  contactPhone?: string;
}

export interface TrackingData {
  trackingCode: string;
  status: string;
  origin: string;
  destination: string;
  currentLocation?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  sender: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  receiver: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  package: {
    weight: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    description: string;
    quantity?: number;
    declaredValue?: {
      amount: number;
      currency: string;
    };
  };
  packageImages?: PackageImage[];
  // Classification
  consignmentType?: string;
  shipmentType?: string;
  shipmentMode?: string;
  serviceType: string;
  // Carrier
  carrier?: CarrierInfo;
  // Freight & Payment
  freight?: FreightCharge;
  paymentStatus?: string;
  paymentMethod?: string;
  // Events
  events: TrackingEvent[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Location coordinates for map
  originLocation?: LocationInfo;
  destinationLocation?: LocationInfo;
  currentLocationCoords?: { lat: number; lng: number };
}

export type TrackingState = "idle" | "loading" | "success" | "error" | "not_found";
