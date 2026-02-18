"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Printer } from "lucide-react";
import Image from "next/image";
import type { TrackingData } from "@/components/tracking/types";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Bayanchor Logistics";

function InvoiceContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/tracking?code=${encodeURIComponent(code)}`);
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          setError(true);
        } else {
          setData(result.data);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Image src="/logo.PNG" alt={COMPANY_NAME} width={80} height={80} className="object-contain" />
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-xl font-semibold text-black mb-2">Invoice Not Found</p>
          <p className="text-gray-700">Unable to load invoice for tracking code: {code}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Button - Hidden on print */}
      <div className="fixed top-4 right-4 print:hidden z-50">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Printer className="h-4 w-4" />
          Print Invoice
        </button>
      </div>

      {/* Invoice */}
      <div className="max-w-3xl mx-auto p-8 print:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-black">
          <div className="flex items-center gap-4">
            <Image src="/logo.PNG" alt={COMPANY_NAME} width={60} height={60} className="object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-black">{COMPANY_NAME}</h1>
              <p className="text-gray-700 text-sm">Global Logistics Solutions</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-black">INVOICE</p>
            <p className="text-gray-700 text-sm mt-1">#{data.trackingCode}</p>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between mb-8">
          <div>
            <p className="text-sm text-gray-700 mb-1">Issue Date</p>
            <p className="font-semibold text-black">{formatDate(data.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-700 mb-1">Payment Status</p>
            <span className={`inline-flex px-3 py-1 rounded text-sm font-bold ${
              data.paymentStatus === "PAID" 
                ? "bg-green-200 text-green-900" 
                : "bg-yellow-200 text-yellow-900"
            }`}>
              {data.paymentStatus || "UNPAID"}
            </span>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-gray-300">
          <div>
            <p className="text-sm text-gray-700 mb-2 uppercase tracking-wide font-semibold">From (Sender)</p>
            <p className="font-bold text-black">{data.sender.name}</p>
            <p className="text-gray-800 text-sm mt-1">{data.sender.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-700 mb-2 uppercase tracking-wide font-semibold">To (Receiver)</p>
            <p className="font-bold text-black">{data.receiver.name}</p>
            <p className="text-gray-800 text-sm mt-1">{data.receiver.address}</p>
          </div>
        </div>

        {/* Classification */}
        <div className="flex flex-wrap gap-2 mb-8">
          {data.consignmentType && (
            <span className="px-3 py-1 border border-gray-400 text-black rounded text-sm font-medium">
              {data.consignmentType}
            </span>
          )}
          {data.shipmentType && (
            <span className="px-3 py-1 border border-gray-400 text-black rounded text-sm font-medium">
              {data.shipmentType}
            </span>
          )}
          {data.shipmentMode && (
            <span className="px-3 py-1 border border-gray-400 text-black rounded text-sm font-medium">
              {data.shipmentMode}
            </span>
          )}
          {data.serviceType && (
            <span className="px-3 py-1 border border-gray-400 text-black rounded text-sm font-medium">
              {data.serviceType}
            </span>
          )}
        </div>

        {/* Package Details */}
        <div className="mb-8">
          <h3 className="text-sm text-gray-700 mb-3 uppercase tracking-wide font-semibold">Package Details</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 text-sm font-bold text-black">Description</th>
                <th className="text-right py-2 text-sm font-bold text-black">Weight</th>
                <th className="text-right py-2 text-sm font-bold text-black">Dimensions</th>
                <th className="text-right py-2 text-sm font-bold text-black">Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="py-3 text-black">{data.package.description || "Package"}</td>
                <td className="py-3 text-right text-black">{data.package.weight} kg</td>
                <td className="py-3 text-right text-black">
                  {data.package.dimensions 
                    ? `${data.package.dimensions.length}×${data.package.dimensions.width}×${data.package.dimensions.height} ${data.package.dimensions.unit}`
                    : "—"}
                </td>
                <td className="py-3 text-right text-black">{data.package.quantity || 1}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Carrier Information */}
        <div className="mb-8 p-4 border border-gray-300 rounded">
          <h3 className="text-sm text-gray-700 mb-3 uppercase tracking-wide font-semibold">Carrier Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600">Carrier</p>
              <p className="font-bold text-black">{data.carrier?.name || "Bayanchor Logistics"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Reference No.</p>
              <p className="font-bold text-black font-mono">{data.carrier?.trackingCode || "BAY-19CD81"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Mode</p>
              <p className="font-bold text-black capitalize">{(data.carrier?.mode || data.shipmentMode || "Road").toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="mb-8 p-4 border border-gray-300 rounded">
          <h3 className="text-sm text-gray-700 mb-3 uppercase tracking-wide font-semibold">Route</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Origin</p>
              <p className="font-bold text-black">{data.origin}</p>
            </div>
            <div className="text-2xl text-black font-bold">→</div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Destination</p>
              <p className="font-bold text-black">{data.destination}</p>
            </div>
          </div>
        </div>

        {/* Freight Charges */}
        {data.freight && (
          <div className="mb-8">
            <h3 className="text-sm text-gray-700 mb-3 uppercase tracking-wide font-semibold">Freight Charges</h3>
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-black">Base Freight Charge</td>
                    <td className="py-2 px-4 text-right font-medium text-black">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: data.freight.currency }).format(data.freight.baseCharge)}
                    </td>
                  </tr>
                  {data.freight.fuelSurcharge !== undefined && data.freight.fuelSurcharge > 0 && (
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-black">Fuel Surcharge</td>
                      <td className="py-2 px-4 text-right font-medium text-black">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: data.freight.currency }).format(data.freight.fuelSurcharge)}
                      </td>
                    </tr>
                  )}
                  {data.freight.insurance !== undefined && data.freight.insurance > 0 && (
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-black">Insurance</td>
                      <td className="py-2 px-4 text-right font-medium text-black">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: data.freight.currency }).format(data.freight.insurance)}
                      </td>
                    </tr>
                  )}
                  {data.freight.customsDuty !== undefined && data.freight.customsDuty > 0 && (
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-black">Customs Duty</td>
                      <td className="py-2 px-4 text-right font-medium text-black">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: data.freight.currency }).format(data.freight.customsDuty)}
                      </td>
                    </tr>
                  )}
                  {data.freight.handlingFee !== undefined && data.freight.handlingFee > 0 && (
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-black">Handling Fee</td>
                      <td className="py-2 px-4 text-right font-medium text-black">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: data.freight.currency }).format(data.freight.handlingFee)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-gray-100">
                    <td className="py-3 px-4 font-bold text-black">Total</td>
                    <td className="py-3 px-4 text-right font-bold text-black text-lg">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: data.freight.currency }).format(data.freight.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
              {data.paymentStatus && (
                <div className="px-4 py-2 border-t border-gray-300 flex justify-between">
                  <span className="text-black">Payment Status</span>
                  <span className={`font-bold ${data.paymentStatus === "PAID" ? "text-green-700" : data.paymentStatus === "UNPAID" ? "text-red-700" : "text-amber-700"}`}>
                    {data.paymentStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 border-t border-gray-300 text-center text-sm text-gray-700">
          <p>Thank you for choosing {COMPANY_NAME}</p>
          <p className="mt-1">For support, contact us at support@bayanchorlogistics.com</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          * {
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Image src="/logo.PNG" alt="Loading" width={80} height={80} className="object-contain" />
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <InvoiceContent />
    </Suspense>
  );
}
