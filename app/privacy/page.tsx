"use client";

import { motion } from "framer-motion";
import { Navbar, FooterSection } from "@/components/homepage";
import { Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Courier Express";

export default function PrivacyPage() {
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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Privacy Policy
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
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-12">
              <p className="text-blue-900 font-medium mb-0">
                At {COMPANY_NAME}, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
              </p>
            </div>

            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Database className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-0">Information We Collect</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>Personal identification information (name, email address, phone number)</li>
                  <li>Shipping and delivery addresses</li>
                  <li>Payment information (processed securely through third-party payment processors)</li>
                  <li>Shipment details and tracking information</li>
                  <li>Communication preferences and customer service interactions</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-0">How We Use Your Information</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We use the information we collect to:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>Process and deliver your shipments</li>
                  <li>Provide customer support and respond to your inquiries</li>
                  <li>Send you service updates, tracking notifications, and promotional communications</li>
                  <li>Improve our services and develop new features</li>
                  <li>Detect and prevent fraud and ensure platform security</li>
                  <li>Comply with legal obligations and enforce our terms of service</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-0">Data Security</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We implement industry-standard security measures to protect your personal information, including:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure data storage and backup procedures</li>
                  <li>Employee training on data protection and privacy</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-0">Your Rights</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  You have the right to:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Request corrections to inaccurate or incomplete data</li>
                  <li>Request deletion of your personal information (subject to legal requirements)</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Object to certain data processing activities</li>
                  <li>Request data portability</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-0">Information Sharing</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>Service providers who assist in delivering our services (e.g., carriers, payment processors)</li>
                  <li>Business partners with your consent</li>
                  <li>Law enforcement or regulatory authorities when required by law</li>
                  <li>Third parties in connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookies and Tracking</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can control cookie preferences through your browser settings.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Children's Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="bg-gray-50 rounded-xl p-6 mt-4">
                  <p className="text-gray-900 font-medium mb-2">{COMPANY_NAME}</p>
                  <p className="text-gray-600">Email: privacy@{COMPANY_NAME.toLowerCase().replace(/\s+/g, '')}.com</p>
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
