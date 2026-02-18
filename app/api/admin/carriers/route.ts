import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Carrier from "@/models/Carrier";
import { withAuth, AuthenticatedHandler } from "@/middleware/withAuth";
import { ApiResponse, ICarrier } from "@/types";
import { z } from "zod";

/**
 * Carrier management API routes
 */

// Validation schema for carrier
const carrierSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20).toUpperCase(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  trackingUrlTemplate: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/admin/carriers
 * List all carriers
 */
const handleGet: AuthenticatedHandler = async (request) => {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("active") === "true";

    const query = activeOnly ? { isActive: true } : {};
    const carriers = await Carrier.find(query).sort({ name: 1 }).lean();

    const response: ApiResponse<ICarrier[]> = {
      success: true,
      data: carriers as ICarrier[],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get carriers error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch carriers",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

/**
 * POST /api/admin/carriers
 * Create a new carrier
 */
const handlePost: AuthenticatedHandler = async (request, context) => {
  try {
    const body = await request.json();

    // Validate input
    const validation = carrierSchema.safeParse(body);
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectDB();

    // Check for duplicate code
    const existingCarrier = await Carrier.findOne({ code: validation.data.code.toUpperCase() });
    if (existingCarrier) {
      const response: ApiResponse = {
        success: false,
        error: "A carrier with this code already exists",
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Create carrier
    const carrier = await Carrier.create({
      ...validation.data,
      code: validation.data.code.toUpperCase(),
      contactEmail: validation.data.contactEmail || undefined,
      website: validation.data.website || undefined,
      createdBy: context.user.id,
    });

    const response: ApiResponse<ICarrier> = {
      success: true,
      data: carrier.toObject() as ICarrier,
      message: "Carrier created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Create carrier error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to create carrier",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
