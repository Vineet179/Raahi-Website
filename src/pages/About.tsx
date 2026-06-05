import React from 'react';
import { Link } from 'react-router-dom';
import { Mountain, Users, HeartHandshake, ShieldCheck, Compass } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="bg-gray-50/50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Title Block */}
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">The Raahi Manifesto</span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl font-display">
            Overcoming Mountain Pass Boundaries
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xs text-gray-500 leading-relaxed">
            Pithoragarh is framed by breathtaking heights, steep slopes, and extreme physical topography. However, deep canyons and winding mountain paths also mean local villagers and commuters face extreme transport bottlenecks.
          </p>
        </div>

        {/* Dynamic Image Story */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-gray-150">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
            alt="Pithoragarh Scenic Hills"
            className="h-64 w-full object-cover sm:h-80"
          />
        </div>

        {/* Narrative Flow */}
        <div className="mt-12 space-y-8 text-left text-sm text-gray-600 leading-relaxed">
          <div>
            <h2 className="font-display font-bold text-gray-950 text-lg">Why Raahi Exists</h2>
            <p className="mt-2 text-xs">
              Unlike flat metropolitan landscapes, high-altitude towns like Pithoragarh cannot rely on massive taxi grid flows or generic commercial ride APIs. Commuters here face unpredictable local fares, and young, experienced local riders with vehicles lack a central system to meet riders. 
            </p>
            <p className="mt-2 text-xs">
              Raahi (which translates directly to <b>&quot;Traveler&quot; or &quot;Passerby&quot;</b>) was built by mountain developers to resolve this exactly. We bridge the distance gap, providing secure transport to schools, hospitals, and crossings across the hills of Uttarakhand.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-6 border-t border-gray-100">
            <div className="flex space-x-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-gray-900 text-sm">Empowering Local Livelihoods</h4>
                <p className="mt-1 text-xs text-gray-400">90% of every ride fare is deposited directly with the local driver partners, providing a much-needed financial lift to mountain households in Almora and Pithoragarh regions.</p>
              </div>
            </div>

            <div className="flex space-x-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-gray-900 text-sm">Safety First Culture</h4>
                <p className="mt-1 text-xs text-gray-400">Riders go through manual Aadhaar validation and license checks. Passengers can ride securely knowing their driver is fully certified.</p>
              </div>
            </div>

            <div className="flex space-x-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-gray-900 text-sm">Upfront Calibrated Fares</h4>
                <p className="mt-1 text-xs text-gray-400">Mountain transport shouldn&apos;t have mystery tags. Our custom routing calculates rates before booking begins, so cash or card negotiations are a thing of the past.</p>
              </div>
            </div>

            <div className="flex space-x-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-gray-900 text-sm">Emergency SOS Logs</h4>
                <p className="mt-1 text-xs text-gray-400">All local trips are logged securely to databases. Family members can track active mountain journeys via simple browser panels.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-950 p-6 text-white text-center">
            <h3 className="font-display font-bold text-sm">Join the Raahi Mountain Commute Network today</h3>
            <p className="mt-2 text-xs text-emerald-100/80">Support self-reliance, local transparency, and prompt transportation across Almora, Pithoragarh and surrounding districts.</p>
            <div className="mt-4">
              <Link
                to="/signup"
                className="inline-block rounded-lg bg-white px-4 py-2 text-xs font-semibold text-emerald-900 shadow hover:bg-emerald-50 transition"
              >
                Register an Account
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
