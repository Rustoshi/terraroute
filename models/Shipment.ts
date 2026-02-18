import mongoose, { Schema, Model } from "mongoose";
import { IShipment, ServiceType, ShipmentStatus, ShipmentType, ShipmentMode, ConsignmentType, Currency, PaymentMethod, PaymentStatus } from "@/types";

/**
 * Shipment model - core entity for the logistics platform.
 * Contains all shipment details, sender/receiver info, and tracking data.
 */

// Embedded schema for coordinates
const CoordinatesSchema = new Schema(
  {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
  },
  { _id: false }
);

// Embedded schema for contact information
const ContactInfoSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    coordinates: {
      type: CoordinatesSchema,
      required: false,
    },
  },
  { _id: false }
);

// Embedded schema for location info (city, state, country)
const LocationInfoSchema = new Schema(
  {
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    coordinates: {
      type: CoordinatesSchema,
      required: false,
    },
  },
  { _id: false }
);

// Embedded schema for package dimensions
const DimensionsSchema = new Schema(
  {
    length: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Embedded schema for package details
const PackageDetailsSchema = new Schema(
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
      required: false,
      min: [0, "Value must be positive"],
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      default: Currency.USD,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
  },
  { _id: false }
);

// Embedded schema for package images (up to 5)
const PackageImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ShipmentSchema = new Schema<IShipment>(
  {
    trackingCode: {
      type: String,
      required: [true, "Tracking code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Classification fields
    consignmentType: {
      type: String,
      enum: Object.values(ConsignmentType),
      default: ConsignmentType.SHIPMENT,
    },
    shipmentType: {
      type: String,
      enum: Object.values(ShipmentType),
      default: ShipmentType.DOMESTIC,
    },
    shipmentMode: {
      type: String,
      enum: Object.values(ShipmentMode),
      default: ShipmentMode.ROAD,
    },
    serviceType: {
      type: String,
      enum: Object.values(ServiceType),
      default: ServiceType.STANDARD,
    },
    // Parties
    sender: {
      type: ContactInfoSchema,
      required: [true, "Sender information is required"],
    },
    receiver: {
      type: ContactInfoSchema,
      required: [true, "Receiver information is required"],
    },
    package: {
      type: PackageDetailsSchema,
      required: [true, "Package details are required"],
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
    originLocation: {
      type: LocationInfoSchema,
      required: false,
    },
    destinationLocation: {
      type: LocationInfoSchema,
      required: false,
    },
    status: {
      type: String,
      enum: Object.values(ShipmentStatus),
      default: ShipmentStatus.CREATED,
    },
    currentLocation: {
      type: String,
      trim: true,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    trackingEvents: [
      {
        type: Schema.Types.ObjectId,
        ref: "TrackingEvent",
      },
    ],
    packageImages: {
      type: [PackageImageSchema],
      validate: [
        (val: unknown[]) => val.length <= 5,
        "Maximum 5 package images allowed",
      ],
    },
    // Freight & Payment
    freightCharges: {
      type: {
        baseCharge: { type: Number, required: true, min: 0 },
        fuelSurcharge: { type: Number, min: 0 },
        handlingFee: { type: Number, min: 0 },
        insuranceFee: { type: Number, min: 0 },
        customsDuty: { type: Number, min: 0 },
        tax: { type: Number, min: 0 },
        discount: { type: Number, min: 0 },
        total: { type: Number, required: true, min: 0 },
        currency: { type: String, enum: Object.values(Currency), default: Currency.USD },
        isPaid: { type: Boolean, default: false },
        paymentMethod: { type: String, enum: Object.values(PaymentMethod) },
        paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
        paidAt: { type: Date },
        paymentReference: { type: String, trim: true },
      },
      required: false,
      _id: false,
    },
    carrier: {
      type: Schema.Types.ObjectId,
      ref: "Carrier",
    },
    carrierTrackingCode: {
      type: String,
      trim: true,
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

// Indexes for optimized queries
// Note: trackingCode index is created automatically by unique: true
ShipmentSchema.index({ status: 1 });
ShipmentSchema.index({ createdAt: -1 });
ShipmentSchema.index({ "sender.email": 1 });
ShipmentSchema.index({ "receiver.email": 1 });

// Virtual for full tracking URL
ShipmentSchema.virtual("trackingUrl").get(function () {
  return `/tracking?code=${this.trackingCode}`;
});

// Enable virtuals in JSON output
ShipmentSchema.set("toJSON", { virtuals: true });
ShipmentSchema.set("toObject", { virtuals: true });

const Shipment: Model<IShipment> =
  mongoose.models.Shipment || mongoose.model<IShipment>("Shipment", ShipmentSchema);

export default Shipment;
