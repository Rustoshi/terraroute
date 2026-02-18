"use client";

import { motion } from "framer-motion";
import { FileText, Printer, Download, ExternalLink } from "lucide-react";
import type { TrackingData } from "./types";

interface DocumentsPanelProps {
  data: TrackingData;
}

export function DocumentsPanel({ data }: DocumentsPanelProps) {
  const handlePrintInvoice = () => {
    window.open(`/track/invoice?code=${data.trackingCode}`, "_blank");
  };

  const handlePrintWaybill = () => {
    window.open(`/track/waybill?code=${data.trackingCode}`, "_blank");
  };

  const handleDownloadPDF = () => {
    // In production, this would trigger a PDF download from the API
    window.open(`/api/documents/invoice?code=${data.trackingCode}&format=pdf`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <FileText className="h-5 w-5 text-gray-600" />
        <h3 className="font-bold text-gray-900">Documents</h3>
      </div>
      
      <div className="p-4 space-y-2">
        {/* Invoice */}
        <button
          onClick={handlePrintInvoice}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Commercial Invoice</p>
              <p className="text-xs text-gray-500">Print or save invoice</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
          </div>
        </button>

        {/* Waybill */}
        <button
          onClick={handlePrintWaybill}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Waybill / Consignment Note</p>
              <p className="text-xs text-gray-500">Shipping document</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
          </div>
        </button>

        {/* Download PDF */}
        <button
          onClick={handleDownloadPDF}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Download PDF</p>
              <p className="text-xs text-gray-500">Save all documents</p>
            </div>
          </div>
          <Download className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>
    </motion.div>
  );
}
