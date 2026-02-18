"use client";

import { AnimatedSection, StaggerWrapper, fadeInUp } from "../motion";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Courier Express";

const getTestimonials = (companyName: string) => [
  {
    quote: `${companyName} has transformed our supply chain. Their real-time tracking and reliable delivery have helped us reduce shipping costs by 30%.`,
    author: "Sarah Chen",
    role: "Supply Chain Director",
    company: "TechFlow Industries",
    rating: 5,
  },
  {
    quote: "We've been using their international freight services for 3 years. The customs clearance support alone has saved us countless hours.",
    author: "Michael Rodriguez",
    role: "Operations Manager",
    company: "Global Imports Co.",
    rating: 5,
  },
  {
    quote: "Outstanding service! Our e-commerce fulfillment has never been smoother. The team goes above and beyond for every shipment.",
    author: "Emily Watson",
    role: "CEO",
    company: "StyleBox Online",
    rating: 5,
  },
];

const clientLogos = [
  { name: "TechCorp", initials: "TC" },
  { name: "Global Trade", initials: "GT" },
  { name: "Apex Industries", initials: "AI" },
  { name: "Prime Logistics", initials: "PL" },
  { name: "Swift Commerce", initials: "SC" },
  { name: "United Freight", initials: "UF" },
];

export function TestimonialsSection() {
  const testimonials = getTestimonials(COMPANY_NAME);
  
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium mb-6">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            Client Testimonials
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what businesses around the world 
            have to say about partnering with {COMPANY_NAME}.
          </p>
        </AnimatedSection>

        {/* Testimonials Grid */}
        <StaggerWrapper className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              variants={fadeInUp}
              className="relative bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <Quote className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4 pt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-semibold">
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-orange-600">{testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerWrapper>

        {/* Client Logos */}
        <AnimatedSection>
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
              Trusted by leading companies worldwide
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {clientLogos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold">
                  {logo.initials}
                </div>
                <span className="font-semibold hidden sm:inline">{logo.name}</span>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
