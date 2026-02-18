import { Resend } from "resend";
import { connectDB } from "./db";
import EmailLog from "@/models/EmailLog";
import { EmailStatus } from "@/types";
import { Types } from "mongoose";

/**
 * Resend email client initialization.
 * Lazy-loaded to prevent build-time errors when API key is not set.
 */
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "noreply@example.com";
}

function getCompanyName(): string {
  return process.env.NEXT_PUBLIC_COMPANY_NAME || "Courier Express";
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  sentBy: string;
  relatedShipmentId?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const { to, subject, html, sentBy, relatedShipmentId } = options;
  const recipients = Array.isArray(to) ? to : [to];

  await connectDB();

  try {
    const fromEmail = getFromEmail();
    console.log("📧 Sending email from:", fromEmail, "to:", recipients);
    console.log("📧 API Key present:", !!process.env.RESEND_API_KEY);
    
    const { data, error } = await getResendClient().emails.send({
      from: fromEmail,
      to: recipients,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend API error details:", JSON.stringify(error, null, 2));
      await EmailLog.create({
        to: recipients.join(", "),
        subject,
        htmlContent: html,
        relatedShipmentId: relatedShipmentId
          ? new Types.ObjectId(relatedShipmentId)
          : undefined,
        sentBy: new Types.ObjectId(sentBy),
        status: EmailStatus.FAILED,
        errorMessage: error.message,
      });

      console.error("❌ Email send failed:", error.message);
      return { success: false, error: error.message };
    }

    await EmailLog.create({
      to: recipients.join(", "),
      subject,
      htmlContent: html,
      relatedShipmentId: relatedShipmentId
        ? new Types.ObjectId(relatedShipmentId)
        : undefined,
      sentBy: new Types.ObjectId(sentBy),
      status: EmailStatus.SENT,
    });

    console.log(`✅ Email sent successfully: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await EmailLog.create({
      to: recipients.join(", "),
      subject,
      htmlContent: html,
      relatedShipmentId: relatedShipmentId
        ? new Types.ObjectId(relatedShipmentId)
        : undefined,
      sentBy: new Types.ObjectId(sentBy),
      status: EmailStatus.FAILED,
      errorMessage,
    });

    console.error("❌ Email send error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendShipmentCreatedEmail(
  recipientEmail: string,
  recipientName: string,
  trackingCode: string,
  origin: string,
  destination: string,
  sentBy: string,
  shipmentId: string
): Promise<EmailResult> {
  const companyName = getCompanyName();
  const subject = `Your Shipment ${trackingCode} Has Been Created - ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f97316; margin: 0;">${companyName}</h1>
        <p style="color: #64748b; margin: 5px 0;">Global Shipping & Logistics</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h2 style="color: white; margin: 0 0 10px 0; font-size: 28px;">Shipment Created</h2>
        <p style="color: #fed7aa; margin: 0;">Your package is ready to ship</p>
      </div>
      
      <p style="color: #334155; font-size: 16px;">Hello ${recipientName},</p>
      <p style="color: #64748b; line-height: 1.6;">Your shipment has been successfully created and is being processed by our team. We'll keep you updated on every step of the journey.</p>
      
      <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f97316;">
        <p style="margin: 0 0 15px 0;"><strong style="color: #0f172a;">Tracking Code:</strong> <span style="color: #f97316; font-size: 18px; font-weight: bold;">${trackingCode}</span></p>
        <p style="margin: 0 0 15px 0;"><strong style="color: #0f172a;">Origin:</strong> <span style="color: #334155;">${origin}</span></p>
        <p style="margin: 0;"><strong style="color: #0f172a;">Destination:</strong> <span style="color: #334155;">${destination}</span></p>
      </div>
      
      <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0; color: #1e40af;"><strong>💡 Tip:</strong> Save your tracking code to monitor your shipment's progress in real-time.</p>
      </div>
      
      <p style="color: #64748b; line-height: 1.6;">Thank you for choosing ${companyName}. We're committed to delivering your package safely and on time.</p>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 5px 0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        <p style="color: #cbd5e1; font-size: 12px; margin: 5px 0;">This is an automated notification email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject,
    html,
    sentBy,
    relatedShipmentId: shipmentId,
  });
}

export async function sendStatusUpdateEmail(
  recipientEmail: string,
  recipientName: string,
  trackingCode: string,
  status: string,
  location: string,
  description: string,
  sentBy: string,
  shipmentId: string
): Promise<EmailResult> {
  const companyName = getCompanyName();
  const statusColors: Record<string, string> = {
    CREATED: "#6b7280",
    PICKED_UP: "#3b82f6",
    IN_TRANSIT: "#f59e0b",
    OUT_FOR_DELIVERY: "#8b5cf6",
    DELIVERED: "#10b981",
    ON_HOLD: "#ef4444",
    SEIZED: "#be123c",
  };

  const statusEmojis: Record<string, string> = {
    CREATED: "📦",
    PICKED_UP: "🚚",
    IN_TRANSIT: "✈️",
    OUT_FOR_DELIVERY: "🚛",
    DELIVERED: "✅",
    ON_HOLD: "⏸️",
    SEIZED: "🚫",
  };

  const statusColor = statusColors[status] || "#6b7280";
  const statusEmoji = statusEmojis[status] || "📍";
  const statusText = status.replace(/_/g, " ");
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const trackingUrl = `${baseUrl}/track?code=${trackingCode}`;

  const subject = `${statusEmoji} Shipment ${trackingCode} Update: ${statusText} - ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f97316; margin: 0;">${companyName}</h1>
        <p style="color: #64748b; margin: 5px 0;">Global Shipping & Logistics</p>
      </div>
      
      <div style="background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <div style="font-size: 48px; margin-bottom: 10px;">${statusEmoji}</div>
        <h2 style="color: white; margin: 0 0 10px 0; font-size: 28px;">Status Update</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px; font-weight: 600;">${statusText}</p>
      </div>
      
      <p style="color: #334155; font-size: 16px;">Hello ${recipientName},</p>
      <p style="color: #64748b; line-height: 1.6;">Your shipment status has been updated. Here are the latest details:</p>
      
      <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ${statusColor};">
        <p style="margin: 0 0 15px 0;"><strong style="color: #0f172a;">Tracking Code:</strong> <span style="color: #f97316; font-size: 18px; font-weight: bold;">${trackingCode}</span></p>
        <p style="margin: 0 0 15px 0;"><strong style="color: #0f172a;">Current Status:</strong> 
          <span style="background: ${statusColor}; color: white; padding: 6px 16px; border-radius: 6px; display: inline-block; font-weight: 600;">
            ${statusEmoji} ${statusText}
          </span>
        </p>
        <p style="margin: 0 0 15px 0;"><strong style="color: #0f172a;">Current Location:</strong> <span style="color: #334155;">${location}</span></p>
        ${description ? `<p style="margin: 0;"><strong style="color: #0f172a;">Details:</strong> <span style="color: #334155;">${description}</span></p>` : ""}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          🔍 View Full Tracking Details
        </a>
      </div>
      
      ${status === 'DELIVERED' ? `
        <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 25px 0; border: 2px solid #10b981;">
          <p style="margin: 0; color: #065f46; font-weight: 600;">🎉 Your package has been delivered! Thank you for choosing ${companyName}.</p>
        </div>
      ` : `
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600;">📍 Track Your Shipment Online:</p>
          <p style="margin: 0; color: #1e3a8a; word-break: break-all;">
            <a href="${trackingUrl}" style="color: #2563eb; text-decoration: underline;">${trackingUrl}</a>
          </p>
        </div>
      `}
      
      <p style="color: #64748b; line-height: 1.6;">Thank you for choosing ${companyName}. We're committed to keeping you informed every step of the way.</p>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 5px 0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        <p style="color: #cbd5e1; font-size: 12px; margin: 5px 0;">This is an automated notification email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject,
    html,
    sentBy,
    relatedShipmentId: shipmentId,
  });
}

export async function sendQuoteResponseEmail(
  recipientEmail: string,
  recipientName: string,
  origin: string,
  destination: string,
  estimatedPrice: number,
  adminResponse: string,
  sentBy: string
): Promise<EmailResult> {
  const companyName = getCompanyName();
  const subject = `Your Quote Response: ${origin} → ${destination} - ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f97316; margin: 0;">${companyName}</h1>
        <p style="color: #64748b; margin: 5px 0;">Global Shipping & Logistics</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <div style="font-size: 48px; margin-bottom: 10px;">💰</div>
        <h2 style="color: white; margin: 0 0 10px 0; font-size: 28px;">Quote Response</h2>
        <p style="color: #bfdbfe; margin: 0;">We've prepared your shipping estimate</p>
      </div>
      
      <p style="color: #334155; font-size: 16px;">Hello ${recipientName},</p>
      <p style="color: #64748b; line-height: 1.6;">Thank you for your quote request. We've reviewed your shipping requirements and prepared a competitive estimate for you.</p>
      
      <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6;">
        <p style="margin: 0 0 15px 0;"><strong style="color: #0f172a;">Route:</strong> <span style="color: #334155; font-size: 16px;">${origin} → ${destination}</span></p>
        <p style="margin: 0;"><strong style="color: #0f172a;">Estimated Price:</strong></p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 42px; color: #3b82f6; font-weight: bold; display: block;">
            $${estimatedPrice.toFixed(2)}
          </span>
          <span style="color: #64748b; font-size: 14px;">USD</span>
        </div>
      </div>
      
      <div style="background: #dbeafe; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #93c5fd;">
        <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600;">📝 Message from our team:</p>
        <p style="margin: 0; color: #1e3a8a; line-height: 1.6;">${adminResponse}</p>
      </div>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e;"><strong>📞 Ready to Ship?</strong> Contact us to proceed with your shipment or if you have any questions about this quote.</p>
      </div>
      
      <p style="color: #64748b; line-height: 1.6;">Thank you for considering ${companyName}. We look forward to serving your shipping needs with excellence and reliability.</p>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 5px 0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        <p style="color: #cbd5e1; font-size: 12px; margin: 5px 0;">This quote is valid for 30 days from the date of issue.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject,
    html,
    sentBy,
  });
}

export { getResendClient };
