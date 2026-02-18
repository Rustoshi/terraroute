"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  DollarSign, 
  CreditCard, 
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import type { TrackingData } from "./types";

interface FreightDetailsPanelProps {
  data: TrackingData;
}

const paymentStatusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  PAID: { label: "Paid", color: "text-green-700", bgColor: "bg-green-100", icon: CheckCircle },
  UNPAID: { label: "Unpaid", color: "text-red-700", bgColor: "bg-red-100", icon: AlertCircle },
  PENDING: { label: "Pending", color: "text-amber-700", bgColor: "bg-amber-100", icon: Clock },
  COD: { label: "Cash on Delivery", color: "text-orange-700", bgColor: "bg-orange-100", icon: DollarSign },
  PARTIAL: { label: "Partially Paid", color: "text-yellow-700", bgColor: "bg-yellow-100", icon: Clock },
};

export function FreightDetailsPanel({ data }: FreightDetailsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const freight = data.freight;
  const paymentStatus = paymentStatusConfig[data.paymentStatus || "UNPAID"] || paymentStatusConfig.UNPAID;
  const PaymentIcon = paymentStatus.icon;

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  // If no freight data, show minimal info
  if (!freight) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">Freight & Payment</h3>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Payment Status</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${paymentStatus.bgColor} ${paymentStatus.color}`}>
              <PaymentIcon className="h-4 w-4" />
              {paymentStatus.label}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">Freight & Payment</h3>
            <p className="text-sm text-gray-500">
              Total: {formatCurrency(freight.total, freight.currency)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${paymentStatus.bgColor} ${paymentStatus.color}`}>
            <PaymentIcon className="h-4 w-4" />
            {paymentStatus.label}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </motion.div>
        </div>
      </button>

      {/* Content - Collapsible */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-gray-100">
              {/* Charge Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Base Freight Charge</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(freight.baseCharge, freight.currency)}
                  </span>
                </div>
                
                {freight.fuelSurcharge !== undefined && freight.fuelSurcharge > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Fuel Surcharge</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(freight.fuelSurcharge, freight.currency)}
                    </span>
                  </div>
                )}
                
                {freight.insurance !== undefined && freight.insurance > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Insurance</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(freight.insurance, freight.currency)}
                    </span>
                  </div>
                )}
                
                {freight.tax !== undefined && freight.tax > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(freight.tax, freight.currency)}
                    </span>
                  </div>
                )}
                
                {freight.discount !== undefined && freight.discount > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(freight.discount, freight.currency)}
                    </span>
                  </div>
                )}
                
                {freight.customsDuty !== undefined && freight.customsDuty > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Customs Duty</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(freight.customsDuty, freight.currency)}
                    </span>
                  </div>
                )}
                
                {freight.handlingFee !== undefined && freight.handlingFee > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Handling Fee</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(freight.handlingFee, freight.currency)}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between py-3 border-t border-gray-200 mt-2">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(freight.total, freight.currency)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              {data.paymentMethod && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment Method: {data.paymentMethod}</span>
                  </div>
                </div>
              )}

              {/* Carrier Info */}
              {data.carrier?.name && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>Carrier: {data.carrier.name}</span>
                    {data.carrier.trackingCode && (
                      <span className="text-gray-400">({data.carrier.trackingCode})</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
