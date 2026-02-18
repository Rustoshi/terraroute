"use client";

import { motion } from "framer-motion";
import { Headphones, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export function SupportCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>
      
      {/* Gradient orb */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
      
      <div className="relative">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Need Help with Your Shipment?
        </h3>
        <p className="text-gray-300 max-w-xl mx-auto mb-8">
          Our support team is available 24/7 to assist you with any questions 
          about your delivery or shipping needs.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/contact">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 h-12 px-6 bg-white hover:bg-gray-100 text-slate-900 font-semibold rounded-xl transition-colors"
            >
              <Headphones className="h-5 w-5" />
              Contact Support
            </motion.button>
          </Link>
          
          <Link href="/quote">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors group"
            >
              <FileText className="h-5 w-5" />
              Get a Quote
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
