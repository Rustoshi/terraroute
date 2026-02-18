"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar, FooterSection } from "@/components/homepage";
import { ChevronDown, Search, Package, Truck, CreditCard, Globe, Shield, HelpCircle } from "lucide-react";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Courier Express";

const faqCategories = [
  {
    icon: Package,
    title: "Shipping & Delivery",
    faqs: [
      {
        question: "What shipping options do you offer?",
        answer: "We offer domestic shipping (standard, express, overnight), international freight (air and ocean), air cargo, ocean freight, and warehousing solutions. Each service has different transit times and pricing to suit your needs.",
      },
      {
        question: "How long does delivery take?",
        answer: "Delivery times vary by service: Standard domestic (3-5 days), Express (1-2 days), Overnight (next day), Air freight (3-7 days), Ocean freight (15-45 days). International times depend on destination and customs clearance.",
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes! We ship to 190+ countries worldwide via air freight and ocean freight. We handle all customs documentation and provide door-to-door service to most destinations.",
      },
      {
        question: "Can I track my shipment?",
        answer: "Absolutely! All shipments include real-time tracking. You'll receive a tracking number via email and can monitor your package 24/7 through our website or mobile app.",
      },
    ],
  },
  {
    icon: CreditCard,
    title: "Pricing & Payments",
    faqs: [
      {
        question: "How is shipping cost calculated?",
        answer: "Shipping costs are based on package weight, dimensions, destination, and service level. Use our online quote calculator for instant pricing, or contact us for volume discounts and custom rates.",
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, Amex), debit cards, PayPal, bank transfers, and corporate accounts. Business customers can apply for net-30 payment terms.",
      },
      {
        question: "Are there any hidden fees?",
        answer: "No hidden fees! Our quotes include all standard charges. Additional fees may apply for special services like Saturday delivery, residential delivery, or customs duties (for international shipments).",
      },
      {
        question: "Do you offer volume discounts?",
        answer: "Yes! We offer competitive rates for high-volume shippers. Contact our sales team to discuss custom pricing based on your shipping volume and frequency.",
      },
    ],
  },
  {
    icon: Globe,
    title: "International Shipping",
    faqs: [
      {
        question: "What documents are needed for international shipping?",
        answer: "Required documents include: Commercial Invoice, Packing List, Bill of Lading/Air Waybill, Certificate of Origin, and any specific permits. Our team assists with all documentation.",
      },
      {
        question: "Who handles customs clearance?",
        answer: "We provide full customs brokerage services. Our experts handle all paperwork, duty calculations, and clearance procedures to ensure smooth delivery.",
      },
      {
        question: "How are customs duties calculated?",
        answer: "Customs duties depend on the product type, value, and destination country. We provide duty estimates before shipping and handle all payments on your behalf if needed.",
      },
      {
        question: "What items cannot be shipped internationally?",
        answer: "Prohibited items include: hazardous materials (without proper certification), weapons, illegal substances, perishables (without proper packaging), and items restricted by destination country laws.",
      },
    ],
  },
  {
    icon: Shield,
    title: "Insurance & Claims",
    faqs: [
      {
        question: "Is my shipment insured?",
        answer: "Basic insurance is included with all shipments (up to $100 for domestic, varies for international). Additional insurance is available for high-value items at competitive rates.",
      },
      {
        question: "How do I file a claim?",
        answer: "File claims through your account dashboard or contact customer service. You'll need your tracking number, proof of value, and photos of damage. Claims are processed within 5-10 business days.",
      },
      {
        question: "What if my package is lost or damaged?",
        answer: "Contact us immediately with your tracking number. We'll investigate and file a claim with the carrier. You'll be reimbursed for the insured value or we'll reship at no charge.",
      },
      {
        question: "Can I purchase additional insurance?",
        answer: "Yes! You can add insurance during checkout or by contacting customer service. Rates are typically 1-3% of declared value, with no maximum limit.",
      },
    ],
  },
  {
    icon: Truck,
    title: "Pickup & Delivery",
    faqs: [
      {
        question: "Do you offer pickup service?",
        answer: "Yes! We offer free pickup for business accounts and scheduled pickups for residential customers. Same-day pickup is available in major cities for an additional fee.",
      },
      {
        question: "What are your delivery hours?",
        answer: "Standard delivery: Monday-Friday, 9 AM - 6 PM. Saturday delivery available for express services. Specific delivery windows can be requested for an additional fee.",
      },
      {
        question: "Can I change the delivery address?",
        answer: "Yes, delivery addresses can be changed before the package is out for delivery. Contact customer service or use the tracking portal to request address changes (fees may apply).",
      },
      {
        question: "What if I'm not home for delivery?",
        answer: "The driver will leave a notice with instructions. You can schedule redelivery, pick up at a local facility, or authorize delivery to a neighbor. Signature requirements vary by service.",
      },
    ],
  },
  {
    icon: HelpCircle,
    title: "Account & Support",
    faqs: [
      {
        question: "How do I create an account?",
        answer: "Click 'Sign Up' in the top right corner, fill in your details, and verify your email. Business accounts require additional documentation for corporate rates and invoicing.",
      },
      {
        question: "How can I contact customer support?",
        answer: "We offer 24/7 support via phone, email, and live chat. Business customers also have dedicated account managers. Check our Contact page for all support options.",
      },
      {
        question: "Can I schedule regular shipments?",
        answer: "Yes! Set up recurring shipments through your account dashboard. You can save addresses, package details, and payment methods for quick booking.",
      },
      {
        question: "Do you have a mobile app?",
        answer: "Yes! Download our mobile app for iOS and Android. Track shipments, get quotes, schedule pickups, and manage your account on the go.",
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (categoryIndex: number, faqIndex: number) => {
    const key = `${categoryIndex}-${faqIndex}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.faqs.length > 0);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Find answers to common questions about our shipping services
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-white text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try a different search term or browse all categories below
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {category.title}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => {
                      const key = `${categoryIndex}-${faqIndex}`;
                      const isOpen = openItems[key];

                      return (
                        <div
                          key={faqIndex}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-orange-300 transition-colors"
                        >
                          <button
                            onClick={() => toggleItem(categoryIndex, faqIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-semibold text-slate-900 pr-4">
                              {faq.question}
                            </span>
                            <ChevronDown
                              className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-4">
                              <p className="text-gray-600 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our support team is here to help 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/help"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-slate-900 font-semibold rounded-xl border-2 border-gray-200 transition-colors"
              >
                Visit Help Center
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
