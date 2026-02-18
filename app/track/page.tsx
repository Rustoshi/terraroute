"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  TrackingHero,
  ShipmentSummary,
  TrackingTimeline,
  MapPanel,
  ShipmentDetails,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  SupportCTA,
  FreightDetailsPanel,
  type TrackingData,
  type TrackingState,
} from "@/components/tracking";
import { Navbar, FooterSection } from "@/components/homepage";
import { Preloader } from "@/components/ui/Preloader";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Bayanchor Logistics";

function TrackingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  
  const [trackingState, setTrackingState] = useState<TrackingState>("idle");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [currentCode, setCurrentCode] = useState<string>("");

  // Get initial code from URL
  const initialCode = searchParams.get("code") || "";

  // Track shipment on initial load if code is present
  useEffect(() => {
    if (initialCode && initialCode !== currentCode) {
      handleTrack(initialCode);
    }
  }, [initialCode]);


  const handleTrack = async (code: string) => {
    if (!code.trim()) return;

    setCurrentCode(code);
    setTrackingState("loading");

    // Update URL
    router.push(`/track?code=${encodeURIComponent(code)}`, { scroll: false });

    // Scroll to results after a short delay
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);

    try {
      const response = await fetch(`/api/tracking?code=${encodeURIComponent(code)}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 404) {
          setTrackingState("not_found");
        } else {
          setTrackingState("error");
        }
        setTrackingData(null);
        return;
      }

      setTrackingData(result.data);
      setTrackingState("success");
    } catch (error) {
      console.error("Tracking error:", error);
      setTrackingState("error");
      setTrackingData(null);
    }
  };

  const handleRetry = () => {
    if (currentCode) {
      handleTrack(currentCode);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <TrackingHero 
        onTrack={handleTrack} 
        isLoading={trackingState === "loading"}
        initialCode={initialCode}
      />

      {/* Results Section */}
      <section ref={resultsRef} className="py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Idle State */}
          {trackingState === "idle" && <EmptyState />}

          {/* Loading State */}
          {trackingState === "loading" && <LoadingSkeleton />}

          {/* Not Found State */}
          {trackingState === "not_found" && (
            <ErrorState type="not_found" onRetry={handleRetry} />
          )}

          {/* Error State */}
          {trackingState === "error" && (
            <ErrorState type="error" onRetry={handleRetry} />
          )}

          {/* Success State */}
          {trackingState === "success" && trackingData && (
            <div className="space-y-6">
              {/* Print Button - Top of page */}
              <div className="flex justify-end">
                <button
                  onClick={() => window.open(`/track/invoice?code=${encodeURIComponent(trackingData.trackingCode)}`, "_blank")}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Shipment
                </button>
              </div>

              {/* Shipment Summary - Full Width (includes barcode) */}
              <div ref={summaryRef}>
                <ShipmentSummary data={trackingData} />
              </div>

              {/* Two Column Layout: Timeline + Map */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column - Timeline */}
                <TrackingTimeline 
                  events={trackingData.events} 
                  currentStatus={trackingData.status}
                  estimatedDeliveryDate={trackingData.estimatedDeliveryDate}
                />

                {/* Right Column - Map */}
                <MapPanel data={trackingData} />
              </div>

              {/* Freight & Payment - Full Width */}
              <FreightDetailsPanel data={trackingData} />

              {/* Shipment Details (Collapsible) - Full Width */}
              <ShipmentDetails data={trackingData} />

              {/* Support CTA */}
              <SupportCTA />
            </div>
          )}
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

export default function TrackingPage() {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <>
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
      <Suspense fallback={
        <main className="min-h-screen bg-white">
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
            <Image 
              src="/logo.PNG" 
              alt={COMPANY_NAME} 
              width={100} 
              height={100} 
              className="object-contain mb-6"
              priority
            />
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600 text-sm">Loading...</p>
          </div>
        </main>
      }>
        <TrackingPageContent />
      </Suspense>
    </>
  );
}
