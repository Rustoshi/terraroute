import mongoose, { Schema, Model } from "mongoose";
import { IQuote, ServiceType, QuoteStatus } from "@/types";

/**
 * Quote model - stores shipping quote requests from public users.
 * Allows admins to respond with pricing and convert to shipments.
 */

// Embedded schema for package dimensions
const DimensionsSchema = new Schema(
  {
    length: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Embedded schema for package details in quote
const QuotePackageDetailsSchema = new Schema(
  {
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [0, "Weight must be positive"],
    },
    dimensions: {
      type: DimensionsSchema,
      required: true,
    },
    value: {
      type: Number,
      required: [true, "Declared value is required"],
      min: [0, "Value must be positive"],
    },
    description: {
      type: String,
      required: [true, "Package description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
  },
  { _id: false }
);

const QuoteSchema = new Schema<IQuote>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    origin: {
      type: String,
      required: [true, "Origin is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    packageDetails: {
      type: QuotePackageDetailsSchema,
      required: [true, "Package details are required"],
    },
    serviceType: {
      type: String,
      enum: Object.values(ServiceType),
      required: [true, "Service type is required"],
    },
    estimatedPrice: {
      type: Number,
      min: [0, "Price must be positive"],
    },
    status: {
      type: String,
      enum: Object.values(QuoteStatus),
      default: QuoteStatus.PENDING,
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: [1000, "Response cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
QuoteSchema.index({ status: 1 });
QuoteSchema.index({ email: 1 });
QuoteSchema.index({ createdAt: -1 });

const Quote: Model<IQuote> =
  mongoose.models.Quote || mongoose.model<IQuote>("Quote", QuoteSchema);

export default Quote;
