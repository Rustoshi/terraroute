"use client";

import { motion } from "framer-motion";
import { Navbar, FooterSection } from "@/components/homepage";
import { Warehouse, Shield, Truck } from "lucide-react";

export default function WarehousingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Warehousing Solutions</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Secure storage and distribution services for your inventory.
            </p>
          </motion.div>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Warehouse, title: "Modern Facilities", desc: "Climate-controlled storage spaces" },
              { icon: Shield, title: "24/7 Security", desc: "Advanced security systems" },
              { icon: Truck, title: "Distribution Services", desc: "Integrated fulfillment solutions" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg">
                <item.icon className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
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
