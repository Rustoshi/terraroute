"use client";

import { motion } from "framer-motion";
import { Navbar, FooterSection } from "@/components/homepage";
import { Plane, Clock, Shield, Globe, Package, CheckCircle, Zap, TrendingUp } from "lucide-react";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Courier Express";

export default function AirCargoPage() {
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
              Air Cargo Services
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Fast and reliable air freight solutions for time-sensitive shipments worldwide. 
              When speed matters, trust our express air cargo services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Plane,
                title: "Express Air Freight",
                description: "Priority shipping for urgent deliveries with guaranteed transit times to major destinations worldwide.",
              },
              {
                icon: Clock,
                title: "24-48 Hour Delivery",
                description: "Fast transit times to major destinations with next-flight-out options for critical shipments.",
              },
              {
                icon: Shield,
                title: "Secure Transport",
                description: "Temperature-controlled options, special handling for fragile items, and full cargo insurance coverage.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-blue-600" />
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

      {/* Service Types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Air Cargo Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Flexible air freight options tailored to your specific needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Zap,
                title: "Express Air Freight",
                time: "1-3 Days",
                description: "Fastest option for urgent shipments. Next-flight-out service available for critical cargo.",
                features: [
                  "Priority boarding and handling",
                  "Direct flights when available",
                  "Real-time flight tracking",
                  "Dedicated account manager",
                  "24/7 customer support",
                ],
              },
              {
                icon: TrendingUp,
                title: "Standard Air Freight",
                time: "3-7 Days",
                description: "Cost-effective air shipping for less urgent cargo. Reliable service with competitive rates.",
                features: [
                  "Consolidated shipments",
                  "Flexible scheduling",
                  "Online tracking portal",
                  "Customs clearance support",
                  "Door-to-door delivery",
                ],
              },
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-6">
                  <service.icon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-orange-600 font-semibold mb-4">{service.time}</p>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
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

      {/* Specialized Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Specialized Air Cargo
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Expert handling for special cargo requirements
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Temperature Controlled",
                description: "Climate-controlled shipping for pharmaceuticals, perishables, and temperature-sensitive goods.",
                items: ["Pharmaceuticals", "Fresh produce", "Chemicals", "Biologicals"],
              },
              {
                title: "Dangerous Goods",
                description: "Certified handling of hazardous materials with full IATA compliance and documentation.",
                items: ["Chemicals", "Batteries", "Flammables", "Compressed gases"],
              },
              {
                title: "Oversized Cargo",
                description: "Specialized equipment and handling for large, heavy, or awkwardly shaped shipments.",
                items: ["Machinery", "Vehicles", "Art pieces", "Industrial equipment"],
              },
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <div className="space-y-2">
                  {service.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Why Choose Our Air Cargo Services?
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Global Network",
                    desc: "Access to 500+ airports worldwide with direct connections to major hubs",
                  },
                  {
                    title: "Flexible Solutions",
                    desc: "From small parcels to full charter services, we handle all cargo sizes",
                  },
                  {
                    title: "Real-Time Tracking",
                    desc: "Monitor your shipment every step of the way with our advanced tracking system",
                  },
                  {
                    title: "Expert Team",
                    desc: "Experienced logistics professionals managing your cargo from pickup to delivery",
                  },
                ].map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">{benefit.title}</h4>
                      <p className="text-gray-600">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="text-center mb-6">
                <Globe className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Global Coverage
                </h3>
                <p className="text-gray-600">
                  We deliver to every corner of the world
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 text-center">
                {[
                  { value: "500+", label: "Airports" },
                  { value: "190+", label: "Countries" },
                  { value: "99.5%", label: "On-Time" },
                  { value: "24/7", label: "Support" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
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
              Ready to Ship by Air?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get an instant quote for your air cargo shipment
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                <Package className="h-5 w-5" />
                Get Air Freight Quote
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-slate-900 font-semibold rounded-xl border-2 border-gray-200 transition-colors"
              >
                Contact Specialist
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
