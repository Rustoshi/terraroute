"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User, Package, Truck, Box, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import type { TrackingData } from "./types";

const DEFAULT_CARRIER_REF = "BAY-19CD81";

interface ShipmentDetailsProps {
  data: TrackingData;
}

export function ShipmentDetails({ data }: ShipmentDetailsProps) {
  const [isOpen, setIsOpen] = useState(true); // Open by default
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 sm:px-6 sm:py-5 flex items-center gap-2 sm:gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
        </div>
        <div className="text-left flex-1">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Shipment Details</h3>
          <p className="text-xs sm:text-sm text-gray-500">Sender, receiver & package info</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </motion.div>
      </button>

      {/* Content - Collapsible */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-6 pt-4">
              {/* Sender & Receiver */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Sender */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <User className="h-4 w-4" />
                    Sender
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">
                    {data.sender.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {data.sender.address}
                  </p>
                  {data.sender.phone && (
                    <p className="text-sm text-gray-500">{data.sender.phone}</p>
                  )}
                  {data.sender.email && (
                    <p className="text-sm text-gray-500">{data.sender.email}</p>
                  )}
                </div>

                {/* Receiver */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <User className="h-4 w-4" />
                    Receiver
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">
                    {data.receiver.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {data.receiver.address}
                  </p>
                  {data.receiver.phone && (
                    <p className="text-sm text-gray-500">{data.receiver.phone}</p>
                  )}
                  {data.receiver.email && (
                    <p className="text-sm text-gray-500">{data.receiver.email}</p>
                  )}
                </div>
              </div>

              {/* Package Details */}
              <div className="p-4 bg-blue-50 rounded-xl mb-6">
                <div className="flex items-center gap-2 text-blue-700 text-sm mb-3">
                  <Box className="h-4 w-4" />
                  Package Details
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Weight</p>
                    <p className="font-semibold text-gray-900">{data.package.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Length</p>
                    <p className="font-semibold text-gray-900">
                      {data.package.dimensions ? `${data.package.dimensions.length} ${data.package.dimensions.unit}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Width</p>
                    <p className="font-semibold text-gray-900">
                      {data.package.dimensions ? `${data.package.dimensions.width} ${data.package.dimensions.unit}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Height</p>
                    <p className="font-semibold text-gray-900">
                      {data.package.dimensions ? `${data.package.dimensions.height} ${data.package.dimensions.unit}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Quantity</p>
                    <p className="font-semibold text-gray-900">{data.package.quantity || 1}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Declared Value</p>
                    <p className="font-semibold text-gray-900">
                      {data.package.declaredValue
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: data.package.declaredValue.currency,
                          }).format(data.package.declaredValue.amount)
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-100">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700">{data.package.description || "No description provided"}</p>
                </div>
              </div>

              {/* Package Images */}
              {data.packageImages && data.packageImages.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl mb-6">
                  <div className="flex items-center gap-2 text-amber-700 text-sm mb-3">
                    <ImageIcon className="h-4 w-4" />
                    Package Images ({data.packageImages.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                    {data.packageImages.map((image, index) => (
                      <button
                        key={image.publicId}
                        onClick={() => setSelectedImage(image.url)}
                        className="relative aspect-square rounded-lg overflow-hidden bg-white border border-amber-200 hover:border-amber-400 transition-colors group focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                      >
                        <Image
                          src={image.url}
                          alt={`Package image ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 mt-2">Tap an image to view full size</p>
                </div>
              )}

              {/* Carrier Info */}
              <div className="p-4 bg-purple-50 rounded-xl mb-6">
                <div className="flex items-center gap-2 text-purple-700 text-sm mb-3">
                  <Truck className="h-4 w-4" />
                  Carrier Information
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Carrier</p>
                    <p className="font-semibold text-gray-900">{data.carrier?.name || "Bayanchor Logistics"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Reference No.</p>
                    <p className="font-semibold text-gray-900 font-mono">{data.carrier?.trackingCode || DEFAULT_CARRIER_REF}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Mode</p>
                    <p className="font-semibold text-gray-900 capitalize">{(data.carrier?.mode || data.shipmentMode || "Road").toLowerCase()}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Created</p>
                    <p className="font-medium text-gray-900">
                      {new Date(data.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {new Date(data.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Service Type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {data.serviceType.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Shipment Mode</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {(data.shipmentMode || "Road").toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/50 rounded-full transition-colors z-10"
              aria-label="Close image"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full max-w-5xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Package image full view"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                priority
                unoptimized={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
