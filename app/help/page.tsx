"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar, FooterSection } from "@/components/homepage";
import { Search, ChevronDown, ChevronUp, Package, Truck, CreditCard, MapPin, FileText, Headphones } from "lucide-react";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Courier Express";

const categories = [
  { icon: Package, name: "Shipping", color: "orange" },
  { icon: Truck, name: "Tracking", color: "blue" },
  { icon: CreditCard, name: "Billing", color: "green" },
  { icon: MapPin, name: "Delivery", color: "purple" },
  { icon: FileText, name: "Documentation", color: "red" },
  { icon: Headphones, name: "Support", color: "yellow" },
];

const faqs = [
  {
    category: "Shipping",
    question: "How do I create a shipment?",
    answer: "You can create a shipment through our admin dashboard. Log in to your account, navigate to the Shipments section, and click 'Create New Shipment'. Fill in the required details including sender, receiver, package information, and service type.",
  },
  {
    category: "Tracking",
    question: "How can I track my shipment?",
    answer: "Visit our tracking page and enter your tracking code. You'll see real-time updates on your shipment's location and status. You can also receive email notifications for major status changes.",
  },
  {
    category: "Shipping",
    question: "What items are prohibited from shipping?",
    answer: "Prohibited items include hazardous materials, illegal substances, perishable goods (unless properly packaged), live animals, and weapons. Please contact our support team for a complete list of restricted items.",
  },
  {
    category: "Billing",
    question: "What payment methods do you accept?",
    answer: "We accept major credit cards (Visa, MasterCard, American Express), bank transfers, and for business accounts, we offer invoice billing with net-30 payment terms.",
  },
  {
    category: "Delivery",
    question: "What are your delivery timeframes?",
    answer: "Delivery times vary by service type: Standard (5-7 business days), Express (2-3 business days), and Overnight (next business day). International shipments may take 7-14 business days depending on the destination.",
  },
  {
    category: "Tracking",
    question: "Why isn't my tracking code working?",
    answer: "Tracking codes may take 24-48 hours to become active after shipment creation. If your code still doesn't work after this period, please contact our support team with your tracking number.",
  },
  {
    category: "Billing",
    question: "How are shipping costs calculated?",
    answer: "Shipping costs are based on package weight, dimensions, origin and destination, service type, and any additional services like insurance or special handling. Use our quote calculator for an instant estimate.",
  },
  {
    category: "Delivery",
    question: "Can I change the delivery address after shipping?",
    answer: "Address changes are possible for most shipments if requested before the package reaches the destination facility. Contact our support team immediately with your tracking number and new address. Additional fees may apply.",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              Help Center
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Find answers to common questions and get the support you need
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-orange-500 text-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() =>
                  setSelectedCategory(selectedCategory === category.name ? null : category.name)
                }
                className={`p-6 rounded-2xl transition-all ${
                  selectedCategory === category.name
                    ? "bg-orange-500 text-white shadow-lg scale-105"
                    : "bg-white hover:shadow-lg"
                }`}
              >
                <category.icon
                  className={`h-8 w-8 mx-auto mb-3 ${
                    selectedCategory === category.name ? "text-white" : "text-orange-600"
                  }`}
                />
                <div
                  className={`font-semibold text-sm ${
                    selectedCategory === category.name ? "text-white" : "text-slate-900"
                  }`}
                >
                  {category.name}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              {selectedCategory
                ? `Showing ${filteredFaqs.length} questions in ${selectedCategory}`
                : `${filteredFaqs.length} questions available`}
            </p>
          </motion.div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm text-orange-600 font-medium mb-1">
                      {faq.category}
                    </div>
                    <div className="text-lg font-semibold text-slate-900">
                      {faq.question}
                    </div>
                  </div>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No results found. Try adjusting your search or category filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our support team is here to assist you 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                <Headphones className="h-5 w-5" />
                Contact Support
              </a>
              <a
                href="/track"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-slate-900 font-semibold rounded-xl border-2 border-gray-200 transition-colors"
              >
                <Package className="h-5 w-5" />
                Track Shipment
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
