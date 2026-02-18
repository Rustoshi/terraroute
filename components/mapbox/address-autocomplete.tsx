"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { mapboxApi, type MapboxFeature, type Coordinates, type LocationInfo } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { cn } from "@/lib/utils";
import { MapPin, Loader2 } from "lucide-react";

/**
 * Parse location info (city, state, country) from Mapbox feature context
 */
function parseLocationFromFeature(feature: MapboxFeature): Omit<LocationInfo, "coordinates"> {
  let city = "";
  let state = "";
  let country = "";

  // The main text is often the city/place name
  city = feature.text || "";

  // Parse context for state and country
  if (feature.context) {
    for (const ctx of feature.context) {
      if (ctx.id.startsWith("region") || ctx.id.startsWith("state")) {
        state = ctx.text;
      } else if (ctx.id.startsWith("country")) {
        country = ctx.text;
      } else if (ctx.id.startsWith("place") && !city) {
        city = ctx.text;
      }
    }
  }

  // Fallback: parse from place_name if context is missing
  if (!city || !state || !country) {
    const parts = feature.place_name.split(", ").map(p => p.trim());
    if (parts.length >= 3) {
      if (!city) city = parts[0];
      if (!state) state = parts[parts.length - 2];
      if (!country) country = parts[parts.length - 1];
    } else if (parts.length === 2) {
      if (!city) city = parts[0];
      if (!country) country = parts[1];
    }
  }

  return { city, state: state || city, country: country || "Unknown" };
}

interface AddressAutocompleteProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: string, coordinates: Coordinates, locationInfo: Omit<LocationInfo, "coordinates">) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  error,
  placeholder = "Start typing an address...",
  className,
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Debounce the search value
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Fetch suggestions
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: queryKeys.mapbox.autocomplete(debouncedValue),
    queryFn: () => mapboxApi.autocomplete(debouncedValue),
    enabled: debouncedValue.length >= 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (feature: MapboxFeature) => {
    onChange(feature.place_name);
    setIsOpen(false);

    // Parse location info from feature
    const locationInfo = parseLocationFromFeature(feature);

    // Get precise coordinates
    const coords = await mapboxApi.geocode(feature.place_name);
    if (coords) {
      onSelect(feature.place_name, coords, locationInfo);
    } else {
      // Fallback to feature center
      onSelect(feature.place_name, {
        lng: feature.center[0],
        lat: feature.center[1],
      }, locationInfo);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-lg border bg-white pl-10 pr-10 py-2 text-sm text-gray-900",
            "placeholder:text-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "transition-shadow duration-200",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 hover:border-gray-400"
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((feature) => (
            <button
              key={feature.id}
              type="button"
              onClick={() => handleSelect(feature)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
            >
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <span className="text-gray-900">{feature.place_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
