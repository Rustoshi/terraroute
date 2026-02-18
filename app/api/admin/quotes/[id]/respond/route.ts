import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Quote from "@/models/Quote";
import { withAuth, AuthenticatedHandler } from "@/middleware/withAuth";
import { validateData, respondQuoteSchema } from "@/utils/validation";
import { sendQuoteResponseEmail } from "@/lib/resend";
import { ApiResponse, IQuote, QuoteStatus } from "@/types";
import { Types } from "mongoose";

/**
 * PATCH /api/admin/quotes/:id/respond
 *
 * Respond to a quote request (Admin only).
 * Sends email notification to the requester.
 */
const handlePatch: AuthenticatedHandler = async (request, context) => {
  try {
    const params = await context.params;
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid quote ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();

    // Validate input
    const validation = validateData(respondQuoteSchema, body);
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: validation.error,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { estimatedPrice, adminResponse } = validation.data!;

    await connectDB();

    const quote = await Quote.findById(id);

    if (!quote) {
      const response: ApiResponse = {
        success: false,
        error: "Quote not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if quote is still pending
    if (quote.status !== QuoteStatus.PENDING) {
      const response: ApiResponse = {
        success: false,
        error: `Quote has already been ${quote.status.toLowerCase()}`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Update quote
    quote.estimatedPrice = estimatedPrice;
    quote.adminResponse = adminResponse;
    quote.status = QuoteStatus.RESPONDED;
    await quote.save();

    // Send response email (async)
    sendQuoteResponseEmail(
      quote.email,
      quote.name,
      quote.origin,
      quote.destination,
      estimatedPrice,
      adminResponse,
      context.user.id
    ).catch((err) => console.error("Failed to send quote response email:", err));

    const response: ApiResponse<IQuote> = {
      success: true,
      data: quote.toObject(),
      message: "Quote response sent successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Respond to quote error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to respond to quote",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

// Export with authentication
export const PATCH = withAuth(handlePatch);
