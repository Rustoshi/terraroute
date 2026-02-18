"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Loader2 } from "lucide-react";

interface TrackingInputProps {
  onTrack: (code: string) => void;
  isLoading?: boolean;
  initialValue?: string;
  variant?: "hero" | "compact";
}

export function TrackingInput({ 
  onTrack, 
  isLoading, 
  initialValue = "",
  variant = "hero" 
}: TrackingInputProps) {
  const [trackingCode, setTrackingCode] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setTrackingCode(initialValue);
    }
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim() && !isLoading) {
      onTrack(trackingCode.trim().toUpperCase());
    }
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
          placeholder="Enter tracking number"
          disabled={isLoading}
          className="w-full h-12 pl-12 pr-28 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <button
          type="submit"
          disabled={isLoading || !trackingCode.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Track"
          )}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`relative flex flex-col sm:flex-row gap-3 sm:gap-0 p-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl transition-all duration-300 ${
          isFocused ? "ring-2 ring-orange-500 shadow-orange-500/20" : ""
        }`}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter your tracking number"
            disabled={isLoading}
            className="w-full h-14 sm:h-16 pl-14 pr-4 bg-transparent text-gray-900 text-lg placeholder:text-gray-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        <motion.button
          type="submit"
          disabled={isLoading || !trackingCode.trim()}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="h-14 sm:h-auto px-8 sm:px-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Tracking...
            </>
          ) : (
            <>
              Track Shipment
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </motion.button>
      </div>
      <p className="mt-4 text-white/60 text-sm text-center">
        Example: SC-2024-XXXXXX
      </p>
    </form>
  );
}
