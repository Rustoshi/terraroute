"use client";

import { useState } from "react";
import {
  Navbar,
  HeroSection,
  StatsSection,
  ServicesSection,
  HowItWorksSection,
  GlobalCoverageSection,
  WhyChooseUsSection,
  TestimonialsSection,
  GallerySection,
  CTASection,
  FooterSection,
} from "@/components/homepage";
import { Preloader } from "@/components/ui/Preloader";

export default function Home() {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <>
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
      <main className="min-h-screen bg-white">
        <Navbar />
        <HeroSection />
        <StatsSection />
        <ServicesSection />
        <HowItWorksSection />
        <GlobalCoverageSection />
        <WhyChooseUsSection />
        <TestimonialsSection />
        <GallerySection />
        <CTASection variant="secondary" />
        <FooterSection />
      </main>
    </>
  );
}
