"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "./motion";
import { LucideIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  image?: string;
}

export function ServiceCard({ title, description, icon: Icon, href = "/quote", image }: ServiceCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
    >
      {/* Image background */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="p-6">
        {!image && (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mb-5 group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300">
            <Icon className="h-7 w-7 text-white" />
          </div>
        )}
        
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-5 leading-relaxed">
          {description}
        </p>
        
        <Link 
          href={href}
          className="inline-flex items-center text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors"
        >
          Learn More
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Hover accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </motion.div>
  );
}
