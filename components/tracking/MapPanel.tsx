"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Navigation, Loader2 } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import type { TrackingData } from "./types";

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapPanelProps {
  data: TrackingData;
}

// Geocode an address using the API
async function geocodeAddress(query: string): Promise<Coordinates | null> {
  try {
    const res = await fetch(`/api/mapbox/geocode?q=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const json = await res.json();
    // API returns { success: true, data: { coordinates: { lat, lng } } }
    if (json.success && json.data?.coordinates) {
      return json.data.coordinates;
    }
    return null;
  } catch {
    return null;
  }
}

export function MapPanel({ data }: MapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(true);
  const [originCoords, setOriginCoords] = useState<Coordinates | null>(null);
  const [destCoords, setDestCoords] = useState<Coordinates | null>(null);
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);

  // Geocode addresses on mount
  useEffect(() => {
    let isMounted = true;

    const geocodeAddresses = async () => {
      setIsGeocoding(true);
      setMapError(null);

      // Use existing coordinates or geocode from address
      let origin: Coordinates | null = data.originLocation?.coordinates || null;
      let dest: Coordinates | null = data.destinationLocation?.coordinates || null;
      let current: Coordinates | null = data.currentLocationCoords || null;

      // Geocode origin if missing
      if (!origin && data.origin) {
        origin = await geocodeAddress(data.origin);
      }

      // Geocode destination if missing
      if (!dest && data.destination) {
        dest = await geocodeAddress(data.destination);
      }

      // Geocode current location if missing and status is not delivered
      if (!current && data.currentLocation && data.status !== "DELIVERED") {
        current = await geocodeAddress(data.currentLocation);
      }

      if (isMounted) {
        setOriginCoords(origin);
        setDestCoords(dest);
        setCurrentCoords(current);
        setIsGeocoding(false);
      }
    };

    geocodeAddresses();

    return () => {
      isMounted = false;
    };
  }, [data.origin, data.destination, data.originLocation?.coordinates, data.destinationLocation?.coordinates, data.currentLocation, data.currentLocationCoords, data.status]);

  // Initialize map after geocoding
  useEffect(() => {
    if (isGeocoding || !mapContainer.current || map.current) return;

    if (!originCoords && !destCoords) {
      setMapError("No coordinates available for this shipment");
      return;
    }

    const initMap = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
          setMapError("Map not configured");
          return;
        }

        mapboxgl.accessToken = token;

        // Calculate center
        const center: [number, number] = originCoords && destCoords
          ? [(originCoords.lng + destCoords.lng) / 2, (originCoords.lat + destCoords.lat) / 2]
          : originCoords
            ? [originCoords.lng, originCoords.lat]
            : destCoords
              ? [destCoords.lng, destCoords.lat]
              : [0, 0];

        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/streets-v12",
          center,
          zoom: 3,
          attributionControl: false,
        });

        map.current.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          "top-right"
        );

        map.current.on("load", () => {
          if (!map.current) return;

          const allCoords: [number, number][] = [];

          // Add origin marker
          if (originCoords) {
            const el = document.createElement("div");
            el.innerHTML = `<div style="
              width: 28px; height: 28px;
              background: #3b82f6; border-radius: 50%;
              border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 12px;
            ">O</div>`;
            
            new mapboxgl.Marker({ element: el.firstElementChild as HTMLElement })
              .setLngLat([originCoords.lng, originCoords.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
                  <div style="padding: 8px 12px;">
                    <div style="font-weight: 600; color: #1d4ed8; margin-bottom: 4px;">📍 Origin</div>
                    <div style="font-size: 13px; color: #374151;">${data.origin}</div>
                  </div>
                `)
              )
              .addTo(map.current!);
            allCoords.push([originCoords.lng, originCoords.lat]);
          }

          // Add destination marker
          if (destCoords) {
            const el = document.createElement("div");
            el.innerHTML = `<div style="
              width: 28px; height: 28px;
              background: #22c55e; border-radius: 50%;
              border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 12px;
            ">D</div>`;
            
            new mapboxgl.Marker({ element: el.firstElementChild as HTMLElement })
              .setLngLat([destCoords.lng, destCoords.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
                  <div style="padding: 8px 12px;">
                    <div style="font-weight: 600; color: #15803d; margin-bottom: 4px;">🏁 Destination</div>
                    <div style="font-size: 13px; color: #374151;">${data.destination}</div>
                  </div>
                `)
              )
              .addTo(map.current!);
            allCoords.push([destCoords.lng, destCoords.lat]);
          }

          // Draw route line
          if (originCoords && destCoords) {
            // Generate curved arc points
            const arcPoints: [number, number][] = [];
            const numPoints = 50;
            for (let i = 0; i <= numPoints; i++) {
              const t = i / numPoints;
              const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * t;
              const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * t;
              const distance = Math.abs(destCoords.lng - originCoords.lng);
              const curveHeight = Math.min(distance * 0.15, 15);
              const curve = Math.sin(t * Math.PI) * curveHeight;
              arcPoints.push([lng, lat + curve]);
            }

            map.current.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates: arcPoints },
              },
            });

            map.current.addLayer({
              id: "route-bg",
              type: "line",
              source: "route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#cbd5e1",
                "line-width": 4,
                "line-dasharray": [2, 2],
              },
            });

            map.current.addSource("route-progress", {
              type: "geojson",
              lineMetrics: true,
              data: {
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates: arcPoints },
              },
            });

            map.current.addLayer({
              id: "route-progress",
              type: "line",
              source: "route-progress",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#3b82f6",
                "line-width": 4,
                "line-gradient": [
                  "interpolate",
                  ["linear"],
                  ["line-progress"],
                  0, "#3b82f6",
                  1, "#22c55e"
                ],
              },
            });
          }

          // Add current package location marker (if not delivered)
          if (data.status !== "DELIVERED") {
            let packagePoint: [number, number] | null = null;
            let locationLabel = data.currentLocation || "In Transit";

            // Priority: geocoded currentCoords > calculated position along route
            if (currentCoords) {
              packagePoint = [currentCoords.lng, currentCoords.lat];
            } else if (originCoords && destCoords) {
              // Fallback: Calculate position along the arc based on progress
              const statusProgress: Record<string, number> = {
                CREATED: 0,
                PICKUP_SCHEDULED: 0,
                PICKED_UP: 0.1,
                RECEIVED_AT_ORIGIN_HUB: 0.15,
                STORED: 0.2,
                READY_FOR_DISPATCH: 0.25,
                IN_TRANSIT: 0.5,
                ARRIVED_AT_DESTINATION_HUB: 0.75,
                OUT_FOR_DELIVERY: 0.9,
                ON_HOLD: 0.5,
                DELIVERY_FAILED: 0.9,
                RETURNED_TO_SENDER: 0,
                CANCELLED: 0,
                DAMAGED: 0.5,
              };
              const progress = statusProgress[data.status] ?? 0.3;
              
              const t = progress;
              const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * t;
              const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * t;
              const distance = Math.abs(destCoords.lng - originCoords.lng);
              const curveHeight = Math.min(distance * 0.15, 15);
              const curve = Math.sin(t * Math.PI) * curveHeight;
              packagePoint = [lng, lat + curve];
            }

            if (packagePoint) {
              // Create marker element properly
              const markerEl = document.createElement("div");
              markerEl.style.cssText = `
                width: 36px; height: 36px;
                background: #f59e0b; border-radius: 50%;
                border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                display: flex; align-items: center; justify-content: center;
                font-size: 18px; cursor: pointer;
              `;
              markerEl.innerHTML = "📦";
              
              new mapboxgl.Marker({ element: markerEl })
                .setLngLat(packagePoint)
                .setPopup(
                  new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
                    <div style="padding: 8px 12px;">
                      <div style="font-weight: 600; color: #d97706; margin-bottom: 4px;">📦 Package Location</div>
                      <div style="font-size: 13px; color: #374151;">${locationLabel}</div>
                      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Status: ${data.status.replace(/_/g, " ")}</div>
                    </div>
                  `)
                )
                .addTo(map.current!);
              
              allCoords.push(packagePoint);
            }
          }

          // Center on package location if available, otherwise fit bounds
          if (data.status !== "DELIVERED" && originCoords && destCoords) {
            // Get package position (last item in allCoords is the package)
            const packageCoord = allCoords[allCoords.length - 1];
            
            // First fit bounds to show all markers
            const bounds = new mapboxgl.LngLatBounds();
            allCoords.forEach((coord) => bounds.extend(coord));
            map.current.fitBounds(bounds, {
              padding: { top: 80, bottom: 80, left: 80, right: 80 },
              maxZoom: 8,
            });
            
            // Then center on package with slight delay for smooth transition
            setTimeout(() => {
              if (map.current) {
                map.current.flyTo({
                  center: packageCoord,
                  zoom: 5,
                  duration: 1500,
                });
              }
            }, 500);
          } else if (allCoords.length >= 2) {
            const bounds = new mapboxgl.LngLatBounds();
            allCoords.forEach((coord) => bounds.extend(coord));
            map.current.fitBounds(bounds, {
              padding: { top: 50, bottom: 50, left: 50, right: 50 },
              maxZoom: 12,
            });
          } else if (allCoords.length === 1) {
            map.current.setCenter(allCoords[0]);
            map.current.setZoom(10);
          }

          setMapLoaded(true);
        });
      } catch (error) {
        console.error("Map initialization error:", error);
        setMapError("Failed to initialize map");
      }
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isGeocoding, originCoords, destCoords, currentCoords, data.origin, data.destination, data.status, data.currentLocation]);

  // Loading state while geocoding
  if (isGeocoding) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Shipment Route</h3>
        </div>
        <div className="h-[300px] lg:h-[400px] flex flex-col items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
          <p className="text-gray-500 text-sm">Loading map coordinates...</p>
        </div>
      </motion.div>
    );
  }

  // Error or no coordinates fallback
  if (mapError || (!originCoords && !destCoords)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Shipment Route</h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Navigation className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">Route Visualization</p>
            <p className="text-sm text-gray-500 mt-2">
              {data.origin} → {data.destination}
            </p>
            {mapError && (
              <p className="text-xs text-red-500 mt-2">{mapError}</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Calculate progress based on status
  const calculateProgress = (status: string): number => {
    const statusProgress: Record<string, number> = {
      CREATED: 0,
      PICKUP_SCHEDULED: 0,
      PICKED_UP: 0.1,
      RECEIVED_AT_ORIGIN_HUB: 0.15,
      STORED: 0.2,
      READY_FOR_DISPATCH: 0.25,
      IN_TRANSIT: 0.5,
      ARRIVED_AT_DESTINATION_HUB: 0.75,
      OUT_FOR_DELIVERY: 0.9,
      DELIVERED: 1.0,
      ON_HOLD: 0.5,
      DELIVERY_FAILED: 0.9,
      RETURNED_TO_SENDER: 0,
      CANCELLED: 0,
      DAMAGED: 0.5,
    };
    return statusProgress[status] ?? 0.3;
  };

  const progress = calculateProgress(data.status);
  const progressPercent = Math.round(progress * 100);

  const getStatusColor = (status: string) => {
    if (status === "DELIVERED") return "text-green-600";
    if (status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") return "text-blue-600";
    if (status === "ON_HOLD" || status === "DELIVERY_FAILED" || status === "DAMAGED") return "text-red-600";
    if (status === "CANCELLED" || status === "RETURNED_TO_SENDER") return "text-gray-600";
    return "text-amber-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Shipment Route</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Live tracking visualization</p>
      </div>
      
      <div className="relative">
        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        
        <div ref={mapContainer} className="h-[300px] lg:h-[400px]" />

        {/* Legend overlay */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 text-xs">
          <div className="font-semibold text-gray-700 mb-2">Route Legend</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">O</div>
              <span className="text-gray-600">Origin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">D</div>
              <span className="text-gray-600">Destination</span>
            </div>
            {data.status !== "DELIVERED" && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px]">📦</div>
                <span className="text-gray-600">Package</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium text-gray-500">Progress</div>
              <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-xs font-semibold text-gray-700">{progressPercent}%</div>
            </div>
            {/* Status on mobile */}
            <div className={`text-xs font-semibold sm:hidden ${getStatusColor(data.status)}`}>
              {data.status.replace(/_/g, " ")}
            </div>
          </div>
        </div>

        {/* Status badge - desktop */}
        <div className="hidden sm:block absolute top-3 right-12 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1.5">
          <div className={`text-xs font-semibold ${getStatusColor(data.status)}`}>
            {data.status.replace(/_/g, " ")}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
