import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/middleware/rateLimit";
import { validateData, mapboxQuerySchema } from "@/utils/validation";
import { ApiResponse, MapboxFeature } from "@/types";

/**
 * GET /api/mapbox/geocode?q=address
 *
 * Proxy endpoint for Mapbox geocoding (address to coordinates).
 * Keeps Mapbox access token secure on the server.
 */

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const MAPBOX_GEOCODING_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

interface GeocodeResult {
  placeName: string;
  coordinates: {
    lng: number;
    lat: number;
  };
  relevance: number;
}

async function handleGet(request: NextRequest): Promise<NextResponse> {
  // Check for Mapbox token
  if (!MAPBOX_ACCESS_TOKEN) {
    const response: ApiResponse = {
      success: false,
      error: "Mapbox service not configured",
    };
    return NextResponse.json(response, { status: 503 });
  }

  try {
    // Parse and validate query
    const searchParams = request.nextUrl.searchParams;
    const validation = validateData(mapboxQuerySchema, {
      q: searchParams.get("q"),
    });

    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: validation.error,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { q } = validation.data!;

    // Build Mapbox API URL
    const mapboxUrl = new URL(`${MAPBOX_GEOCODING_URL}/${encodeURIComponent(q)}.json`);
    mapboxUrl.searchParams.set("access_token", MAPBOX_ACCESS_TOKEN);
    mapboxUrl.searchParams.set("limit", "1"); // Get best match only for geocoding
    mapboxUrl.searchParams.set("types", "country,region,district,place,locality,neighborhood,address,postcode");

    // Call Mapbox API
    const mapboxResponse = await fetch(mapboxUrl.toString());

    if (!mapboxResponse.ok) {
      console.error("Mapbox API error:", mapboxResponse.status, await mapboxResponse.text());
      const response: ApiResponse = {
        success: false,
        error: "Geocoding failed",
      };
      return NextResponse.json(response, { status: 502 });
    }

    const mapboxData = await mapboxResponse.json();

    // Check if we got results
    if (!mapboxData.features || mapboxData.features.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: "Address not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Get the best match
    const feature: MapboxFeature = mapboxData.features[0];

    const result: GeocodeResult = {
      placeName: feature.place_name,
      coordinates: {
        lng: feature.center[0],
        lat: feature.center[1],
      },
      relevance: mapboxData.features[0].relevance || 1,
    };

    const response: ApiResponse<GeocodeResult> = {
      success: true,
      data: result,
    };

    // Cache for 1 hour (addresses don't change often)
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Geocode error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Geocoding failed",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// Export with rate limiting
export const GET = withRateLimit(handleGet, "mapbox");
