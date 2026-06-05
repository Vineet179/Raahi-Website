import React, { useState } from 'react';
import { Send, PhoneCall, HelpCircle, MapPin, CheckCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) return;
    setSent(true);
    setName('');
    setEmail('');
    setMsg('');
    setTimeout(() => {
      setSent(false);
    }, 5000);
  };

  return (
    <div className="bg-gray-50/50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">On Call 24/7</span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl font-display">
            Contact Support & Dispatch Hub
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-xs text-gray-500 leading-relaxed">
            Need emergency support on a mountain commute, or have a question about driver partner onboarding? We are active 24/7.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Quick Channels Cards */}
          <div className="rounded-xl border border-gray-150 bg-white p-6 text-left">
            <PhoneCall className="h-6 w-6 text-emerald-600" />
            <h4 className="mt-4 font-display font-bold text-gray-950 text-sm">Call Controls</h4>
            <p className="mt-1 text-xs text-gray-500">Contact our head dispatch team immediately for live routing help.</p>
            <p className="mt-3 font-semibold text-xs text-emerald-700">+91 94120 75893</p>
          </div>

          <div className="rounded-xl border border-gray-150 bg-white p-6 text-left">
            <HelpCircle className="h-6 w-6 text-emerald-600" />
            <h4 className="mt-4 font-display font-bold text-gray-950 text-sm">Email Inquiries</h4>
            <p className="mt-1 text-xs text-gray-500">Submit business partnerships, API inquiries, or driver queries.</p>
            <p className="mt-3 font-semibold text-xs text-emerald-700">support@raahi.com</p>
          </div>

          <div className="rounded-xl border border-gray-150 bg-white p-6 text-left">
            <MapPin className="h-6 w-6 text-emerald-600" />
            <h4 className="mt-4 font-display font-bold text-gray-950 text-sm">Local Office</h4>
            <p className="mt-1 text-xs text-gray-500">Walk into our dispatcher center next to Siltham Crossing.</p>
            <p className="mt-3 font-semibold text-xs text-emerald-700 text-left">Siltham, Pithoragarh, Uttarakhand</p>
          </div>
        </div>

        {/* Contact Form & Map block */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-gray-150 bg-white shadow-xs md:flex">
          {/* Input Panel */}
          <form onSubmit={handleSubmit} className="p-8 md:w-1/2 text-left">
            <h3 className="font-display font-black text-gray-950 text-base">Write Us a Note</h3>
            <p className="mt-1 text-xs text-gray-400">Our support representatives reply within 2 hours.</p>

            {sent && (
              <div className="mt-4 flex items-center space-x-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>Message submitted successfully! We will email you.</span>
              </div>
            )}

            <div className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vineet Joshi"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gautamEmail.com"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Message Content</label>
                <textarea
                  required
                  rows={4}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Tell us how we can assist..."
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-emerald-600 py-3 text-xs font-semibold text-white hover:bg-emerald-700 transition"
              >
                <Send className="h-4 w-4" />
                <span>Submit Query</span>
              </button>
            </div>
          </form>

          {/* Map info banner */}
          <div className="bg-emerald-900 p-8 md:w-1/2 text-white text-left flex flex-col justify-between">
            <div>
              <h4 className="font-display font-black text-emerald-300 text-lg">Pithoragarh Base Hub</h4>
              <p className="mt-4 text-xs text-emerald-100 leading-relaxed">
                Our main technical nodes are established directly along the high-altitude transit points of Pithoragarh, which allows our developers and dispatcher staff to test our routing engines and assist local riders directly.
              </p>
            </div>

            <div className="border-t border-emerald-800 pt-6 mt-8">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Emergency Heli / Ambulance Contact</span>
              <p className="mt-1 text-xs">For medical emergencies along Almora-Pithoragarh highway routes, contact standard public helplines immediately at <b>108</b> / <b>112</b>, or call our control desk.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
