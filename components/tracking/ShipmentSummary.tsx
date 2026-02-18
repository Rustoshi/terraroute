"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Package, 
  Truck, 
  Plane, 
  Ship, 
  Train,
  ArrowRight,
  Clock,
  AlertTriangle
} from "lucide-react";
import Image from "next/image";
import { StatusBadge } from "./StatusBadge";
import type { TrackingData } from "./types";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Bayanchor Logistics";

interface ShipmentSummaryProps {
  data: TrackingData;
}

const modeIcons: Record<string, React.ElementType> = {
  AIR: Plane,
  SEA: Ship,
  ROAD: Truck,
  RAIL: Train,
  COURIER: Package,
  MULTIMODAL: Truck,
};

const serviceLabels: Record<string, string> = {
  ECONOMY: "Economy",
  STANDARD: "Standard",
  EXPRESS: "Express",
  PRIORITY: "Priority",
  SAME_DAY: "Same Day",
  NEXT_DAY: "Next Day",
  OVERNIGHT: "Overnight",
};

const shipmentTypeLabels: Record<string, string> = {
  DOMESTIC: "Domestic",
  INTERNATIONAL: "International",
  LOCAL: "Local",
  IMPORT: "Import",
  EXPORT: "Export",
};

const consignmentTypeLabels: Record<string, string> = {
  SHIPMENT: "Shipment",
  CONSIGNMENT: "Consignment",
};

export function ShipmentSummary({ data }: ShipmentSummaryProps) {
  const ModeIcon = modeIcons[data.shipmentMode || "ROAD"] || Truck;
  const serviceLabel = serviceLabels[data.serviceType] || data.serviceType;
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate barcode
  useEffect(() => {
    if (!svgRef.current) return;

    const generateBarcode = async () => {
      try {
        const JsBarcode = (await import("jsbarcode")).default;
        JsBarcode(svgRef.current, data.trackingCode, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: false,
          background: "#ffffff",
          lineColor: "#1e293b",
          margin: 0,
        });
      } catch (err) {
        console.error("Barcode generation error:", err);
      }
    };

    generateBarcode();
  }, [data.trackingCode]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Pending";
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  // Check if ETA is overdue
  const isOverdue = () => {
    if (!data.estimatedDeliveryDate) return false;
    if (data.status === "DELIVERED") return false;

    const [etaYear, etaMonth, etaDay] = data.estimatedDeliveryDate
      .split("-")
      .map(Number);
    const etaUtc = Date.UTC(etaYear, etaMonth - 1, etaDay);

    const now = new Date();
    const todayUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );

    return etaUtc < todayUtc;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Tracking Number</p>
            <h2 className="text-2xl font-bold text-white tracking-wide font-mono">
              {data.trackingCode}
            </h2>
          </div>
          <StatusBadge status={data.status} size="lg" />
        </div>
      </div>

      {/* Classification Badges */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2">
        {data.consignmentType && (
          <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold uppercase tracking-wide">
            {consignmentTypeLabels[data.consignmentType] || data.consignmentType}
          </span>
        )}
        {data.shipmentType && (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold uppercase tracking-wide">
            {shipmentTypeLabels[data.shipmentType] || data.shipmentType}
          </span>
        )}
        {data.shipmentMode && (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
            <ModeIcon className="h-3 w-3" />
            {data.shipmentMode}
          </span>
        )}
        {data.serviceType && (
          <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold uppercase tracking-wide">
            {serviceLabel}
          </span>
        )}
        {isOverdue() && (
          <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Delayed
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Info */}
          <div className="flex-1">
            {/* Barcode Section */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex flex-col items-center">
                {/* Company Logo */}
                <Image
                  src="/logo.PNG"
                  alt={COMPANY_NAME}
                  width={120}
                  height={60}
                  className="object-contain mb-4"
                />
                
                {/* Barcode */}
                <div className="w-full max-w-xs">
                  <svg ref={svgRef} className="w-full" />
                </div>
                
                {/* Tracking Code */}
                <p className="font-mono text-sm font-bold text-gray-900 tracking-widest mt-2">
                  {data.trackingCode}
                </p>
              </div>
            </div>

            {/* Route */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-6 pb-6 border-b border-gray-100">
              {/* Origin */}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  Origin
                </div>
                <p className="text-lg font-semibold text-gray-900">{data.origin}</p>
                {data.originLocation && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {data.originLocation.city}, {data.originLocation.country}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                  <ModeIcon className="h-5 w-5 text-gray-600" />
                  <ArrowRight className="h-5 w-5 text-orange-500" />
                </div>
              </div>

              {/* Mobile Arrow */}
              <div className="flex md:hidden items-center gap-2 pl-1">
                <div className="w-0.5 h-8 bg-gray-200 ml-1" />
                <ModeIcon className="h-4 w-4 text-gray-400" />
              </div>

              {/* Destination */}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  Destination
                </div>
                <p className="text-lg font-semibold text-gray-900">{data.destination}</p>
                {data.destinationLocation && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {data.destinationLocation.city}, {data.destinationLocation.country}
                  </p>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Current Location */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Current Location
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  {data.currentLocation || "In Transit"}
                </p>
              </div>

              {/* Estimated Delivery */}
              <div className={`p-3 rounded-lg ${isOverdue() ? "bg-red-50" : "bg-gray-50"}`}>
                <div className={`flex items-center gap-2 text-xs mb-1 ${isOverdue() ? "text-red-600" : "text-gray-500"}`}>
                  <Calendar className="h-3.5 w-3.5" />
                  Est. Delivery
                </div>
                <p className={`font-semibold text-sm ${isOverdue() ? "text-red-700" : "text-gray-900"}`}>
                  {formatDate(data.estimatedDeliveryDate)}
                </p>
              </div>

              {/* Weight */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Package className="h-3.5 w-3.5" />
                  Weight
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  {data.package.weight} kg
                </p>
              </div>

              {/* Last Updated */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Clock className="h-3.5 w-3.5" />
                  Last Updated
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  {new Date(data.updatedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
