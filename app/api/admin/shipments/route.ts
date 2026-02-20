import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Shipment from "@/models/Shipment";
import TrackingEvent from "@/models/TrackingEvent";
import { withAuth, AuthenticatedHandler } from "@/middleware/withAuth";
import { validateData, createShipmentSchema, paginationSchema, normalizeLocationInfo, normalizeContactInfo } from "@/utils/validation";
import { generateTrackingCode } from "@/utils/trackingCode";
import { calculateEstimatedDeliveryDate } from "@/utils/quoteEstimation";
import { sendShipmentCreatedEmail } from "@/lib/unosend";
import { ApiResponse, PaginatedResponse, IShipment, ShipmentStatus, ServiceType } from "@/types";
import mongoose, { Types } from "mongoose";

/**
 * POST /api/admin/shipments
 *
 * Create a new shipment (Admin only).
 */
const handlePost: AuthenticatedHandler = async (request, context) => {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateData(createShipmentSchema, body);
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: validation.error,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const shipmentData = validation.data!;

    await connectDB();

    // Generate unique tracking code
    let trackingCode: string;
    let attempts = 0;
    const maxAttempts = 5;

    // Ensure tracking code is unique
    do {
      trackingCode = generateTrackingCode();
      const existing = await Shipment.findOne({ trackingCode });
      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      const response: ApiResponse = {
        success: false,
        error: "Failed to generate unique tracking code. Please try again.",
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Calculate estimated delivery date if not provided.
    // Work with a date-only string (YYYY-MM-DD) and convert to a UTC Date only when persisting.
    const serviceType = shipmentData.serviceType || ServiceType.STANDARD;
    const estimatedDeliveryDateString =
      shipmentData.estimatedDeliveryDate || calculateEstimatedDeliveryDate(serviceType);
    const estimatedDeliveryDate = new Date(`${estimatedDeliveryDateString}T00:00:00.000Z`);

    // Process package images if provided
    const packageImages = (shipmentData.packageImages || []).slice(0, 5).map(
      (img: { url: string; publicId: string }) => ({
        url: img.url,
        publicId: img.publicId,
        uploadedAt: new Date(),
      })
    );

    // Use transaction for atomic shipment + tracking event creation
    const session = await mongoose.startSession();
    let shipment;

    try {
      session.startTransaction();

      // Create shipment within transaction
      const [createdShipment] = await Shipment.create([{
        trackingCode,
        // Classification
        consignmentType: shipmentData.consignmentType,
        shipmentType: shipmentData.shipmentType,
        shipmentMode: shipmentData.shipmentMode,
        serviceType: shipmentData.serviceType,
        // Parties - normalize coordinates to lat/lng format
        sender: normalizeContactInfo(shipmentData.sender),
        receiver: normalizeContactInfo(shipmentData.receiver),
        package: shipmentData.package,
        // Route
        origin: shipmentData.origin,
        destination: shipmentData.destination,
        // Normalize location coordinates to lat/lng format
        originLocation: normalizeLocationInfo(shipmentData.originLocation),
        destinationLocation: normalizeLocationInfo(shipmentData.destinationLocation),
        // Status
        status: ShipmentStatus.CREATED,
        currentLocation: shipmentData.origin,
        estimatedDeliveryDate,
        trackingEvents: [],
        packageImages,
        // Optional freight & carrier fields
        freightCharges: shipmentData.freightCharges || undefined,
        carrier: shipmentData.carrier ? new Types.ObjectId(shipmentData.carrier) : undefined,
        carrierTrackingCode: shipmentData.carrierTrackingCode || undefined,
        createdBy: new Types.ObjectId(context.user.id),
      }], { session });

      // Create initial tracking event within transaction
      const [trackingEvent] = await TrackingEvent.create([{
        shipmentId: createdShipment._id,
        status: ShipmentStatus.CREATED,
        location: shipmentData.origin,
        description: "Shipment has been created and is being processed",
      }], { session });

      // Update shipment with tracking event reference
      createdShipment.trackingEvents.push(trackingEvent._id);
      await createdShipment.save({ session });

      await session.commitTransaction();
      shipment = createdShipment;
    } catch (txError) {
      await session.abortTransaction();
      throw txError;
    } finally {
      session.endSession();
    }

    // Send notification email to receiver if enabled (async, don't block response)
    const shouldSendNotification = (body.sendNotification ?? true) !== false;
    if (shouldSendNotification) {
      sendShipmentCreatedEmail(
        shipment.receiver.email,
        shipment.receiver.name,
        shipment.trackingCode,
        shipment.origin,
        shipment.destination,
        context.user.id,
        shipment._id.toString()
      ).catch((err) => console.error("Failed to send shipment created email:", err));
    }

    const response: ApiResponse<IShipment> = {
      success: true,
      data: shipment.toObject(),
      message: `Shipment created with tracking code: ${trackingCode}`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Create shipment error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to create shipment",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

/**
 * GET /api/admin/shipments
 *
 * List all shipments with pagination (Admin only).
 */
const handleGet: AuthenticatedHandler = async (request, context) => {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse pagination params
    const paginationValidation = validateData(paginationSchema, {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    });

    const { page, limit } = paginationValidation.data || { page: 1, limit: 20 };

    // Optional filters
    const status = searchParams.get("status");
    const serviceType = searchParams.get("serviceType");
    const search = searchParams.get("search");

    await connectDB();

    // Build query
    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (serviceType) {
      query.serviceType = serviceType;
    }

    if (search) {
      // Escape special regex characters to prevent ReDoS attacks
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { trackingCode: { $regex: escapedSearch, $options: "i" } },
        { "sender.name": { $regex: escapedSearch, $options: "i" } },
        { "receiver.name": { $regex: escapedSearch, $options: "i" } },
        { origin: { $regex: escapedSearch, $options: "i" } },
        { destination: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    // Get total count
    const total = await Shipment.countDocuments(query);

    // Get paginated results
    const shipments = await Shipment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "name email")
      .lean();

    const response: PaginatedResponse<IShipment> = {
      success: true,
      data: shipments as IShipment[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("List shipments error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to retrieve shipments",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

// Export with authentication
export const POST = withAuth(handlePost);
export const GET = withAuth(handleGet);
