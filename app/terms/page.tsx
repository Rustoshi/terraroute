"use client";

import { motion } from "framer-motion";
import { Navbar, FooterSection } from "@/components/homepage";
import { FileText } from "lucide-react";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Courier Express";

export default function TermsPage() {
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
            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Last updated: January 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="prose prose-lg max-w-none"
          >
            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl mb-12">
              <p className="text-orange-900 font-medium mb-0">
                Please read these Terms of Service carefully before using {COMPANY_NAME}'s services. By accessing or using our services, you agree to be bound by these terms.
              </p>
            </div>

            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By creating an account, placing an order, or using any of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Service Description</h2>
                <p className="text-gray-600 leading-relaxed">
                  {COMPANY_NAME} provides logistics and shipping services, including but not limited to:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>Domestic and international freight forwarding</li>
                  <li>Package tracking and delivery services</li>
                  <li>Warehousing and storage solutions</li>
                  <li>Customs clearance assistance</li>
                  <li>Supply chain management services</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Responsibilities</h2>
                <p className="text-gray-600 leading-relaxed">
                  As a user of our services, you agree to:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>Provide accurate and complete information for all shipments</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not ship prohibited or restricted items</li>
                  <li>Properly package items to prevent damage during transit</li>
                  <li>Pay all applicable fees and charges in a timely manner</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Prohibited Items</h2>
                <p className="text-gray-600 leading-relaxed">
                  The following items are strictly prohibited from shipment:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>Illegal drugs and controlled substances</li>
                  <li>Weapons, firearms, and explosives</li>
                  <li>Hazardous materials and dangerous goods (unless properly declared and approved)</li>
                  <li>Counterfeit goods and items that infringe intellectual property rights</li>
                  <li>Live animals (except as permitted by law and with proper documentation)</li>
                  <li>Human remains</li>
                  <li>Perishable items without proper packaging</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Pricing and Payment</h2>
                <p className="text-gray-600 leading-relaxed">
                  Shipping rates are calculated based on package weight, dimensions, origin, destination, and service type. All prices are subject to change without notice. Payment is due at the time of shipment unless otherwise agreed in writing. We accept major credit cards, bank transfers, and for approved business accounts, invoice billing with net-30 terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Liability and Insurance</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our liability for loss or damage to shipments is limited to the declared value or $100 per package, whichever is less, unless additional insurance is purchased. We are not liable for delays caused by circumstances beyond our control, including but not limited to weather, natural disasters, customs delays, or carrier issues.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Claims and Disputes</h2>
                <p className="text-gray-600 leading-relaxed">
                  Claims for lost or damaged shipments must be filed within 30 days of the scheduled delivery date. All claims must be submitted in writing with supporting documentation. We reserve the right to inspect damaged items before processing claims.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Cancellation and Refunds</h2>
                <p className="text-gray-600 leading-relaxed">
                  Shipments may be cancelled before pickup for a full refund. Once a shipment has been picked up, cancellation fees may apply. Refunds are processed within 5-10 business days to the original payment method.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed">
                  All content on our website and platform, including text, graphics, logos, and software, is the property of {COMPANY_NAME} and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Termination</h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to suspend or terminate your account at any time for violation of these terms, fraudulent activity, or any other reason we deem appropriate. Upon termination, you remain liable for all outstanding charges.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction in which {COMPANY_NAME} operates, without regard to conflict of law principles.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Changes to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services after changes are posted constitutes acceptance of the modified terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed">
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 rounded-xl p-6 mt-4">
                  <p className="text-gray-900 font-medium mb-2">{COMPANY_NAME}</p>
                  <p className="text-gray-600">Email: legal@{COMPANY_NAME.toLowerCase().replace(/\s+/g, '')}.com</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
