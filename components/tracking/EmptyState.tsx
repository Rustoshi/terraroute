"use client";

import { motion } from "framer-motion";
import { Package, Search } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto text-center py-16"
    >
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
        <Search className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        Track Your Shipment
      </h3>
      <p className="text-gray-600 mb-8">
        Enter your tracking number above to get real-time updates on your package 
        location and delivery status.
      </p>
      <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-500" />
          <span>Real-time updates</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-500" />
          <span>Detailed timeline</span>
        </div>
      </div>
    </motion.div>
  );
}
