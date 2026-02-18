"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const footerLinks = {
  services: [
    { name: "Domestic Shipping", href: "/services/domestic" },
    { name: "International Freight", href: "/services/international" },
    { name: "Air Cargo", href: "/services/air" },
    { name: "Ocean Freight", href: "/services/ocean" },
    { name: "Warehousing", href: "/services/warehousing" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "News & Updates", href: "/news" },
    { name: "Partners", href: "/partners" },
    { name: "Sustainability", href: "/sustainability" },
  ],
  support: [
    { name: "Track Shipment", href: "/track" },
    { name: "Get a Quote", href: "/quote" },
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
    { name: "FAQs", href: "/faq" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
];

interface CompanySettings {
  companyName: string;
  officeAddress: string;
  phone: string;
  email: string;
  website?: string;
}

export function FooterSection() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || "Courier Express";

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data);
        }
      })
      .catch((error) => console.error("Failed to fetch settings:", error));
  }, []);

  return (
    <footer id="contact" className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10 rounded-xl bg-white overflow-hidden">
                <NextImage
                  src="/logo.PNG"
                  alt={`${companyName} Logo`}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <span className="text-xl font-bold">{companyName}</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Global logistics solutions connecting businesses to 190+ countries. 
              Fast, reliable, and always on time.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                  <Mail className="h-4 w-4" />
                  {settings.email}
                </a>
              )}
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                  <Phone className="h-4 w-4" />
                  {settings.phone}
                </a>
              )}
              {settings?.officeAddress && (
                <div className="flex items-start gap-3 text-gray-400 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>{settings.officeAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="font-semibold text-white mb-4">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-10 px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <button
                type="submit"
                className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
