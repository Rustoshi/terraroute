import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Quote from "@/models/Quote";
import { withAuth, AuthenticatedHandler } from "@/middleware/withAuth";
import { validateData, paginationSchema } from "@/utils/validation";
import { ApiResponse, PaginatedResponse, IQuote } from "@/types";

/**
 * GET /api/admin/quotes
 *
 * List all quote requests with pagination (Admin only).
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

    await connectDB();

    // Build query
    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (serviceType) {
      query.serviceType = serviceType;
    }

    // Get total count
    const total = await Quote.countDocuments(query);

    // Get paginated results
    const quotes = await Quote.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const response: PaginatedResponse<IQuote> = {
      success: true,
      data: quotes as IQuote[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("List quotes error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to retrieve quotes",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

// Export with authentication
export const GET = withAuth(handleGet);
