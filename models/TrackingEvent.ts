import mongoose, { Schema, Model } from "mongoose";
import { ITrackingEvent, ShipmentStatus } from "@/types";

/**
 * TrackingEvent model - records all status changes and movements for a shipment.
 * Provides complete audit trail for shipment lifecycle.
 */

const TrackingEventSchema = new Schema<ITrackingEvent>(
  {
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
      required: [true, "Shipment ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ShipmentStatus),
      required: [true, "Status is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
TrackingEventSchema.index({ shipmentId: 1, createdAt: -1 });
TrackingEventSchema.index({ createdAt: -1 });

// Pre-populate with default description based on status if not provided
TrackingEventSchema.pre("save", function () {
  if (!this.description) {
    const statusDescriptions: Record<ShipmentStatus, string> = {
      // Normal flow
      [ShipmentStatus.CREATED]: "Shipment has been created",
      [ShipmentStatus.PICKUP_SCHEDULED]: "Pickup has been scheduled",
      [ShipmentStatus.PICKED_UP]: "Package has been picked up",
      [ShipmentStatus.RECEIVED_AT_ORIGIN_HUB]: "Package received at origin hub",
      [ShipmentStatus.STORED]: "Package is stored in warehouse",
      [ShipmentStatus.READY_FOR_DISPATCH]: "Package is ready for dispatch",
      [ShipmentStatus.IN_TRANSIT]: "Package is in transit",
      [ShipmentStatus.ARRIVED_AT_DESTINATION_HUB]: "Package has arrived at destination hub",
      [ShipmentStatus.OUT_FOR_DELIVERY]: "Package is out for delivery",
      [ShipmentStatus.DELIVERED]: "Package has been delivered",
      // Exception statuses
      [ShipmentStatus.ON_HOLD]: "Package is on hold",
      [ShipmentStatus.DELIVERY_FAILED]: "Delivery attempt failed",
      [ShipmentStatus.RETURNED_TO_SENDER]: "Package has been returned to sender",
      [ShipmentStatus.CANCELLED]: "Shipment has been cancelled",
      [ShipmentStatus.DAMAGED]: "Package has been reported as damaged",
      [ShipmentStatus.SEIZED]: "Package has been seized by customs or authorities",
    };
    this.description = statusDescriptions[this.status as ShipmentStatus] || "";
  }
});

const TrackingEvent: Model<ITrackingEvent> =
  mongoose.models.TrackingEvent ||
  mongoose.model<ITrackingEvent>("TrackingEvent", TrackingEventSchema);

export default TrackingEvent;
