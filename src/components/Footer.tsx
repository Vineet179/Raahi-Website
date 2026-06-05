import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo & Intro */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 shadow-sm">
                <Car className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-gray-950">Raahi</span>
            </div>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-gray-500">
              Raahi is Pithoragarh&apos;s homegrown full-stack ride and local service booking engine. We connect residents, travelers, and mountain-pass riders across the scenic ridges of Uttarakhand, maximizing driver livelihood self-reliance through digitized, transparent matching.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-gray-900">Platform</h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-900">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-500 hover:text-gray-900">About Our Tech</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-500 hover:text-gray-900">Emergency Support</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-gray-900">Control Hub</h3>
            <ul className="mt-4 space-y-2 text-xs text-gray-500">
              <li className="flex items-center space-x-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Siltham Crossing, Pithoragarh, UK, IN</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>+91 94120 75893</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>support@raahi.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider line */}
        <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400">
          <p>© 2026 Raahi Technologies Pvt. Ltd. Serving the mountains of Pithoragarh, Uttarakhand.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <span className="hover:text-gray-600 cursor-pointer">Privacy Charter</span>
            <span className="hover:text-gray-600 cursor-pointer">Rider Terms</span>
            <span className="hover:text-gray-600 cursor-pointer">Fare Calculator Dictionary</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
