import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedHandler } from "@/middleware/withAuth";
import { validateData, sendEmailSchema } from "@/utils/validation";
import { sendEmail } from "@/lib/resend";
import { ApiResponse } from "@/types";

/**
 * POST /api/admin/emails/send
 *
 * Send a custom email (Admin only).
 * All emails are logged to the EmailLog collection.
 */
const handlePost: AuthenticatedHandler = async (request, context) => {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateData(sendEmailSchema, body);
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: validation.error,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { to, subject, htmlContent, relatedShipmentId } = validation.data!;

    // Send email
    const result = await sendEmail({
      to,
      subject,
      html: htmlContent,
      sentBy: context.user.id,
      relatedShipmentId,
    });

    if (!result.success) {
      const response: ApiResponse = {
        success: false,
        error: result.error || "Failed to send email",
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse<{ messageId?: string }> = {
      success: true,
      data: { messageId: result.messageId },
      message: "Email sent successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Send email error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to send email",
    };
    return NextResponse.json(response, { status: 500 });
  }
};

// Export with authentication
export const POST = withAuth(handlePost);
