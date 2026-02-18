import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Shipment from "@/models/Shipment";
import TrackingEvent from "@/models/TrackingEvent";
import { withRateLimit, checkRateLimit } from "@/middleware/rateLimit";
import { validateData, trackingQuerySchema, normalizeCoordinates } from "@/utils/validation";
import { ApiResponse, IShipment, ITrackingEvent } from "@/types";

/**
 * GET /api/tracking?code=TRACKING_CODE
 *
 * Public endpoint for tracking shipments by tracking code.
 * Rate limited to prevent abuse.
 */

interface LocationInfo {
  city: string;
  state: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface PackageImage {
  url: string;
  publicId: string;
  uploadedAt?: Date;
}

interface TrackingResponse {
  trackingCode: string;
  status: string;
  origin: string;
  destination: string;
  currentLocation?: string;
  estimatedDeliveryDate?: string;
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
    description: string;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    quantity?: number;
    declaredValue?: {
      amount: number;
      currency: string;
    };
  };
  packageImages?: PackageImage[];
  serviceType: string;
  consignmentType?: string;
  shipmentType?: string;
  shipmentMode?: string;
  originLocation?: LocationInfo;
  destinationLocation?: LocationInfo;
  freight?: {
    baseCharge: number;
    fuelSurcharge?: number;
    insurance?: number;
    handlingFee?: number;
    customsDuty?: number;
    tax?: number;
    discount?: number;
    total: number;
    currency: string;
  };
  paymentStatus?: string;
  paymentMethod?: string;
  carrier?: {
    name?: string;
    mode?: string;
    trackingCode?: string;
  };
  events: Array<{
    status: string;
    location: string;
    description: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

async function handleGet(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const validation = validateData(trackingQuerySchema, {
      code: searchParams.get("code"),
    });

    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: validation.error,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { code } = validation.data!;

    await connectDB();

    // Find shipment by tracking code
    const shipment = await Shipment.findOne({ trackingCode: code })
      .select("-createdBy") // Exclude admin reference for public endpoint
      .lean<IShipment>();

    if (!shipment) {
      const response: ApiResponse = {
        success: false,
        error: "Shipment not found. Please check your tracking code.",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Get tracking events for this shipment
    const events = await TrackingEvent.find({ shipmentId: shipment._id })
      .sort({ createdAt: -1 })
      .lean<ITrackingEvent[]>();

    // Format response (sanitize sensitive data for public endpoint)
    const trackingResponse: TrackingResponse = {
      trackingCode: shipment.trackingCode,
      status: shipment.status,
      origin: shipment.origin,
      destination: shipment.destination,
      currentLocation: shipment.currentLocation,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate
        ? shipment.estimatedDeliveryDate.toISOString().split("T")[0]
        : undefined,
      sender: {
        name: shipment.sender.name,
        address: shipment.sender.address,
        phone: shipment.sender.phone,
        email: shipment.sender.email,
      },
      receiver: {
        name: shipment.receiver.name,
        address: shipment.receiver.address,
        phone: shipment.receiver.phone,
        email: shipment.receiver.email,
      },
      package: {
        weight: shipment.package.weight,
        description: shipment.package.description || "",
        dimensions: shipment.package.dimensions ? {
          length: shipment.package.dimensions.length,
          width: shipment.package.dimensions.width,
          height: shipment.package.dimensions.height,
          unit: "cm",
        } : undefined,
        declaredValue: shipment.package.value ? {
          amount: shipment.package.value,
          currency: shipment.package.currency || "USD",
        } : undefined,
      },
      serviceType: shipment.serviceType,
      consignmentType: shipment.consignmentType,
      shipmentType: shipment.shipmentType,
      shipmentMode: shipment.shipmentMode,
      freight: shipment.freightCharges ? {
        baseCharge: shipment.freightCharges.baseCharge,
        fuelSurcharge: shipment.freightCharges.fuelSurcharge,
        insurance: shipment.freightCharges.insuranceFee,
        handlingFee: shipment.freightCharges.handlingFee,
        customsDuty: shipment.freightCharges.customsDuty,
        tax: shipment.freightCharges.tax,
        discount: shipment.freightCharges.discount,
        total: shipment.freightCharges.total,
        currency: shipment.freightCharges.currency || "USD",
      } : undefined,
      paymentStatus: shipment.freightCharges?.paymentStatus,
      paymentMethod: shipment.freightCharges?.paymentMethod,
      carrier: shipment.carrierTrackingCode ? {
        trackingCode: shipment.carrierTrackingCode,
        mode: shipment.shipmentMode,
      } : undefined,
      originLocation: shipment.originLocation ? {
        city: shipment.originLocation.city,
        state: shipment.originLocation.state,
        country: shipment.originLocation.country,
        coordinates: normalizeCoordinates(shipment.originLocation.coordinates),
      } : undefined,
      destinationLocation: shipment.destinationLocation ? {
        city: shipment.destinationLocation.city,
        state: shipment.destinationLocation.state,
        country: shipment.destinationLocation.country,
        coordinates: normalizeCoordinates(shipment.destinationLocation.coordinates),
      } : undefined,
      events: events.map((event) => ({
        status: event.status,
        location: event.location,
        description: event.description,
        timestamp: event.createdAt,
      })),
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
      packageImages: shipment.packageImages?.map((img) => ({
        url: img.url,
        publicId: img.publicId,
        uploadedAt: img.uploadedAt,
      })),
    };

    const response: ApiResponse<TrackingResponse> = {
      success: true,
      data: trackingResponse,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Tracking API error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to retrieve tracking information",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// Export with rate limiting
export const GET = withRateLimit(handleGet, "tracking");
