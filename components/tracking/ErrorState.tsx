"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Headphones } from "lucide-react";
import Link from "next/link";

interface ErrorStateProps {
  type?: "not_found" | "error";
  onRetry?: () => void;
}

export function ErrorState({ type = "not_found", onRetry }: ErrorStateProps) {
  const isNotFound = type === "not_found";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto text-center py-16"
    >
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
        isNotFound ? "bg-yellow-100" : "bg-red-100"
      }`}>
        <AlertCircle className={`h-12 w-12 ${
          isNotFound ? "text-yellow-600" : "text-red-600"
        }`} />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {isNotFound ? "Shipment Not Found" : "Something Went Wrong"}
      </h3>
      
      <p className="text-gray-600 mb-8">
        {isNotFound 
          ? "We couldn't find a shipment with that tracking number. Please check the number and try again."
          : "We're having trouble retrieving your tracking information. Please try again in a moment."
        }
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
        )}
        
        <Link href="/contact">
          <button className="inline-flex items-center gap-2 h-12 px-6 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors">
            <Headphones className="h-5 w-5" />
            Contact Support
          </button>
        </Link>
      </div>

      {isNotFound && (
        <p className="mt-8 text-sm text-gray-500">
          Tracking numbers usually look like: <span className="font-mono font-medium">SC-2024-XXXXXX</span>
        </p>
      )}
    </motion.div>
  );
}
