"use client";

import { motion } from "framer-motion";
import { Navbar, FooterSection } from "@/components/homepage";
import { Truck, Clock, Shield, MapPin, CheckCircle, Package } from "lucide-react";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Courier Express";

export default function DomesticShippingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Domestic Shipping Services
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Fast, reliable, and affordable shipping solutions across the country. 
              From next-day delivery to standard shipping, we've got you covered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Fast Delivery",
                description: "Express delivery options available with next-day and same-day service in major cities.",
              },
              {
                icon: Shield,
                title: "Secure Handling",
                description: "Your packages are handled with care and tracked at every step of the journey.",
              },
              {
                icon: MapPin,
                title: "Nationwide Coverage",
                description: "We deliver to every corner of the country, from urban centers to remote locations.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Options */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Shipping Options
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the service that best fits your timeline and needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Standard Shipping",
                time: "3-5 Business Days",
                features: [
                  "Economical option",
                  "Real-time tracking",
                  "Signature on delivery",
                  "Insurance up to $100",
                ],
              },
              {
                name: "Express Shipping",
                time: "1-2 Business Days",
                features: [
                  "Priority handling",
                  "Real-time tracking",
                  "Signature required",
                  "Insurance up to $500",
                ],
                popular: true,
              },
              {
                name: "Overnight Shipping",
                time: "Next Business Day",
                features: [
                  "Fastest delivery",
                  "Real-time tracking",
                  "Signature required",
                  "Insurance up to $1,000",
                ],
              },
            ].map((option, index) => (
              <motion.div
                key={option.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className={`bg-white rounded-2xl p-8 shadow-lg relative ${
                  option.popular ? "ring-2 ring-orange-500" : ""
                }`}
              >
                {option.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {option.name}
                </h3>
                <p className="text-gray-600 mb-6">{option.time}</p>
                <ul className="space-y-3">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Ship?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get an instant quote or start shipping today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                <Package className="h-5 w-5" />
                Get a Quote
              </a>
              <a
                href="/track"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-slate-900 font-semibold rounded-xl border-2 border-gray-200 transition-colors"
              >
                <Truck className="h-5 w-5" />
                Track Shipment
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
