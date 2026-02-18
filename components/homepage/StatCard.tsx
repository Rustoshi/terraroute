"use client";

import { motion } from "framer-motion";
import { fadeInUp, AnimatedCounter } from "./motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon?: LucideIcon;
  delay?: number;
}

export function StatCard({ value, suffix = "", prefix = "", label, icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      custom={delay}
      className="relative text-center p-3 sm:p-4 lg:p-6"
    >
      {Icon && (
        <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mb-2 sm:mb-3 rounded-lg bg-orange-500/10">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-500" />
        </div>
      )}
      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
        <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
      </div>
      <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm font-medium uppercase tracking-wide">
        {label}
      </p>
    </motion.div>
  );
}
