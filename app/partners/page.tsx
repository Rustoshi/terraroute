"use client";

import { motion } from "framer-motion";
import { Navbar, FooterSection } from "@/components/homepage";
import { Handshake } from "lucide-react";

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Our Partners</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Building strong relationships with trusted partners worldwide.
            </p>
          </motion.div>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Handshake className="h-20 w-20 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Partnership Opportunities</h2>
          <p className="text-lg text-gray-600 mb-8">
            Interested in partnering with us? Contact our business development team.
          </p>
          <a href="/contact" className="inline-flex px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
            Get in Touch
          </a>
        </div>
      </section>
      <FooterSection />
    </main>
  );
}
