import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CalendarRange, Map, Users, TrendingUp, Sparkles, Navigation, Mountain, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800 px-4 py-20 text-white sm:px-6 lg:px-8">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/15 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md">
            <Sparkles className="h-4.5 w-4.5" />
            <span>Pithoragarh&apos;s Primary Local Transit Hub</span>
          </div>

          <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            Raahi connects the hills of <span className="text-emerald-400">Pithoragarh</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-emerald-100 sm:text-lg">
            A fully-digitized MERN-stack booking portal providing rapid mountain-pass bookings, clear upfront local pricing, and certified rider verify-management across Uttarakhand, India.
          </p>

          <div className="mt-10 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : user?.role === 'rider' ? '/rider' : '/dashboard'}
                className="rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-900/30 hover:bg-emerald-400 transition transform hover:-translate-y-0.5"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-900/30 hover:bg-emerald-400 transition transform hover:-translate-y-0.5"
                >
                  Book a Commute (User Login)
                </Link>
                <Link
                  to="/signup?role=rider"
                  className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 px-6 py-3.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-900/30 hover:text-white transition transform hover:-translate-y-0.5"
                >
                  Join as a Rider (Driver Signup)
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mountain Safety & Geography Banner */}
      <section className="mx-auto -mt-6 max-w-6xl px-4 relative z-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-4 rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-gray-900 text-sm">Verified Driver Profiles</h4>
              <p className="mt-1 text-xs text-gray-500 text-left">Aadhaar & license verified by our admin desk before taking trips.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Navigation className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-gray-900 text-sm">Mountain Pass Routing</h4>
              <p className="mt-1 text-xs text-gray-500 text-left">Calibrated specifically for winding hills roads and steep altitudes.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Mountain className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-gray-900 text-sm">Dedicated Hill Fleet</h4>
              <p className="mt-1 text-xs text-gray-500 text-left">Bullet bikes, autos, and scooters chosen for Pithoragarh&apos;s terrain.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Highlight Metrics */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-150 bg-white px-6 py-10 shadow-xs sm:p-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Driving self-sufficiency and accessibility in the Kumaon Region
            </h2>
            <p className="mt-4 text-xs text-gray-500">
              Unlike normal ride services focused on flat mega-cities, Raahi was built inside and for the hill topography of Pithoragarh, offering easy livelihoods to local youths and instant transport to citizens.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-y-8 gap-x-4 border-t border-gray-100 pt-10 sm:grid-cols-4">
            <div>
              <span className="font-display text-3xl font-extrabold text-emerald-600 sm:text-4xl">4.8★</span>
              <p className="mt-2 text-xs font-semibold text-gray-800">Average Driver Rating</p>
              <p className="mt-0.5 text-[10px] text-gray-400">Maintained through verified logs</p>
            </div>
            <div>
              <span className="font-display text-3xl font-extrabold text-emerald-600 sm:text-4xl">₹150+</span>
              <p className="mt-2 text-xs font-semibold text-gray-800">Standard Minimum Fair</p>
              <p className="mt-0.5 text-[10px] text-gray-400">Upfront billing, zero surge hikes</p>
            </div>
            <div>
              <span className="font-display text-3xl font-extrabold text-emerald-600 sm:text-4xl">15 Min</span>
              <p className="mt-2 text-xs font-semibold text-gray-800">Avg. Arrival Time</p>
              <p className="mt-0.5 text-[10px] text-gray-400">Local drivers dispatched instantly</p>
            </div>
            <div>
              <span className="font-display text-3xl font-extrabold text-emerald-600 sm:text-4xl">100%</span>
              <p className="mt-2 text-xs font-semibold text-gray-800">Verified Driver Fleet</p>
              <p className="mt-0.5 text-[10px] text-gray-400">Licensed and vetted background check</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Mountain Routes */}
      <section className="bg-emerald-50/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Commuting made easy across key checkpoints
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-xs text-gray-500">
              Upfront digital rates and transit solutions calibrated for the unique geography of Pithoragarh:
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Scenic Card 1 */}
            <div className="group overflow-hidden rounded-xl bg-white border border-gray-150 hover:shadow-md transition">
              <div className="relative h-44 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80"
                  alt="Chandak Hills"
                  className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
                />
                <span className="absolute bottom-3 left-3 rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                  Hill View Route
                </span>
              </div>
              <div className="p-5 text-left">
                <h4 className="font-display font-extrabold text-gray-900 text-sm">Bus Station ↔ Chandak Hill Temple</h4>
                <p className="mt-2 text-xs text-gray-500">Wind through standard hill slopes up to the peaks of Chandak. Travel distance accounts for specific elevation angles.</p>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px]">
                  <span className="text-gray-400">Avg. Commute Time: 15 mins</span>
                  <span className="font-bold text-emerald-700">₹180 (Bullet Bike)</span>
                </div>
              </div>
            </div>

            {/* Scenic Card 2 */}
            <div className="group overflow-hidden rounded-xl bg-white border border-gray-150 hover:shadow-md transition">
              <div className="relative h-44 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1598977123418-45f04b016823?auto=format&fit=crop&w=400&q=80"
                  alt="Market Town"
                  className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
                />
                <span className="absolute bottom-3 left-3 rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                  Town Transit
                </span>
              </div>
              <div className="p-5 text-left">
                <h4 className="font-display font-extrabold text-gray-900 text-sm">Siltham Tiraha ↔ GIC Road Chowk</h4>
                <p className="mt-2 text-xs text-gray-500">Local intercity travel mapping for teachers, shopkeepers, and students commuting daily across the town blocks.</p>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px]">
                  <span className="text-gray-400">Avg. Commute Time: 8 mins</span>
                  <span className="font-bold text-emerald-700">₹60 (Auto)</span>
                </div>
              </div>
            </div>

            {/* Scenic Card 3 */}
            <div className="group overflow-hidden rounded-xl bg-white border border-gray-150 hover:shadow-md transition">
              <div className="relative h-44 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80"
                  alt="Highways"
                  className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
                />
                <span className="absolute bottom-3 left-3 rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                  Highway Connection
                </span>
              </div>
              <div className="p-5 text-left">
                <h4 className="font-display font-extrabold text-gray-900 text-sm">Bus Station ↔ Wadda Entrance</h4>
                <p className="mt-2 text-xs text-gray-500">Direct transit coverage expanding across mountain highways to suburban corridors with customizable luggage allocations.</p>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px]">
                  <span className="text-gray-400">Avg. Commute Time: 25 mins</span>
                  <span className="font-bold text-emerald-700">₹240 (Cab)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Driver call-to-action */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="overflow-hidden rounded-2xl bg-emerald-900 text-white shadow-xl md:flex">
          <div className="p-8 md:w-3/5 text-left sm:p-12">
            <h3 className="font-display text-2xl font-black sm:text-3xl">Own a Two-Wheeler or Mountain Vehicle in Pithoragarh?</h3>
            <p className="mt-4 text-sm text-emerald-100 leading-relaxed">
              Earn regular income by registering as an official Raahi Driver Partner. Set your own hours, toggle available status on and off with one tap, and unlock transparent local earnings dashboards.
            </p>
            <ul className="mt-6 space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-300 fill-emerald-950 shrink-0" />
                <span>Keep 90% of all customer trip fares</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-300 fill-emerald-950 shrink-0" />
                <span>Transparent verification status under 24 hours</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-300 fill-emerald-950 shrink-0" />
                <span>Secure local cash payments from riders of Uttarakhand</span>
              </li>
            </ul>
            <div className="mt-8">
              <Link
                to="/signup?role=rider"
                className="rounded-lg bg-white px-5 py-3 text-xs font-bold text-emerald-900 shadow-lg hover:bg-emerald-50 transition"
              >
                Launch Onboarding Process
              </Link>
            </div>
          </div>
          <div className="hidden md:block md:w-2/5 md:relative">
            <img
              src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80"
              alt="Bullet Bike rider"
              className="absolute inset-0 h-full w-full object-cover filter brightness-95 transform scale-102"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
