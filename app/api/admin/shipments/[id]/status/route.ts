import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Shipment from "@/models/Shipment";
import TrackingEvent from "@/models/TrackingEvent";
import { withAuth, AuthenticatedHandler } from "@/middleware/withAuth";
import { validateData, updateShipmentStatusSchema } from "@/utils/validation";
import { sendStatusUpdateEmail } from "@/lib/resend";
import { ApiResponse, IShipment } from "@/types";
import { Types } from "mongoose";

/**
 * PATCH /api/admin/shipments/:id/status
 *
 * Update shipment status and create a tracking event (Admin only).
 * Sends notification email to receiver.
 */
const handlePatch: AuthenticatedHandler = async (request, context) => {
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
    const validation = validateData(updateShipmentStatusSchema, body);
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: validation.error,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { status, location, description } = validation.data!;

    await connectDB();

    const shipment = await Shipment.findById(id);

    if (!shipment) {
      const response: ApiResponse = {
        success: false,
        error: "Shipment not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Admin can update status in any order - no transition restrictions

    // Create tracking event
    const trackingEvent = await TrackingEvent.create({
      shipmentId: shipment._id,
      status,
      location,
      description: description || `Status updated to ${status.replace(/_/g, " ")}`,
    });

    // Update shipment
    shipment.status = status;
    shipment.currentLocation = location;
    shipment.trackingEvents.push(trackingEvent._id);
    await shipment.save();

    // Send notification email (async)
    sendStatusUpdateEmail(
      shipment.receiver.email,
      shipment.receiver.name,
      shipment.trackingCode,
      status,
      location,
      description || "",
      context.user.id,
      shipment._id.toString()
    ).catch((err) => console.error("Failed to send status update email:", err));

    // Populate events for response
    await shipment.populate({
      path: "trackingEvents",
      options: { sort: { createdAt: -1 } },
    });

    const response: ApiResponse<IShipment> = {
      success: true,
      data: shipment.toObject(),
      message: `Shipment status updated to ${status}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Update shipment status error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to update shipment status",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

// Export with authentication
export const PATCH = withAuth(handlePatch);
