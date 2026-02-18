import mongoose, { Schema, Model } from "mongoose";
import { IEmailLog, EmailStatus } from "@/types";

/**
 * EmailLog model - records all emails sent from the platform.
 * Provides audit trail for transactional emails and admin communications.
 */

const EmailLogSchema = new Schema<IEmailLog>(
  {
    to: {
      type: String,
      required: [true, "Recipient email is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    htmlContent: {
      type: String,
      required: [true, "Email content is required"],
    },
    relatedShipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
      required: false,
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender admin ID is required"],
    },
    status: {
      type: String,
      enum: Object.values(EmailStatus),
      required: [true, "Status is required"],
    },
    errorMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
EmailLogSchema.index({ status: 1 });
EmailLogSchema.index({ sentBy: 1 });
EmailLogSchema.index({ relatedShipmentId: 1 });
EmailLogSchema.index({ createdAt: -1 });

const EmailLog: Model<IEmailLog> =
  mongoose.models.EmailLog || mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);

export default EmailLog;
