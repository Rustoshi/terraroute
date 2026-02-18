import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Shipment from "@/models/Shipment";
import TrackingEvent from "@/models/TrackingEvent";
import Carrier from "@/models/Carrier"; // Required for populate
import { withAuth, AuthenticatedHandler } from "@/middleware/withAuth";
import { validateData, updateShipmentSchema, normalizeLocationInfo, normalizeContactInfo } from "@/utils/validation";
import { deleteFile } from "@/lib/cloudinary";
import { ApiResponse, IShipment } from "@/types";
import { Types } from "mongoose";

/**
 * GET /api/admin/shipments/:id
 *
 * Get a single shipment by ID (Admin only).
 */
const handleGet: AuthenticatedHandler = async (request, context) => {
  try {
    const params = await context.params;
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid shipment ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectDB();
    
    // Ensure Carrier model is registered for populate
    void Carrier;

    const shipment = await Shipment.findById(id)
      .populate("createdBy", "name email")
      .populate("carrier", "name code contactEmail contactPhone website trackingUrlTemplate")
      .populate({
        path: "trackingEvents",
        options: { sort: { createdAt: -1 } },
      });

    if (!shipment) {
      const response: ApiResponse = {
        success: false,
        error: "Shipment not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<IShipment> = {
      success: true,
      data: shipment.toObject(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get shipment error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to retrieve shipment",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

/**
 * PUT /api/admin/shipments/:id
 *
 * Update a shipment (Admin only).
 */
const handlePut: AuthenticatedHandler = async (request, context) => {
  try {
    const params = await context.params;
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid shipment ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();

    // Validate input
    const validation = validateData(updateShipmentSchema, body);
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: validation.error,
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectDB();

    const shipment = await Shipment.findById(id);

    if (!shipment) {
      const response: ApiResponse = {
        success: false,
        error: "Shipment not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Update fields
    const updateData = validation.data!;

    // Classification fields
    if (updateData.consignmentType) shipment.consignmentType = updateData.consignmentType;
    if (updateData.shipmentType) shipment.shipmentType = updateData.shipmentType;
    if (updateData.shipmentMode) shipment.shipmentMode = updateData.shipmentMode;
    if (updateData.serviceType) shipment.serviceType = updateData.serviceType;
    
    // Contact info - normalize coordinates to lat/lng format
    if (updateData.sender) shipment.sender = normalizeContactInfo(updateData.sender)!;
    if (updateData.receiver) shipment.receiver = normalizeContactInfo(updateData.receiver)!;
    if (updateData.package) shipment.package = updateData.package;
    
    // Route info
    if (updateData.origin) shipment.origin = updateData.origin;
    if (updateData.destination) shipment.destination = updateData.destination;
    if (updateData.currentLocation) shipment.currentLocation = updateData.currentLocation;
    // Normalize location coordinates to lat/lng format
    if (updateData.originLocation) shipment.originLocation = normalizeLocationInfo(updateData.originLocation);
    if (updateData.destinationLocation) shipment.destinationLocation = normalizeLocationInfo(updateData.destinationLocation);
    if (updateData.estimatedDeliveryDate) {
      shipment.estimatedDeliveryDate = new Date(
        `${updateData.estimatedDeliveryDate}T00:00:00.000Z`
      );
    }
    
    // Handle package images update
    if (updateData.packageImages !== undefined) {
      shipment.packageImages = updateData.packageImages.map((img: { url: string; publicId: string }) => ({
        url: img.url,
        publicId: img.publicId,
        uploadedAt: new Date(),
      }));
    }
    
    // Handle freight charges update
    if (updateData.freightCharges !== undefined) {
      shipment.freightCharges = {
        ...updateData.freightCharges,
        paidAt: updateData.freightCharges.paidAt ? new Date(updateData.freightCharges.paidAt) : undefined,
      };
    }
    
    // Handle carrier update
    if (updateData.carrier !== undefined) {
      shipment.carrier = updateData.carrier ? new Types.ObjectId(updateData.carrier) : undefined;
    }
    
    // Handle carrier tracking code update
    if (updateData.carrierTrackingCode !== undefined) {
      shipment.carrierTrackingCode = updateData.carrierTrackingCode;
    }

    await shipment.save();

    const response: ApiResponse<IShipment> = {
      success: true,
      data: shipment.toObject(),
      message: "Shipment updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Update shipment error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to update shipment",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

/**
 * DELETE /api/admin/shipments/:id
 *
 * Delete a shipment (Admin only).
 * Also deletes associated tracking events and Cloudinary files.
 */
const handleDelete: AuthenticatedHandler = async (request, context) => {
  try {
    const params = await context.params;
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid shipment ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectDB();

    const shipment = await Shipment.findById(id);

    if (!shipment) {
      const response: ApiResponse = {
        success: false,
        error: "Shipment not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Delete associated files from Cloudinary
    if (shipment.packageImages && shipment.packageImages.length > 0) {
      await Promise.all(
        shipment.packageImages.map((image: { publicId: string }) =>
          deleteFile(image.publicId).catch((err) =>
            console.error(`Failed to delete Cloudinary file: ${image.publicId}`, err)
          )
        )
      );
    }

    // Delete associated tracking events
    await TrackingEvent.deleteMany({ shipmentId: shipment._id });

    // Delete the shipment
    await shipment.deleteOne();

    const response: ApiResponse = {
      success: true,
      message: "Shipment deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Delete shipment error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to delete shipment",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

// Export with authentication
export const GET = withAuth(handleGet);
export const PUT = withAuth(handlePut);
export const DELETE = withAuth(handleDelete);
