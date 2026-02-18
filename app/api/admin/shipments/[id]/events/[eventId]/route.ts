import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Shipment from "@/models/Shipment";
import TrackingEvent from "@/models/TrackingEvent";
import { withAuth, AuthenticatedHandler } from "@/middleware/withAuth";
import { ApiResponse, IShipment } from "@/types";
import { Types } from "mongoose";
import { z } from "zod";

const updateEventSchema = z.object({
  location: z.string().min(2).max(200).optional(),
  description: z.string().max(500).optional(),
});

/**
 * PUT /api/admin/shipments/:id/events/:eventId
 *
 * Update a tracking event (Admin only).
 */
const handlePut: AuthenticatedHandler = async (request, context) => {
  try {
    const params = await context.params;
    const { id, eventId } = params;

    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(eventId)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();
    const validation = updateEventSchema.safeParse(body);
    
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid data",
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

    // Check if event belongs to this shipment
    if (!shipment.trackingEvents.some((e: Types.ObjectId) => e.toString() === eventId)) {
      const response: ApiResponse = {
        success: false,
        error: "Event not found in this shipment",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const event = await TrackingEvent.findById(eventId);
    if (!event) {
      const response: ApiResponse = {
        success: false,
        error: "Tracking event not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Update event fields
    if (validation.data.location !== undefined) {
      event.location = validation.data.location;
    }
    if (validation.data.description !== undefined) {
      event.description = validation.data.description;
    }

    await event.save();

    const response: ApiResponse = {
      success: true,
      data: event.toObject(),
      message: "Tracking event updated",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Update tracking event error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to update tracking event",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

/**
 * DELETE /api/admin/shipments/:id/events/:eventId
 *
 * Delete a tracking event (Admin only).
 */
const handleDelete: AuthenticatedHandler = async (request, context) => {
  try {
    const params = await context.params;
    const { id, eventId } = params;

    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(eventId)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid ID",
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

    // Check if event belongs to this shipment
    const eventIndex = shipment.trackingEvents.findIndex(
      (e: Types.ObjectId) => e.toString() === eventId
    );
    
    if (eventIndex === -1) {
      const response: ApiResponse = {
        success: false,
        error: "Event not found in this shipment",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Remove event from shipment
    shipment.trackingEvents.splice(eventIndex, 1);
    await shipment.save();

    // Delete the tracking event
    await TrackingEvent.findByIdAndDelete(eventId);

    const response: ApiResponse = {
      success: true,
      message: "Tracking event deleted",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Delete tracking event error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to delete tracking event",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

// Export with authentication
export const PUT = withAuth(handlePut);
export const DELETE = withAuth(handleDelete);
