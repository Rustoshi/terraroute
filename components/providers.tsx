"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { createQueryClient } from "@/lib/query";

// Create a stable query client
function makeQueryClient() {
  return createQueryClient();
}

let browserQueryClient: ReturnType<typeof createQueryClient> | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new query client
    return makeQueryClient();
  }
  // Browser: reuse existing client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "white",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            },
          }}
        />
        <div className="hidden md:block">
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left" />
        </div>
      </QueryClientProvider>
    </SessionProvider>
  );
}
