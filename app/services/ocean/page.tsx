"use client";

import { motion } from "framer-motion";
import { Navbar, FooterSection } from "@/components/homepage";
import { Ship, Package, DollarSign, Anchor, CheckCircle, Container, Globe, TrendingDown } from "lucide-react";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Courier Express";

export default function OceanFreightPage() {
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
              Ocean Freight Services
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Cost-effective shipping solutions for large cargo and bulk shipments. 
              Reliable ocean freight services connecting major ports worldwide.
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
                icon: Ship,
                title: "FCL & LCL Options",
                description: "Full container load for large shipments or less than container load for smaller cargo - flexible solutions for every need.",
              },
              {
                icon: Package,
                title: "Bulk Cargo Handling",
                description: "Specialized equipment and expertise to handle large volumes efficiently and safely across all major shipping routes.",
              },
              {
                icon: DollarSign,
                title: "Competitive Rates",
                description: "Best prices for ocean freight with transparent pricing and no hidden fees. Volume discounts available.",
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
              Ocean Freight Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the right shipping method for your cargo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Container,
                title: "Full Container Load (FCL)",
                time: "15-45 Days",
                description: "Exclusive use of a full container for your cargo. Ideal for large shipments and maximum security.",
                features: [
                  "20ft and 40ft containers available",
                  "High cube and refrigerated options",
                  "Direct port-to-port shipping",
                  "Reduced handling and damage risk",
                  "Cost-effective for large volumes",
                ],
              },
              {
                icon: Package,
                title: "Less than Container Load (LCL)",
                time: "20-50 Days",
                description: "Share container space with other shippers. Perfect for smaller shipments and budget-conscious shipping.",
                features: [
                  "Pay only for space you use",
                  "Flexible shipment sizes",
                  "Consolidated with other cargo",
                  "Weekly departures available",
                  "Door-to-door service options",
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
                <p className="text-blue-600 font-semibold mb-4">{service.time}</p>
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

      {/* Container Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Container Types
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Various container options to suit your cargo requirements
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                title: "Standard Dry",
                size: "20ft / 40ft",
                description: "General cargo containers for dry goods",
              },
              {
                title: "High Cube",
                size: "40ft / 45ft",
                description: "Extra height for oversized cargo",
              },
              {
                title: "Refrigerated",
                size: "20ft / 40ft",
                description: "Temperature-controlled for perishables",
              },
              {
                title: "Open Top",
                size: "20ft / 40ft",
                description: "For cargo loaded from above",
              },
            ].map((container, index) => (
              <motion.div
                key={container.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center"
              >
                <Container className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {container.title}
                </h3>
                <p className="text-sm text-blue-600 font-semibold mb-2">
                  {container.size}
                </p>
                <p className="text-sm text-gray-600">{container.description}</p>
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
                Why Choose Ocean Freight?
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Cost Efficiency",
                    desc: "Most economical option for large shipments and bulk cargo",
                  },
                  {
                    title: "High Capacity",
                    desc: "Handle massive volumes with containers up to 45ft",
                  },
                  {
                    title: "Environmental",
                    desc: "Lower carbon footprint compared to air freight",
                  },
                  {
                    title: "Versatile",
                    desc: "Suitable for almost any type of cargo with specialized containers",
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
                <Anchor className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Global Port Network
                </h3>
                <p className="text-gray-600">
                  Connected to major ports worldwide
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 text-center">
                {[
                  { value: "300+", label: "Ports" },
                  { value: "150+", label: "Countries" },
                  { value: "98%", label: "On-Time" },
                  { value: "24/7", label: "Tracking" },
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
              Ready to Ship by Sea?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get a competitive quote for your ocean freight shipment
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                <Ship className="h-5 w-5" />
                Get Ocean Freight Quote
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
