"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "./motion";
import { TrackingInput } from "./TrackingInput";
import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";

interface CTASectionProps {
  variant?: "primary" | "secondary";
}

export function CTASection({ variant = "primary" }: CTASectionProps) {
  if (variant === "secondary") {
    return (
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-5" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Ship with Confidence?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
              Join thousands of businesses who trust us with their logistics. 
              Get started today with a free quote or track your existing shipment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 group"
                >
                  <FileText className="h-5 w-5" />
                  Get a Free Quote
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <Link href="/track">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-white/10 hover:bg-white/20 text-white text-lg font-semibold rounded-xl border border-white/20 transition-all duration-200"
                >
                  Track Shipment
                </motion.button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-5" />
            
            {/* Gradient orb */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/30 rounded-full blur-3xl" />
            
            <div className="relative">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 text-center">
                Track Your Shipment
              </h2>
              <p className="text-gray-300 text-center mb-8 max-w-xl mx-auto">
                Enter your tracking number below to get real-time updates on your package location and delivery status.
              </p>
              
              <TrackingInput className="max-w-2xl mx-auto" />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
