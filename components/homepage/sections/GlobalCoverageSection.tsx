"use client";

import { AnimatedSection, slideInLeft, slideInRight } from "../motion";
import { motion } from "framer-motion";
import { MapPin, Globe, Plane, Ship } from "lucide-react";

const regions = [
  { name: "North America", countries: "USA, Canada, Mexico" },
  { name: "Europe", countries: "UK, Germany, France, Netherlands" },
  { name: "Asia Pacific", countries: "China, Japan, Singapore, Australia" },
  { name: "Middle East", countries: "UAE, Saudi Arabia, Qatar" },
  { name: "Africa", countries: "Nigeria, South Africa, Kenya, Egypt" },
  { name: "South America", countries: "Brazil, Argentina, Chile" },
];

export function GlobalCoverageSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-900" />
      
      {/* World Map Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url('/images/world-map.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Animated route lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1000 500">
          <motion.path
            d="M100,250 Q300,100 500,250 T900,250"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M50,350 Q250,200 450,350 T850,200"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "linear" }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <AnimatedSection>
            <motion.div variants={slideInLeft}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium mb-6">
                <Globe className="h-4 w-4" />
                Global Network
              </div>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
                Connecting Businesses{" "}
                <span className="text-orange-500">Worldwide</span>
              </h2>
              
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Our extensive network spans across 190+ countries with strategically 
                located hubs ensuring your cargo reaches any destination efficiently. 
                From major ports to remote locations, we've got you covered.
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">500+</div>
                  <div className="text-sm text-gray-400">Service Points</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">50+</div>
                  <div className="text-sm text-gray-400">Air Routes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">100+</div>
                  <div className="text-sm text-gray-400">Sea Ports</div>
                </div>
              </div>

              {/* Transport Icons */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Plane className="h-6 w-6 text-orange-400" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Ship className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </motion.div>
          </AnimatedSection>

          {/* Right - Regions Grid */}
          <AnimatedSection delay={0.2}>
            <motion.div variants={slideInRight} className="grid grid-cols-2 gap-4">
              {regions.map((region, index) => (
                <motion.div
                  key={region.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <h4 className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                      {region.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-400">
                    {region.countries}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
