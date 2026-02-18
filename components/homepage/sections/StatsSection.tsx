"use client";

import { StaggerWrapper, fadeInUp } from "../motion";
import { StatCard } from "../StatCard";
import { Globe, Package, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { value: 190, suffix: "+", label: "Countries Served", icon: Globe },
  { value: 2, suffix: "M+", label: "Shipments Delivered", icon: Package },
  { value: 25, suffix: "+", label: "Years Experience", icon: Clock },
  { value: 99.8, suffix: "%", label: "Delivery Success", icon: Award },
];

export function StatsSection() {
  return (
    <section className="relative py-8 sm:py-12 lg:py-16 bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
      
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <StaggerWrapper className="grid grid-cols-4 gap-1 sm:gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <motion.div key={stat.label} variants={fadeInUp}>
              <StatCard
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                icon={stat.icon}
                delay={index * 0.1}
              />
            </motion.div>
          ))}
        </StaggerWrapper>
      </div>
    </section>
  );
}
