"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ShipmentStatus, QuoteStatus, ServiceType, ShipmentType, ShipmentMode, ConsignmentType } from "@/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "secondary";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-gray-100 text-gray-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      danger: "bg-red-100 text-red-800",
      info: "bg-blue-100 text-blue-800",
      secondary: "bg-purple-100 text-purple-800",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

// Status-specific badge component
interface StatusBadgeProps {
  status: ShipmentStatus;
}

const statusConfig: Record<
  ShipmentStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  // Normal flow
  CREATED: { label: "Created", variant: "default" },
  PICKUP_SCHEDULED: { label: "Pickup Scheduled", variant: "info" },
  PICKED_UP: { label: "Picked Up", variant: "info" },
  RECEIVED_AT_ORIGIN_HUB: { label: "Received at Origin", variant: "info" },
  STORED: { label: "Stored", variant: "secondary" },
  READY_FOR_DISPATCH: { label: "Ready for Dispatch", variant: "info" },
  IN_TRANSIT: { label: "In Transit", variant: "warning" },
  ARRIVED_AT_DESTINATION_HUB: { label: "Arrived at Hub", variant: "info" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", variant: "info" },
  DELIVERED: { label: "Delivered", variant: "success" },
  // Exception statuses
  ON_HOLD: { label: "On Hold", variant: "warning" },
  DELIVERY_FAILED: { label: "Delivery Failed", variant: "danger" },
  RETURNED_TO_SENDER: { label: "Returned to Sender", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
  DAMAGED: { label: "Damaged", variant: "danger" },
  SEIZED: { label: "Seized", variant: "danger" },
};

function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "default" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Quote status badge
interface QuoteStatusBadgeProps {
  status: QuoteStatus;
}

const quoteStatusConfig: Record<
  QuoteStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  RESPONDED: { label: "Responded", variant: "success" },
  CONVERTED: { label: "Converted", variant: "info" },
};

function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  const config = quoteStatusConfig[status] || { label: status, variant: "default" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Service type badge
interface ServiceTypeBadgeProps {
  type: ServiceType;
}

const serviceTypeConfig: Record<
  ServiceType,
  { label: string; variant: BadgeProps["variant"] }
> = {
  ECONOMY: { label: "Economy", variant: "default" },
  STANDARD: { label: "Standard", variant: "default" },
  EXPRESS: { label: "Express", variant: "info" },
  PRIORITY: { label: "Priority", variant: "warning" },
  SAME_DAY: { label: "Same Day", variant: "danger" },
  NEXT_DAY: { label: "Next Day", variant: "warning" },
  OVERNIGHT: { label: "Overnight", variant: "warning" },
};

function ServiceTypeBadge({ type }: ServiceTypeBadgeProps) {
  const config = serviceTypeConfig[type] || { label: type, variant: "default" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Shipment type badge (Scope)
interface ShipmentTypeBadgeProps {
  type: ShipmentType;
}

const shipmentTypeConfig: Record<
  ShipmentType,
  { label: string; variant: BadgeProps["variant"] }
> = {
  DOMESTIC: { label: "Domestic", variant: "default" },
  INTERNATIONAL: { label: "International", variant: "info" },
  LOCAL: { label: "Local", variant: "default" },
  IMPORT: { label: "Import", variant: "secondary" },
  EXPORT: { label: "Export", variant: "secondary" },
};

function ShipmentTypeBadge({ type }: ShipmentTypeBadgeProps) {
  const config = shipmentTypeConfig[type] || { label: type, variant: "default" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Shipment mode badge (Transport Method)
interface ShipmentModeBadgeProps {
  mode: ShipmentMode;
}

const shipmentModeConfig: Record<
  ShipmentMode,
  { label: string; variant: BadgeProps["variant"] }
> = {
  AIR: { label: "Air", variant: "info" },
  SEA: { label: "Sea", variant: "info" },
  ROAD: { label: "Road", variant: "default" },
  RAIL: { label: "Rail", variant: "secondary" },
  COURIER: { label: "Courier", variant: "warning" },
  MULTIMODAL: { label: "Multimodal", variant: "secondary" },
};

function ShipmentModeBadge({ mode }: ShipmentModeBadgeProps) {
  const config = shipmentModeConfig[mode] || { label: mode, variant: "default" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Consignment type badge (Business Classification)
interface ConsignmentTypeBadgeProps {
  type: ConsignmentType;
}

const consignmentTypeConfig: Record<
  ConsignmentType,
  { label: string; variant: BadgeProps["variant"] }
> = {
  SHIPMENT: { label: "Shipment", variant: "info" },
  CONSIGNMENT: { label: "Consignment", variant: "secondary" },
};

function ConsignmentTypeBadge({ type }: ConsignmentTypeBadgeProps) {
  const config = consignmentTypeConfig[type] || { label: type, variant: "default" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { Badge, StatusBadge, QuoteStatusBadge, ServiceTypeBadge, ShipmentTypeBadge, ShipmentModeBadge, ConsignmentTypeBadge };
