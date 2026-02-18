"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

interface TrackingInputProps {
  variant?: "hero" | "compact";
  className?: string;
}

export function TrackingInput({ variant = "hero", className = "" }: TrackingInputProps) {
  const [trackingCode, setTrackingCode] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(`/track?code=${encodeURIComponent(trackingCode.trim())}`);
    }
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`relative ${className}`}>
        <input
          type="text"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          placeholder="Enter tracking number"
          className="w-full h-12 pl-12 pr-32 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition-colors"
        >
          Track
        </button>
      </form>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <div
        className={`relative flex flex-col sm:flex-row gap-3 sm:gap-0 p-2 sm:p-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl transition-all duration-300 ${
          isFocused ? "ring-2 ring-orange-500 shadow-orange-500/20" : ""
        }`}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter your tracking number"
            className="w-full h-14 sm:h-16 pl-14 pr-4 bg-transparent text-gray-900 text-lg placeholder:text-gray-500 focus:outline-none"
          />
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="h-14 sm:h-auto px-8 sm:px-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-semibold rounded-xl sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          Track Shipment
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
      <p className="mt-4 text-white/70 text-sm text-center sm:text-left">
        Enter your tracking number to get real-time updates on your shipment
      </p>
    </motion.form>
  );
}
