import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Carrier from "@/models/Carrier";
import { withAuth, AuthenticatedHandler } from "@/middleware/withAuth";
import { ApiResponse, ICarrier } from "@/types";
import { Types } from "mongoose";
import { z } from "zod";

const updateCarrierSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().min(2).max(20).toUpperCase().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  trackingUrlTemplate: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/admin/carriers/:id
 * Get a single carrier
 */
const handleGet: AuthenticatedHandler = async (request, context) => {
  try {
    const params = await context.params;
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid carrier ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectDB();

    const carrier = await Carrier.findById(id).lean();

    if (!carrier) {
      const response: ApiResponse = {
        success: false,
        error: "Carrier not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<ICarrier> = {
      success: true,
      data: carrier as ICarrier,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get carrier error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch carrier",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

/**
 * PATCH /api/admin/carriers/:id
 * Update a carrier
 */
const handlePatch: AuthenticatedHandler = async (request, context) => {
  try {
    const params = await context.params;
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid carrier ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();
    const validation = updateCarrierSchema.safeParse(body);

    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectDB();

    // Check for duplicate code if updating code
    if (validation.data.code) {
      const existingCarrier = await Carrier.findOne({
        code: validation.data.code.toUpperCase(),
        _id: { $ne: id },
      });
      if (existingCarrier) {
        const response: ApiResponse = {
          success: false,
          error: "A carrier with this code already exists",
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    const updateData = {
      ...validation.data,
      code: validation.data.code?.toUpperCase(),
      contactEmail: validation.data.contactEmail || undefined,
      website: validation.data.website || undefined,
    };

    const carrier = await Carrier.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!carrier) {
      const response: ApiResponse = {
        success: false,
        error: "Carrier not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<ICarrier> = {
      success: true,
      data: carrier as ICarrier,
      message: "Carrier updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Update carrier error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to update carrier",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

/**
 * DELETE /api/admin/carriers/:id
 * Delete a carrier
 */
const handleDelete: AuthenticatedHandler = async (request, context) => {
  try {
    const params = await context.params;
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid carrier ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectDB();

    const carrier = await Carrier.findByIdAndDelete(id);

    if (!carrier) {
      const response: ApiResponse = {
        success: false,
        error: "Carrier not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Carrier deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Delete carrier error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to delete carrier",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

export const GET = withAuth(handleGet);
export const PATCH = withAuth(handlePatch);
export const DELETE = withAuth(handleDelete);
