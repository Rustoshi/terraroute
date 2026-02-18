"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  ArrowRight,
  Calendar,
  MapPin
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { TrackingData } from "./types";

interface ShipmentOverviewBarProps {
  data: TrackingData;
  isVisible: boolean;
}

export function ShipmentOverviewBar({ data, isVisible }: ShipmentOverviewBarProps) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePrint = () => {
    window.open(`/track/invoice?code=${data.trackingCode}`, "_blank");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/track?code=${data.trackingCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Track Shipment ${data.trackingCode}`,
          text: `Track your shipment from ${data.origin} to ${data.destination}`,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy link
      await navigator.clipboard.writeText(url);
      setShareOpen(true);
      setTimeout(() => setShareOpen(false), 2000);
    }
  };

  const formatETA = (dateString?: string) => {
    if (!dateString) return "Pending";
    const [year, month, day] = dateString.split("-").map(Number);
    const etaUtc = Date.UTC(year, month - 1, day);

    const now = new Date();
    const todayUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );

    const diffDays = Math.round((etaUtc - todayUtc) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";

    return new Date(etaUtc).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 lg:h-16 gap-4">
              {/* Left: Tracking Code & Status */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Tracking</p>
                  <p className="font-bold text-gray-900 text-sm lg:text-base truncate">
                    {data.trackingCode}
                  </p>
                </div>
                <StatusBadge status={data.status} size="sm" />
              </div>

              {/* Center: Route & ETA (hidden on mobile) */}
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600 truncate max-w-[120px]">{data.origin}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600 truncate max-w-[120px]">{data.destination}</span>
                </div>
                <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-900 font-medium">
                    ETA: {formatETA(data.estimatedDeliveryDate)}
                  </span>
                </div>
              </div>

              {/* Right: Quick Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={handleCopy}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  title="Copy tracking code"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600 group-hover:text-gray-900" />
                  )}
                  {copied && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </button>
                
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  title="Print invoice"
                >
                  <Printer className="h-4 w-4 text-gray-600 group-hover:text-gray-900" />
                </button>
                
                <button
                  onClick={handleShare}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  title="Share tracking link"
                >
                  <Share2 className="h-4 w-4 text-gray-600 group-hover:text-gray-900" />
                  {shareOpen && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap">
                      Link copied!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
