"use client";

import { AnimatedSection, StaggerWrapper, fadeInUp } from "../motion";
import { motion } from "framer-motion";
import { FileText, Truck, MapPin, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create Shipment",
    description: "Request a quote or create a shipment online. Our team will confirm pickup details within minutes.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Pickup or Drop-off",
    description: "Schedule a pickup from your location or drop off at any of our 500+ service points worldwide.",
    icon: Truck,
  },
  {
    number: "03",
    title: "Track in Real-Time",
    description: "Monitor your shipment 24/7 with live GPS tracking and automated status notifications.",
    icon: MapPin,
  },
  {
    number: "04",
    title: "Delivered Safely",
    description: "Your package arrives on time with proof of delivery. Satisfaction guaranteed.",
    icon: CheckCircle,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium mb-6">
            Simple Process
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Shipping with us is simple. Four easy steps from pickup to delivery.
          </p>
        </AnimatedSection>

        {/* Steps Timeline */}
        <StaggerWrapper className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                className="relative"
              >
                {/* Step Card */}
                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300 group">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8 px-4 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-full">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center mb-6 transition-colors">
                    <step.icon className="h-8 w-8 text-slate-700 group-hover:text-orange-600 transition-colors" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow - Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-24 -right-3 z-10">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-orange-300 flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-orange-500" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </StaggerWrapper>
      </div>
    </section>
  );
}
