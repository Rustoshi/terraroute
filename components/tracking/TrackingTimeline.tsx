"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, RefreshCw } from "lucide-react";
import { getStatusInfo } from "./StatusBadge";
import type { TrackingEvent } from "./types";

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
  estimatedDeliveryDate?: string;
}

export function TrackingTimeline({ events, currentStatus, estimatedDeliveryDate }: TrackingTimelineProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      full: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  };

  // Sort events by timestamp (newest first for display)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Check if delayed
  const isDelayed = () => {
    if (!estimatedDeliveryDate) return false;
    if (currentStatus === "DELIVERED") return false;

    const [etaYear, etaMonth, etaDay] = estimatedDeliveryDate
      .split("-")
      .map(Number);
    const etaUtc = Date.UTC(etaYear, etaMonth - 1, etaDay);

    const now = new Date();
    const todayUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );

    return etaUtc < todayUtc;
  };

  // Get last updated time
  const lastUpdated = sortedEvents.length > 0 
    ? new Date(sortedEvents[0].timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Tracking History</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {events.length} update{events.length !== 1 ? "s" : ""}
              {isDelayed() && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                  DELAYED
                </span>
              )}
            </p>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <RefreshCw className="h-3 w-3" />
              <span>Updated {lastUpdated}</span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="relative">
          {sortedEvents.map((event, index) => {
            const statusInfo = getStatusInfo(event.status);
            const Icon = statusInfo.icon;
            const isLatest = index === 0;
            const isLast = index === sortedEvents.length - 1;
            const { date, time } = formatDate(event.timestamp);

            return (
              <motion.div
                key={`${event.timestamp}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.08, 0.5) }}
                className={`relative flex gap-4 ${!isLast ? "pb-6" : ""}`}
              >
                {/* Timeline Line */}
                {!isLast && (
                  <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200" />
                )}

                {/* Icon - Larger */}
                <div
                  className={`relative z-10 shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    isLatest
                      ? "bg-orange-500 text-white ring-4 ring-orange-100"
                      : `${statusInfo.bgColor} ${statusInfo.color}`
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  {isLatest && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h4
                        className={`font-bold text-base ${
                          isLatest ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {statusInfo.label}
                      </h4>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                      {event.location && (
                        <div className="inline-flex items-center gap-1.5 text-sm text-gray-600 mt-2 px-2 py-1 bg-gray-50 rounded">
                          <MapPin className="h-3.5 w-3.5 text-gray-500" />
                          <span className="font-medium">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Date/Time - More prominent */}
                    <div className="sm:text-right whitespace-nowrap">
                      <p className="font-semibold text-gray-900 text-sm">{date}</p>
                      <p className="text-sm text-gray-500">{time}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900">No tracking updates yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Updates will appear here as your shipment progresses
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
