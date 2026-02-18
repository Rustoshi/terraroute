"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar, FooterSection } from "@/components/homepage";
import { Package, MapPin, Truck, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Courier Express";

interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  packageDetails: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    description: string;
  };
  serviceType: string;
}

export default function QuotePage() {
  const [formData, setFormData] = useState<QuoteFormData>({
    name: "",
    email: "",
    phone: "",
    origin: "",
    destination: "",
    packageDetails: {
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: "cm",
      },
      description: "",
    },
    serviceType: "STANDARD",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [responseMessage, setResponseMessage] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus("success");
        setResponseMessage(data.data.message);
        setEstimatedPrice(data.data.estimatedPrice);
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          origin: "",
          destination: "",
          packageDetails: {
            weight: 0,
            dimensions: {
              length: 0,
              width: 0,
              height: 0,
              unit: "cm",
            },
            description: "",
          },
          serviceType: "STANDARD",
        });
      } else {
        setSubmitStatus("error");
        setResponseMessage(data.error || "Failed to submit quote request");
      }
    } catch (error) {
      setSubmitStatus("error");
      setResponseMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Get a Shipping Quote
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Fill out the form below to receive an instant estimate for your shipment.
              Our team will review and provide a detailed quote within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success/Error Messages */}
          {submitStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl flex items-start gap-4"
            >
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Quote Request Submitted!</h3>
                <p className="text-green-700 mb-2">{responseMessage}</p>
                {estimatedPrice && (
                  <p className="text-green-900 font-semibold">
                    Estimated Price: ${estimatedPrice.toFixed(2)}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {submitStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4"
            >
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Error</h3>
                <p className="text-red-700">{responseMessage}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Shipment Details */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                Shipment Details
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin (City, Country) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="New York, USA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination (City, Country) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="London, UK"
                  />
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                Package Details
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    value={formData.packageDetails.weight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        packageDetails: {
                          ...formData.packageDetails,
                          weight: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="10.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions (L × W × H in cm) *
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.packageDetails.dimensions.length || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          packageDetails: {
                            ...formData.packageDetails,
                            dimensions: {
                              ...formData.packageDetails.dimensions,
                              length: parseFloat(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Length"
                    />
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.packageDetails.dimensions.width || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          packageDetails: {
                            ...formData.packageDetails,
                            dimensions: {
                              ...formData.packageDetails.dimensions,
                              width: parseFloat(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Width"
                    />
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.packageDetails.dimensions.height || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          packageDetails: {
                            ...formData.packageDetails,
                            dimensions: {
                              ...formData.packageDetails.dimensions,
                              height: parseFloat(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Height"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.packageDetails.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        packageDetails: {
                          ...formData.packageDetails,
                          description: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Describe the contents of your package..."
                  />
                </div>
              </div>
            </div>

            {/* Service Type */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-purple-600" />
                </div>
                Service Type
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {["STANDARD", "EXPRESS", "OVERNIGHT"].map((service) => (
                  <label
                    key={service}
                    className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.serviceType === service
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="serviceType"
                      value={service}
                      checked={formData.serviceType === service}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="sr-only"
                    />
                    <span className="font-medium text-gray-900">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-5 w-5" />
                    Get Quote
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
