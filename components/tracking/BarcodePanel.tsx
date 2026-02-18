"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Barcode } from "lucide-react";
import Image from "next/image";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Bayanchor Logistics";

interface BarcodePanelProps {
  trackingCode: string;
}

export function BarcodePanel({ trackingCode }: BarcodePanelProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const generateBarcode = async () => {
      try {
        const JsBarcode = (await import("jsbarcode")).default;
        
        JsBarcode(svgRef.current, trackingCode, {
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
  }, [trackingCode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <Barcode className="h-5 w-5 text-gray-600" />
        <h3 className="font-bold text-gray-900">Shipment Barcode</h3>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-6">
          {/* Company Logo */}
          <div className="shrink-0">
            <Image
              src="/logo.PNG"
              alt={COMPANY_NAME}
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          
          {/* Barcode */}
          <div className="flex-1">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <svg ref={svgRef} className="w-full" />
            </div>
            <p className="font-mono text-sm font-bold text-gray-900 tracking-widest mt-2 text-center">
              {trackingCode}
            </p>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-3 text-center">
          Scan barcode to track shipment
        </p>
      </div>
    </motion.div>
  );
}
