"use client";

import { motion } from "framer-motion";
import { Navbar, FooterSection } from "@/components/homepage";
import { Globe, Plane, Ship, FileText, CheckCircle, Package } from "lucide-react";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Courier Express";

export default function InternationalFreightPage() {
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
              International Freight Services
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect your business to the world with our comprehensive international 
              shipping solutions. We deliver to 190+ countries worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Global Reach */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "190+", label: "Countries Served" },
              { value: "500+", label: "Global Partners" },
              { value: "99.5%", label: "On-Time Delivery" },
              { value: "24/7", label: "Customs Support" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Shipping Methods
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the right shipping method for your international cargo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Plane,
                title: "Air Freight",
                time: "3-7 Days",
                description: "Fast international shipping for time-sensitive cargo. Ideal for urgent deliveries and high-value goods.",
                features: [
                  "Express customs clearance",
                  "Door-to-door service",
                  "Real-time tracking",
                  "Temperature-controlled options",
                ],
              },
              {
                icon: Ship,
                title: "Ocean Freight",
                time: "15-45 Days",
                description: "Cost-effective solution for large shipments. Perfect for bulk cargo and non-urgent deliveries.",
                features: [
                  "Full container load (FCL)",
                  "Less than container load (LCL)",
                  "Port-to-port or door-to-door",
                  "Competitive rates",
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
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                  <service.icon className="h-6 w-6 text-blue-600" />
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

      {/* Customs & Documentation */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Customs Clearance & Documentation
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Navigate international regulations with ease. Our expert team handles 
                all customs documentation and clearance procedures.
              </p>
              <ul className="space-y-3">
                {[
                  "Complete customs documentation",
                  "Duty and tax calculation",
                  "Compliance verification",
                  "Import/export licenses",
                  "Harmonized tariff classification",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Required Documents
              </h3>
              <div className="space-y-4">
                {[
                  "Commercial Invoice",
                  "Packing List",
                  "Bill of Lading / Air Waybill",
                  "Certificate of Origin",
                  "Insurance Certificate",
                  "Export/Import Permits (if required)",
                ].map((doc) => (
                  <div key={doc} className="flex items-center gap-3 bg-white rounded-lg p-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{doc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Ship Internationally?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get a customized quote for your international shipment
            </p>
            <a
              href="/quote"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
            >
              <Globe className="h-5 w-5" />
              Get International Quote
            </a>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
