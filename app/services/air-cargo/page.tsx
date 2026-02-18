"use client";

import { motion } from "framer-motion";
import { Navbar, FooterSection } from "@/components/homepage";
import { Plane, Clock, Shield, Globe } from "lucide-react";

export default function AirCargoPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Air Cargo Services</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Fast and reliable air freight solutions for time-sensitive shipments worldwide.
            </p>
          </motion.div>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Plane, title: "Express Air Freight", desc: "Priority shipping for urgent deliveries" },
              { icon: Clock, title: "24-48 Hour Delivery", desc: "Fast transit times to major destinations" },
              { icon: Shield, title: "Secure Transport", desc: "Temperature-controlled and special handling" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg">
                <item.icon className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FooterSection />
    </main>
  );
}
