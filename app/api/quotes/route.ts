import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Quote from "@/models/Quote";
import { withRateLimit } from "@/middleware/rateLimit";
import { validateData, createQuoteSchema } from "@/utils/validation";
import { calculateEstimate, getEstimatedDeliveryDays } from "@/utils/quoteEstimation";
import { ApiResponse, IQuote, QuoteStatus } from "@/types";

/**
 * POST /api/quotes
 *
 * Public endpoint for requesting shipping quotes.
 * Rate limited to prevent spam.
 */

interface QuoteResponse {
  id: string;
  status: QuoteStatus;
  estimatedPrice: number;
  estimatedDelivery: {
    min: number;
    max: number;
  };
  message: string;
}

async function handlePost(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateData(createQuoteSchema, body);

    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: validation.error,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const quoteData = validation.data!;

    await connectDB();

    // Calculate initial estimate
    const estimation = calculateEstimate(
      quoteData.packageDetails,
      quoteData.serviceType
    );

    // Create quote
    const quote = await Quote.create({
      name: quoteData.name,
      email: quoteData.email,
      phone: quoteData.phone,
      origin: quoteData.origin,
      destination: quoteData.destination,
      packageDetails: quoteData.packageDetails,
      serviceType: quoteData.serviceType,
      estimatedPrice: estimation.totalEstimate,
      status: QuoteStatus.PENDING,
    });

    // Get estimated delivery days based on service type
    const deliveryDays = getEstimatedDeliveryDays(quoteData.serviceType);

    const quoteResponse: QuoteResponse = {
      id: quote._id.toString(),
      status: quote.status,
      estimatedPrice: estimation.totalEstimate,
      estimatedDelivery: deliveryDays,
      message:
        "Your quote request has been received. Our team will review and respond shortly with a detailed quote.",
    };

    const response: ApiResponse<QuoteResponse> = {
      success: true,
      data: quoteResponse,
      message: "Quote request submitted successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Quote creation error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to submit quote request",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// Export with rate limiting
export const POST = withRateLimit(handlePost, "quotes");
