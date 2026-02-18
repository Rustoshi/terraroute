"use client";

import { AnimatedSection, StaggerWrapper, fadeInUp } from "../motion";
import { ServiceCard } from "../ServiceCard";
import { motion } from "framer-motion";
import { 
  Truck, 
  Plane, 
  Ship, 
  Train, 
  Package, 
  Warehouse,
  Globe,
  Zap
} from "lucide-react";

const services = [
  {
    title: "Domestic Shipping",
    description: "Fast and reliable nationwide delivery with real-time tracking. Same-day and next-day options available for urgent shipments.",
    icon: Truck,
    image: "/images/service-domestic.jpg",
  },
  {
    title: "International Freight",
    description: "Seamless cross-border logistics to 190+ countries. Customs clearance and documentation handled by our expert team.",
    icon: Globe,
    image: "/images/service-international.jpg",
  },
  {
    title: "Air Cargo",
    description: "Express air freight for time-critical shipments. Priority handling and guaranteed delivery windows worldwide.",
    icon: Plane,
    image: "/images/service-air.jpg",
  },
  {
    title: "Ocean Freight",
    description: "Cost-effective sea cargo solutions for large shipments. FCL and LCL options with port-to-port and door-to-door service.",
    icon: Ship,
    image: "/images/service-ocean.jpg",
  },
  {
    title: "Rail Transport",
    description: "Efficient overland freight via rail networks. Ideal for heavy cargo across continental routes.",
    icon: Train,
    image: "/images/service-rail.jpg",
  },
  {
    title: "Warehousing & Fulfillment",
    description: "Secure storage facilities with inventory management. Pick, pack, and ship services for e-commerce businesses.",
    icon: Warehouse,
    image: "/images/service-warehouse.jpg",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Our Services
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
            Comprehensive Logistics Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From express courier to ocean freight, we offer a complete range of shipping 
            and logistics services tailored to your business needs.
          </p>
        </AnimatedSection>

        {/* Services Grid */}
        <StaggerWrapper className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <motion.div key={service.title} variants={fadeInUp}>
              <ServiceCard
                title={service.title}
                description={service.description}
                icon={service.icon}
                image={service.image}
              />
            </motion.div>
          ))}
        </StaggerWrapper>
      </div>
    </section>
  );
}
