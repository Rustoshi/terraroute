import mongoose, { Schema, Model } from "mongoose";
import { ICarrier } from "@/types";

/**
 * Carrier model - represents shipping carriers/partners.
 * Admin can add and manage carriers for shipments.
 */

const CarrierSchema = new Schema<ICarrier>(
  {
    name: {
      type: String,
      required: [true, "Carrier name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Carrier code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, "Carrier code cannot exceed 20 characters"],
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    trackingUrlTemplate: {
      type: String,
      trim: true,
      // Template should contain {trackingCode} placeholder
      // e.g., "https://www.dhl.com/track?id={trackingCode}"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by admin is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CarrierSchema.index({ isActive: 1 });
CarrierSchema.index({ name: "text" });

// Virtual for generating tracking URL
CarrierSchema.methods.getTrackingUrl = function (trackingCode: string): string | null {
  if (!this.trackingUrlTemplate) return null;
  return this.trackingUrlTemplate.replace("{trackingCode}", trackingCode);
};

const Carrier: Model<ICarrier> =
  mongoose.models.Carrier || mongoose.model<ICarrier>("Carrier", CarrierSchema);

export default Carrier;
