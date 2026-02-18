import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/middleware/rateLimit";
import { validateData, mapboxQuerySchema } from "@/utils/validation";
import { ApiResponse, MapboxFeature } from "@/types";

/**
 * GET /api/mapbox/autocomplete?q=address
 *
 * Proxy endpoint for Mapbox address autocomplete.
 * Keeps Mapbox access token secure on the server.
 */

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const MAPBOX_GEOCODING_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

interface AutocompleteResult {
  id: string;
  placeName: string;
  text: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  context?: string[];
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

    // Build Mapbox API URL with parameters
    const mapboxUrl = new URL(`${MAPBOX_GEOCODING_URL}/${encodeURIComponent(q)}.json`);
    mapboxUrl.searchParams.set("access_token", MAPBOX_ACCESS_TOKEN);
    mapboxUrl.searchParams.set("autocomplete", "true");
    mapboxUrl.searchParams.set("limit", "8");
    // Include region for state-level searches, country for country-level
    mapboxUrl.searchParams.set("types", "address,place,locality,region,country");
    // Enable fuzzy matching for better results
    mapboxUrl.searchParams.set("fuzzyMatch", "true");
    // Prefer English results
    mapboxUrl.searchParams.set("language", "en");

    // Call Mapbox API
    const mapboxResponse = await fetch(mapboxUrl.toString());

    if (!mapboxResponse.ok) {
      console.error("Mapbox API error:", mapboxResponse.status, await mapboxResponse.text());
      const response: ApiResponse = {
        success: false,
        error: "Address lookup failed",
      };
      return NextResponse.json(response, { status: 502 });
    }

    const mapboxData = await mapboxResponse.json();

    // Return features in Mapbox format for frontend compatibility
    const features = mapboxData.features || [];

    const response: ApiResponse<{ features: MapboxFeature[] }> = {
      success: true,
      data: { features },
    };

    // Cache for 5 minutes to reduce API calls
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Address autocomplete failed",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// Export with rate limiting
export const GET = withRateLimit(handleGet, "mapbox");
