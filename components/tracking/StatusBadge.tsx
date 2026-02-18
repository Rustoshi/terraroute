"use client";

import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  MapPin,
  Warehouse,
  Plane
} from "lucide-react";

// Status configuration with colors and icons
const statusConfig: Record<string, { 
  label: string; 
  color: string; 
  bgColor: string; 
  icon: React.ElementType;
  description: string;
}> = {
  CREATED: { 
    label: "Created", 
    color: "text-blue-700", 
    bgColor: "bg-blue-100", 
    icon: Package,
    description: "Shipment has been created"
  },
  PICKUP_SCHEDULED: { 
    label: "Pickup Scheduled", 
    color: "text-blue-700", 
    bgColor: "bg-blue-100", 
    icon: Clock,
    description: "Pickup has been scheduled"
  },
  PICKED_UP: { 
    label: "Picked Up", 
    color: "text-indigo-700", 
    bgColor: "bg-indigo-100", 
    icon: Truck,
    description: "Package has been picked up"
  },
  RECEIVED_AT_ORIGIN_HUB: { 
    label: "At Origin Hub", 
    color: "text-purple-700", 
    bgColor: "bg-purple-100", 
    icon: Warehouse,
    description: "Received at origin facility"
  },
  STORED: { 
    label: "In Storage", 
    color: "text-gray-700", 
    bgColor: "bg-gray-100", 
    icon: Warehouse,
    description: "Package is in storage"
  },
  READY_FOR_DISPATCH: { 
    label: "Ready for Dispatch", 
    color: "text-cyan-700", 
    bgColor: "bg-cyan-100", 
    icon: Package,
    description: "Ready to be dispatched"
  },
  IN_TRANSIT: { 
    label: "In Transit", 
    color: "text-orange-700", 
    bgColor: "bg-orange-100", 
    icon: Plane,
    description: "Package is on the way"
  },
  ARRIVED_AT_DESTINATION_HUB: { 
    label: "At Destination Hub", 
    color: "text-teal-700", 
    bgColor: "bg-teal-100", 
    icon: Warehouse,
    description: "Arrived at destination facility"
  },
  OUT_FOR_DELIVERY: { 
    label: "Out for Delivery", 
    color: "text-amber-700", 
    bgColor: "bg-amber-100", 
    icon: Truck,
    description: "Package is out for delivery"
  },
  DELIVERED: { 
    label: "Delivered", 
    color: "text-green-700", 
    bgColor: "bg-green-100", 
    icon: CheckCircle,
    description: "Package has been delivered"
  },
  ON_HOLD: { 
    label: "On Hold", 
    color: "text-yellow-700", 
    bgColor: "bg-yellow-100", 
    icon: AlertTriangle,
    description: "Shipment is on hold"
  },
  DELIVERY_FAILED: { 
    label: "Delivery Failed", 
    color: "text-red-700", 
    bgColor: "bg-red-100", 
    icon: XCircle,
    description: "Delivery attempt failed"
  },
  RETURNED_TO_SENDER: { 
    label: "Returned", 
    color: "text-gray-700", 
    bgColor: "bg-gray-100", 
    icon: Package,
    description: "Returned to sender"
  },
  CANCELLED: { 
    label: "Cancelled", 
    color: "text-red-700", 
    bgColor: "bg-red-100", 
    icon: XCircle,
    description: "Shipment cancelled"
  },
  DAMAGED: { 
    label: "Damaged", 
    color: "text-red-700", 
    bgColor: "bg-red-100", 
    icon: AlertTriangle,
    description: "Package damaged"
  },
};

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function StatusBadge({ status, size = "md", showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: Package,
    description: status
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${config.bgColor} ${config.color} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}

export function getStatusInfo(status: string) {
  return statusConfig[status] || {
    label: status,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: Package,
    description: status
  };
}
