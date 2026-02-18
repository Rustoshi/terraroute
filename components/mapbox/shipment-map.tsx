"use client";

import * as React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";
import { mapboxApi, type Coordinates, type Shipment } from "@/lib/api";
import { Loader2, MapPin, Package, Navigation, Flag, Circle } from "lucide-react";

interface ShipmentMapProps {
  shipment: Shipment;
  className?: string;
}

// Generate curved arc points between two coordinates (great circle approximation)
function generateArcPoints(
  start: [number, number],
  end: [number, number],
  numPoints: number = 50
): [number, number][] {
  const points: [number, number][] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;

    // Linear interpolation for lng/lat
    const lng = start[0] + (end[0] - start[0]) * t;
    const lat = start[1] + (end[1] - start[1]) * t;

    // Add curve by adjusting latitude based on distance
    const distance = Math.abs(end[0] - start[0]);
    const curveHeight = Math.min(distance * 0.15, 15); // Max 15 degrees curve
    const curve = Math.sin(t * Math.PI) * curveHeight;

    points.push([lng, lat + curve]);
  }

  return points;
}

// Calculate progress along route (0-1)
// Package only moves after PICKED_UP status
function calculateProgress(status: string): number {
  const statusProgress: Record<string, number> = {
    // Package still at origin - no movement yet
    CREATED: 0,
    PICKUP_SCHEDULED: 0,
    PICKED_UP: 0,
    RECEIVED_AT_ORIGIN_HUB: 0.1,
    STORED: 0.15,
    READY_FOR_DISPATCH: 0.2,
    // Package in transit
    IN_TRANSIT: 0.5,
    ARRIVED_AT_DESTINATION_HUB: 0.75,
    OUT_FOR_DELIVERY: 0.9,
    DELIVERED: 1.0,
    // Exception statuses
    ON_HOLD: 0.5,
    DELIVERY_FAILED: 0.9,
    RETURNED_TO_SENDER: 0,
    CANCELLED: 0,
    DAMAGED: 0.5,
  };
  return statusProgress[status] ?? 0;
}

// Check if package has left origin
function hasPackageLeftOrigin(status: string): boolean {
  const atOriginStatuses = ["CREATED", "PICKUP_SCHEDULED", "PICKED_UP", "RETURNED_TO_SENDER", "CANCELLED"];
  return !atOriginStatuses.includes(status);
}

// Simple marker elements - no hover effects to avoid position issues
function createMarkerElement(
  type: "origin" | "destination" | "current" | "checkpoint"
): HTMLElement {
  const el = document.createElement("div");

  const styles: Record<string, { bg: string; border: string; size: number; icon: string }> = {
    origin: { bg: "#3b82f6", border: "#1d4ed8", size: 28, icon: "O" },
    destination: { bg: "#22c55e", border: "#15803d", size: 28, icon: "D" },
    current: { bg: "#f59e0b", border: "#d97706", size: 32, icon: "📦" },
    checkpoint: { bg: "#8b5cf6", border: "#7c3aed", size: 14, icon: "" },
  };

  const s = styles[type];

  if (type === "checkpoint") {
    el.innerHTML = `<div style="
      width: ${s.size}px; height: ${s.size}px;
      background: ${s.bg}; border-radius: 50%;
      border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`;
  } else if (type === "current") {
    el.innerHTML = `<div style="
      width: ${s.size}px; height: ${s.size}px;
      background: ${s.bg}; border-radius: 50%;
      border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
    ">${s.icon}</div>`;
  } else {
    el.innerHTML = `<div style="
      width: ${s.size}px; height: ${s.size}px;
      background: ${s.bg}; border-radius: 50%;
      border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: bold; font-size: 12px;
    ">${s.icon}</div>`;
  }

  return el.firstElementChild as HTMLElement;
}

export function ShipmentMap({ shipment, className }: ShipmentMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = React.useState<string | null>(null);

  // State for geocoded coordinates
  const [originCoords, setOriginCoords] = React.useState<Coordinates | null>(null);
  const [destCoords, setDestCoords] = React.useState<Coordinates | null>(null);
  const [isGeocoding, setIsGeocoding] = React.useState(true); // Start as true to show loading

  // Geocode addresses if coordinates are missing
  React.useEffect(() => {
    let isMounted = true;

    const geocodeAddresses = async () => {
      setIsGeocoding(true);
      setMapError(null);

      // Use existing coordinates or geocode from address
      // Priority: originLocation/destinationLocation > sender/receiver coordinates
      let origin: Coordinates | null =
        shipment.originLocation?.coordinates ||
        shipment.sender.coordinates ||
        null;
      let dest: Coordinates | null =
        shipment.destinationLocation?.coordinates ||
        shipment.receiver.coordinates ||
        null;

      // Geocode origin if missing
      if (!origin && shipment.origin) {
        try {
          const result = await mapboxApi.geocode(shipment.origin);
          if (result) origin = result;
        } catch (e) {
          console.error("Failed to geocode origin:", e);
        }
      }

      // Geocode destination if missing
      if (!dest && shipment.destination) {
        try {
          const result = await mapboxApi.geocode(shipment.destination);
          if (result) dest = result;
        } catch (e) {
          console.error("Failed to geocode destination:", e);
        }
      }

      if (isMounted) {
        setOriginCoords(origin);
        setDestCoords(dest);
        setIsGeocoding(false);
      }
    };

    geocodeAddresses();

    return () => {
      isMounted = false;
    };
  }, [shipment.originLocation?.coordinates, shipment.destinationLocation?.coordinates, shipment.sender.coordinates, shipment.receiver.coordinates, shipment.origin, shipment.destination]);

  // Get the latest tracking event coordinates for current package location
  const [currentCoords, setCurrentCoords] = React.useState<Coordinates | null>(null);

  // Stringify tracking events to detect actual data changes (not just reference changes)
  const trackingEventsKey = JSON.stringify(
    shipment.trackingEvents.map(e => ({ id: e._id, location: e.location, coordinates: e.coordinates }))
  );

  React.useEffect(() => {
    let isMounted = true;

    // Reset current coords immediately so the map doesn't show stale marker
    setCurrentCoords(null);

    const getLatestLocation = async () => {
      // First, check if the latest tracking event has coordinates
      const eventsWithCoords = shipment.trackingEvents
        .filter(e => e.coordinates)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (eventsWithCoords.length > 0 && eventsWithCoords[0].coordinates) {
        if (isMounted) setCurrentCoords(eventsWithCoords[0].coordinates);
        return;
      }

      // Fallback: get the latest event location and geocode it
      const latestEvent = [...shipment.trackingEvents]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (latestEvent?.location) {
        try {
          const coords = await mapboxApi.geocode(latestEvent.location);
          if (isMounted && coords) setCurrentCoords(coords);
        } catch (e) {
          console.error("Failed to geocode latest event location:", e);
        }
      } else if (shipment.currentLocation) {
        // Final fallback: use shipment.currentLocation
        try {
          const coords = await mapboxApi.geocode(shipment.currentLocation);
          if (isMounted && coords) setCurrentCoords(coords);
        } catch (e) {
          console.error("Failed to geocode current location:", e);
        }
      }
    };

    getLatestLocation();

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingEventsKey, shipment.currentLocation]);

  React.useEffect(() => {
    if (!mapContainer.current || isGeocoding) return;

    const origin = originCoords;
    const destination = destCoords;

    // Check if we have coordinates
    if (!origin && !destination) {
      setMapError("No coordinates available for this shipment");
      return;
    }

    // Initialize map
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        setMapError("Map not configured. Add NEXT_PUBLIC_MAPBOX_TOKEN to enable maps.");
        return;
      }

      mapboxgl.accessToken = token;

      // Calculate center point between origin and destination
      const center: [number, number] = origin && destination
        ? [(origin.lng + destination.lng) / 2, (origin.lat + destination.lat) / 2]
        : origin
          ? [origin.lng, origin.lat]
          : destination
            ? [destination.lng, destination.lat]
            : [0, 0];

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12", // Standard flat street map
        center,
        zoom: 3,
        pitch: 0,
        dragPan: true,
        scrollZoom: true,
        doubleClickZoom: true,
        touchZoomRotate: true,
      });

      // Add compact navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right"
      );

      // Add markers and route when map loads
      map.current.on("load", () => {
        if (!map.current) return;

        const allCoords: [number, number][] = [];

        // Add origin marker
        if (origin) {
          new mapboxgl.Marker({ element: createMarkerElement("origin") })
            .setLngLat([origin.lng, origin.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
                <div style="padding: 8px 12px;">
                  <div style="font-weight: 600; color: #1d4ed8; margin-bottom: 4px;">📍 Origin</div>
                  <div style="font-size: 13px; color: #374151;">${shipment.origin || shipment.sender.address}</div>
                  <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${shipment.sender.name}</div>
                </div>
              `)
            )
            .addTo(map.current!);
          allCoords.push([origin.lng, origin.lat]);
        }

        // Add destination marker
        if (destination) {
          new mapboxgl.Marker({ element: createMarkerElement("destination") })
            .setLngLat([destination.lng, destination.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
                <div style="padding: 8px 12px;">
                  <div style="font-weight: 600; color: #15803d; margin-bottom: 4px;">🏁 Destination</div>
                  <div style="font-size: 13px; color: #374151;">${shipment.destination || shipment.receiver.address}</div>
                  <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${shipment.receiver.name}</div>
                </div>
              `)
            )
            .addTo(map.current!);
          allCoords.push([destination.lng, destination.lat]);
        }

        // Add tracking event checkpoints
        shipment.trackingEvents
          .filter((e) => e.coordinates)
          .forEach((event) => {
            if (!event.coordinates || !map.current) return;
            new mapboxgl.Marker({ element: createMarkerElement("checkpoint") })
              .setLngLat([event.coordinates.lng, event.coordinates.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 15, closeButton: false }).setHTML(`
                  <div style="padding: 8px 12px;">
                    <div style="font-weight: 600; color: #7c3aed; margin-bottom: 4px;">${event.status.replace(/_/g, " ")}</div>
                    <div style="font-size: 13px; color: #374151;">${event.location}</div>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${new Date(event.createdAt).toLocaleString()}</div>
                  </div>
                `)
              )
              .addTo(map.current);
            allCoords.push([event.coordinates.lng, event.coordinates.lat]);
          });

        // Draw curved route line if we have both endpoints
        if (origin && destination) {
          const arcPoints = generateArcPoints(
            [origin.lng, origin.lat],
            [destination.lng, destination.lat]
          );

          // Full route (dashed gray line)
          map.current.addSource("full-route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: arcPoints },
            },
          });

          map.current.addLayer({
            id: "full-route-bg",
            type: "line",
            source: "full-route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#cbd5e1",
              "line-width": 4,
              "line-dasharray": [2, 2],
            },
          });

          // Progress route (solid colored line)
          const progress = calculateProgress(shipment.status);
          const progressIndex = Math.floor(arcPoints.length * progress);
          const progressPoints = arcPoints.slice(0, progressIndex + 1);

          if (progressPoints.length >= 2) {
            map.current.addSource("progress-route", {
              type: "geojson",
              lineMetrics: true, // Required for line-gradient
              data: {
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates: progressPoints },
              },
            });

            map.current.addLayer({
              id: "progress-route",
              type: "line",
              source: "progress-route",
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
        }

        // Add current location marker based on actual tracking data
        if (shipment.status !== "DELIVERED") {
          // Use actual current coordinates from latest tracking event
          const latestEvent = [...shipment.trackingEvents]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

          // Priority: currentCoords (geocoded) > latest event coords > origin
          let currentPoint: [number, number] | null = null;
          let locationLabel = shipment.origin;

          if (currentCoords) {
            currentPoint = [currentCoords.lng, currentCoords.lat];
            locationLabel = latestEvent?.location || shipment.currentLocation || shipment.origin;
          } else if (latestEvent?.coordinates) {
            currentPoint = [latestEvent.coordinates.lng, latestEvent.coordinates.lat];
            locationLabel = latestEvent.location;
          } else if (origin) {
            currentPoint = [origin.lng, origin.lat];
          }

          if (currentPoint) {
            new mapboxgl.Marker({ element: createMarkerElement("current") })
              .setLngLat(currentPoint)
              .setPopup(
                new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
                  <div style="padding: 8px 12px;">
                    <div style="font-weight: 600; color: #d97706; margin-bottom: 4px;">📦 Package Location</div>
                    <div style="font-size: 13px; color: #374151;">${locationLabel}</div>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Status: ${shipment.status.replace(/_/g, " ")}</div>
                  </div>
                `)
              )
              .addTo(map.current!);

            // Add current location to bounds
            allCoords.push(currentPoint);
          }
        }

        // Fit bounds to show all markers
        if (allCoords.length >= 2) {
          const bounds = new mapboxgl.LngLatBounds();
          allCoords.forEach((coord) => bounds.extend(coord));
          map.current.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 12
          });
        } else if (allCoords.length === 1) {
          map.current.setCenter(allCoords[0]);
          map.current.setZoom(10);
        }
      });
    } catch (error) {
      setMapError("Failed to initialize map");
      console.error("Map error:", error);
    }

    return () => {
      map.current?.remove();
    };
  }, [originCoords, destCoords, currentCoords, isGeocoding, shipment]);

  if (isGeocoding) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200",
          className
        )}
        style={{ height: 350 }}
      >
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
        <p className="text-gray-500 text-sm">Loading map coordinates...</p>
      </div>
    );
  }

  if (mapError) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200",
          className
        )}
        style={{ height: 350 }}
      >
        <MapPin className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-gray-500 text-sm">{mapError}</p>
      </div>
    );
  }

  const progress = calculateProgress(shipment.status);
  const progressPercent = Math.round(progress * 100);

  return (
    <div className={cn("relative rounded-xl overflow-hidden border border-gray-200", className)} style={{ height: 350 }}>
      {/* Map container */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 text-xs">
        <div className="font-semibold text-gray-700 mb-2">Route Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm">📍</span>
            <span className="text-gray-600">Origin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🏁</span>
            <span className="text-gray-600">Destination</span>
          </div>
          {shipment.status !== "DELIVERED" && (
            <div className="flex items-center gap-2">
              <span className="text-sm">📦</span>
              <span className="text-gray-600">Current Location</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator + Status (combined on mobile, separate on desktop) */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-gray-500">Journey Progress</div>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs font-semibold text-gray-700">{progressPercent}%</div>
          </div>
          {/* Status - below progress on mobile */}
          <div className={cn(
            "text-xs font-semibold sm:hidden",
            shipment.status === "DELIVERED" ? "text-green-600" :
              shipment.status === "IN_TRANSIT" || shipment.status === "OUT_FOR_DELIVERY" ? "text-blue-600" :
                shipment.status === "ON_HOLD" || shipment.status === "DELIVERY_FAILED" || shipment.status === "DAMAGED" ? "text-red-600" :
                  shipment.status === "CANCELLED" || shipment.status === "RETURNED_TO_SENDER" ? "text-gray-600" :
                    "text-amber-600"
          )}>
            {shipment.status.replace(/_/g, " ")}
          </div>
        </div>
      </div>

      {/* Status badge - desktop only */}
      <div className="hidden sm:block absolute top-3 right-12 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1.5">
        <div className={cn(
          "text-xs font-semibold",
          shipment.status === "DELIVERED" ? "text-green-600" :
            shipment.status === "IN_TRANSIT" || shipment.status === "OUT_FOR_DELIVERY" ? "text-blue-600" :
              shipment.status === "ON_HOLD" || shipment.status === "DELIVERY_FAILED" || shipment.status === "DAMAGED" ? "text-red-600" :
                shipment.status === "CANCELLED" || shipment.status === "RETURNED_TO_SENDER" ? "text-gray-600" :
                  "text-amber-600"
        )}>
          {shipment.status.replace(/_/g, " ")}
        </div>
      </div>
    </div>
  );
}
