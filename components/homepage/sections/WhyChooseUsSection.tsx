"use client";

import { AnimatedSection, StaggerWrapper, fadeInUp, slideInLeft, slideInRight } from "../motion";
import { motion } from "framer-motion";
import { 
  Shield, 
  Clock, 
  Headphones, 
  TrendingUp, 
  MapPin, 
  Package,
  CheckCircle
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Fully Insured",
    description: "Comprehensive cargo insurance up to $100,000 per shipment. Your goods are protected from pickup to delivery.",
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description: "GPS-enabled tracking with live updates. Know exactly where your shipment is at any moment.",
  },
  {
    icon: Clock,
    title: "On-Time Guarantee",
    description: "We deliver on schedule or your money back. 99.8% on-time delivery rate across all services.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support team available around the clock. Get help whenever you need it.",
  },
  {
    icon: Package,
    title: "Professional Handling",
    description: "Trained professionals handle your cargo with care. Special handling for fragile and high-value items.",
  },
  {
    icon: TrendingUp,
    title: "Competitive Rates",
    description: "Transparent pricing with no hidden fees. Get the best value for your logistics needs.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image */}
          <AnimatedSection>
            <motion.div variants={slideInLeft} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/brand2.png"
                  alt="Professional logistics team"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              </div>
              
              {/* Floating Stats Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="absolute -bottom-8 -right-8 bg-white rounded-2xl p-6 shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">99.8%</div>
                    <div className="text-sm text-gray-600">Satisfaction Rate</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatedSection>

          {/* Right - Content */}
          <AnimatedSection delay={0.2}>
            <motion.div variants={slideInRight}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-medium mb-6">
                Why {process.env.NEXT_PUBLIC_COMPANY_NAME || "Us"}
              </div>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-4 sm:mb-6">
                Trusted by Businesses of All Sizes
              </h2>
              
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                From startups to Fortune 500 companies, businesses choose us for 
                our reliability, transparency, and commitment to excellence.
              </p>

              {/* Features Grid */}
              <StaggerWrapper className="grid sm:grid-cols-2 gap-6">
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </StaggerWrapper>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
