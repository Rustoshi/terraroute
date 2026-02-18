/**
 * React Query configuration and query keys
 */

import { QueryClient } from "@tanstack/react-query";

// Create a client with sensible defaults
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// Query keys for cache management
export const queryKeys = {
  // Shipments
  shipments: {
    all: ["shipments"] as const,
    list: (filters?: unknown) =>
      ["shipments", "list", filters] as const,
    detail: (id: string) => ["shipments", "detail", id] as const,
  },

  // Quotes
  quotes: {
    all: ["quotes"] as const,
    list: (filters?: unknown) =>
      ["quotes", "list", filters] as const,
    detail: (id: string) => ["quotes", "detail", id] as const,
  },

  // Emails
  emails: {
    all: ["emails"] as const,
    logs: (filters?: unknown) =>
      ["emails", "logs", filters] as const,
  },

  // Dashboard
  dashboard: {
    stats: ["dashboard", "stats"] as const,
  },

  // Mapbox
  mapbox: {
    autocomplete: (query: string) => ["mapbox", "autocomplete", query] as const,
  },

  // Carriers
  carriers: {
    all: ["carriers"] as const,
    list: (activeOnly?: boolean) => ["carriers", "list", activeOnly] as const,
    detail: (id: string) => ["carriers", "detail", id] as const,
  },
} as const;
