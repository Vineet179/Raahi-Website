import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { MapPlaceholder } from '../components/MapPlaceholder';
import { 
  Car, Eye, Moon, Star, MapPin, Compass, Shield, ArrowRight, CheckCircle, 
  Trash2, Landmark, DollarSign, Clock, Phone, FileText, Sparkles 
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { 
    locations, activeBooking, history, isEstimating, estimate,
    calculateEstimate, createBookingRequest, updateStatus, submitRideReview, clearEstimate
  } = useBooking();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [vehicle, setVehicle] = useState('bike');
  const [payMethod, setPayMethod] = useState<'cash' | 'online'>('cash');
  const [err, setErr] = useState<string | null>(null);

  // Review System inputs
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Handle estimation lookup when parameters shift
  useEffect(() => {
    if (pickup && dropoff && pickup !== dropoff) {
      calculateEstimate(pickup, dropoff, vehicle);
    } else {
      clearEstimate();
    }
  }, [pickup, dropoff, vehicle]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !dropoff) {
      setErr('Please select valid pickup and dropoff nodes.');
      return;
    }
    if (pickup === dropoff) {
      setErr('Pickup and dropoff nodes cannot match.');
      return;
    }

    setErr(null);
    const success = await createBookingRequest(pickup, dropoff, vehicle, payMethod);
    if (!success) {
      setErr('Failed to complete dispatch query. Verify driver and try again.');
    } else {
      // Clear scheduling selectors
      setPickup('');
      setDropoff('');
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;
    await submitRideReview(activeBooking.id, rating, comment);
    // Reset review form
    setRating(5);
    setComment('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50/10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* LEFT / CENTER COLUMN: Scheduling OR Active Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeBooking ? (
            /* ==============================================
               1. ACTIVE TELEMETRY PANEL
               ============================================== */
            <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800 uppercase tracking-widest animate-pulse">
                    Ride Dispatch State: {activeBooking.status}
                  </span>
                  <h2 className="mt-2 text-xl font-display font-black text-gray-900 leading-none">
                    Commute in Progress
                  </h2>
                </div>
                <div className="mt-2 sm:mt-0 font-mono text-[11px] font-bold text-gray-400">
                  ID: #{activeBooking.id}
                </div>
              </div>

              {/* Dynamic Coordinate Map */}
              <MapPlaceholder 
                pickup={activeBooking.pickupLocation} 
                dropoff={activeBooking.dropoffLocation} 
                status={activeBooking.status} 
              />

              {/* Driver Credentials Card */}
              {activeBooking.riderId ? (
                <div className="mt-6 rounded-xl bg-gray-50 border border-gray-150 p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(activeBooking.riderName || 'Raahi')}`}
                      className="h-11 w-11 rounded-full border border-gray-200 bg-white"
                      alt="Driver avatar"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-display text-sm font-bold text-gray-900">{activeBooking.riderName}</span>
                        <span className="flex items-center text-[10px] text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                          <Star className="h-2.5 w-2.5 fill-amber-500 shrink-0 mr-0.5" /> 4.8
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">Driver Contact: {activeBooking.riderPhone}</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white select-all font-mono">
                        {activeBooking.vehicleType.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry updates */}
                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-200/50 pt-4 text-xs">
                    <div>
                      <span className="text-gray-400">Estimated Cost:</span>
                      <p className="font-display font-bold text-emerald-700 text-sm">₹{activeBooking.fare}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Mountain Distance:</span>
                      <p className="font-display font-bold text-gray-900 text-sm">{activeBooking.distanceKm} KM</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl bg-amber-50/70 border border-amber-100 p-4 text-center">
                  <Compass className="mx-auto h-8 w-8 animate-spin text-amber-600" />
                  <p className="mt-2 font-display font-bold text-xs text-amber-800">Dispatching ride request across local grid...</p>
                  <p className="mt-0.5 text-[10px] text-gray-500 leading-tight">We are searching for certified riders whose vehicles match. Check in a few seconds!</p>
                  
                  {/* Cancel button override */}
                  <button
                    onClick={() => updateStatus(activeBooking.id, 'cancelled')}
                    className="mt-4 rounded-lg bg-white border border-amber-200 px-3 py-1.5 text-[10px] font-bold text-amber-900 hover:bg-amber-100 transition"
                  >
                    Cancel Request
                  </button>
                </div>
              )}

              {/* Ride cycle Simulation buttons */}
              {activeBooking.status !== 'completed' && activeBooking.status !== 'cancelled' && (
                <div className="mt-6 rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                  <div className="flex items-center space-x-2 text-indigo-800">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span className="font-display font-bold text-xs">Sandbox Telemetry Controls</span>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500 leading-tight">Simulate driver advancement milestones in real-time:</p>
                  
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold">
                    <button
                      onClick={() => updateStatus(activeBooking.id, 'accepted')}
                      className="rounded bg-indigo-600 px-2.5 py-1.5 text-white hover:bg-indigo-700"
                    >
                      Assign Driver
                    </button>
                    <button
                      onClick={() => updateStatus(activeBooking.id, 'arrived')}
                      className="rounded bg-indigo-600 px-2.5 py-1.5 text-white hover:bg-indigo-700"
                    >
                      Driver Arrived
                    </button>
                    <button
                      onClick={() => updateStatus(activeBooking.id, 'ongoing')}
                      className="rounded bg-emerald-600 px-2.5 py-1.5 text-white hover:bg-emerald-700"
                    >
                      Start Mountain Trip (Moving Map!)
                    </button>
                    <button
                      onClick={() => updateStatus(activeBooking.id, 'completed')}
                      className="rounded bg-indigo-900 px-2.5 py-1.5 text-white hover:bg-indigo-950"
                    >
                      Arrive & Resolve Journey
                    </button>
                  </div>
                </div>
              )}

              {/* Trip Feedback review screen */}
              {activeBooking.status === 'completed' && (
                <form onSubmit={handleRatingSubmit} className="mt-6 border-t border-gray-150 pt-6">
                  <h3 className="font-display font-black text-gray-950 text-sm">Review Your Mountain Trip</h3>
                  <p className="text-[10px] text-gray-400">Leave stars and comments to help verify local driver ranks.</p>
                  
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-xs font-semibold text-gray-700">Star Rating:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-amber-400 hover:scale-110 transition"
                        >
                          <Star className={`h-5 w-5 ${star <= rating ? 'fill-amber-400' : 'text-gray-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <textarea
                      required
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="e.g. Prompt and safe ride up the mountain lanes!"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Submit Feedback & Recalculate Driver Ratings
                  </button>
                </form>
              )}

            </div>
          ) : (
            /* ==============================================
               2. COMMUTE SCHEDULING CONSOLE
               ============================================== */
            <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm text-left">
              <h2 className="font-display text-xl font-black text-gray-900 leading-none">Schedule a Commute</h2>
              <p className="mt-1 text-xs text-gray-500">Calculate upfront estimates and dispatch mountain riders securely.</p>

              {err && (
                <div className="mt-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 font-semibold">
                  {err}
                </div>
              )}

              {/* Standard Coordinate Selector Form */}
              <form onSubmit={handleBooking} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700">Origin / Pickup Location</label>
                    <select
                      value={pickup}
                      onChange={(e) => { setPickup(e.target.value); setErr(null); }}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-250 px-2 py-2.5 capitalize outline-none"
                    >
                      <option value="">-- Choose Pickup Node --</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700">Destination / Dropoff Location</label>
                    <select
                      value={dropoff}
                      onChange={(e) => { setDropoff(e.target.value); setErr(null); }}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-250 px-2 py-2.5 capitalize outline-none"
                    >
                      <option value="">-- Choose Dropoff Node --</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fleet Tier selections */}
                <div>
                  <label className="text-xs font-semibold text-gray-700">Choose Mountain Vehicle Fleet Tier (Seat Availability Listed)</label>
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4 text-left">
                    <button
                      type="button"
                      onClick={() => setVehicle('bike')}
                      className={`flex flex-col rounded-lg border p-3 transition ${
                        vehicle === 'bike' ? 'border-emerald-600 bg-emerald-50/20' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-display text-xs font-bold text-gray-900 text-left">Mountain Bike</span>
                      <span className="text-[9px] text-gray-400 mt-0.5">Apache / Pulsar / Bullet</span>
                      <span className="mt-1 text-[10px] font-bold text-emerald-800">1 Seat (Sheet) Available</span>
                      <span className="mt-2 text-[10px] font-extrabold text-emerald-700 bg-emerald-50/50 px-1 py-0.5 rounded text-center w-full">Fastest</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVehicle('scooter')}
                      className={`flex flex-col rounded-lg border p-3 transition ${
                        vehicle === 'scooter' ? 'border-emerald-600 bg-emerald-50/20' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-display text-xs font-bold text-gray-900 text-left">Scooty / Scooter</span>
                      <span className="text-[9px] text-gray-400 mt-0.5">Activa / Destini / Jupiter</span>
                      <span className="mt-1 text-[10px] font-bold text-emerald-800">1 Seat (Sheet) Available</span>
                      <span className="mt-2 text-[10px] font-extrabold text-emerald-700 bg-emerald-50/50 px-1 py-0.5 rounded text-center w-full">Economical</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVehicle('auto')}
                      className={`flex flex-col rounded-lg border p-3 transition ${
                        vehicle === 'auto' ? 'border-emerald-600 bg-emerald-50/20' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-display text-xs font-bold text-gray-900 text-left">Local Passenger Auto</span>
                      <span className="text-[9px] text-gray-400 mt-0.5">Bajaj RE yellow three-wheeler</span>
                      <span className="mt-1 text-[10px] font-bold text-blue-800">3 Seats (Sheets) Available</span>
                      <span className="mt-2 text-[10px] font-extrabold text-emerald-700 bg-blue-50/50 px-1 py-0.5 rounded text-center w-full">Shared cost</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVehicle('cab')}
                      className={`flex flex-col rounded-lg border p-3 transition ${
                        vehicle === 'cab' ? 'border-emerald-600 bg-emerald-50/20' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-display text-xs font-bold text-gray-900 text-left">Hill Cab / Car (SUV)</span>
                      <span className="text-[9px] text-gray-400 mt-0.5">Bolero / Dzire / Alto / Sumo</span>
                      <span className="mt-1 text-[10px] font-bold text-indigo-800">4 Seats (Sheets) Available</span>
                      <span className="mt-2 text-[10px] font-extrabold text-emerald-700 bg-indigo-50/50 px-1 py-0.5 rounded text-center w-full">Luggage Space</span>
                    </button>
                  </div>
                </div>

                {/* Estimate details panel */}
                {estimate ? (
                  <div className="rounded-xl bg-gray-50 border border-gray-150 p-4 font-sans text-xs">
                    <h4 className="font-display font-extrabold text-gray-900 text-xs">Upfront Fare & Vehicle Specifications</h4>
                    
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                      <div>
                        <span className="text-gray-400 block font-medium">Selected Class:</span>
                        <p className="font-display font-black text-gray-900 mt-0.5 text-xs capitalize">
                          {vehicle === 'scooter' ? 'Scooty/Scooter' : vehicle === 'cab' ? 'Hill Cab / Car' : vehicle}
                        </p>
                      </div>
                      <div>
                        <span className="text-emerald-800 font-bold block">Seats Available:</span>
                        <p className="font-display font-black text-blue-700 mt-0.5 text-sm">
                          {vehicle === 'scooter' || vehicle === 'bike' ? '1 Seat (Sheet)' : vehicle === 'auto' ? '3 Seats (Sheets)' : '4 Seats (Sheets)'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Calculated Distance:</span>
                        <p className="font-display font-black text-gray-900 mt-0.5 text-sm">{estimate.distanceKm} KM</p>
                      </div>
                      <div>
                        <span className="text-gray-450 block font-semibold text-emerald-800">Total Upfront Bill:</span>
                        <p className="font-display font-black text-emerald-700 mt-0.5 text-sm">₹{estimate.fare}</p>
                      </div>
                    </div>

                    <p className="mt-3 border-t border-gray-200 pt-2 text-[10px] text-gray-400 leading-tight">
                      * Fares are static and generated on geographic coordinates. Drivers are forbidden from charging any additional mountain tolls or surge values.
                    </p>
                  </div>
                ) : (
                  pickup && dropoff && isEstimating && (
                    <div className="flex items-center space-x-2 py-4 text-xs text-gray-500 font-medium">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                      <span>Calibrating regional mileage fares across Uttarakhand valleys...</span>
                    </div>
                  )
                )}

                {/* Payment Selection & Submission */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="font-semibold text-gray-600">Settlement Method:</span>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="pay"
                        checked={payMethod === 'cash'}
                        onChange={() => setPayMethod('cash')}
                        className="accent-emerald-600"
                      />
                      <span className="font-medium text-gray-700">Cash Settlement</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="pay"
                        checked={payMethod === 'online'}
                        onChange={() => setPayMethod('online')}
                        className="accent-emerald-600"
                      />
                      <span className="font-medium text-gray-700">UPI / Wallet Online</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isEstimating || !estimate}
                    className="w-full sm:w-auto rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-emerald-200 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 transition"
                  >
                    Confirm Booking Request & Dispatch Dispatcher
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==============================================
             3. TRIP HISTORY LOG PANEL
             ============================================== */}
          <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm text-left">
            <h3 className="font-display text-base font-black text-gray-900 leading-none">Your Commute Logs</h3>
            <p className="mt-1 text-xs text-gray-400">Previous journeys across the hills of Kumaon:</p>

            {history.length === 0 ? (
              <div className="mt-6 py-8 border-2 border-dashed border-gray-100 rounded-xl text-center text-xs text-gray-400">
                No archived trip records. Your bookings will appear here.
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-100 font-semibold text-gray-400 uppercase text-[9px] tracking-wider">
                      <th className="py-2.5">Route Timeline</th>
                      <th className="py-2.5">Vehicle Fleet</th>
                      <th className="py-2.5">Trip Cost</th>
                      <th className="py-2.5">Rider Status</th>
                      <th className="py-2.5">Archived Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50">
                        <td className="py-3">
                          <div className="font-medium text-gray-900">{record.pickupLocation}</div>
                          <div className="text-[10px] text-gray-400 flex items-center mt-0.5">
                            <ArrowRight className="h-2.5 w-2.5 text-emerald-500 mr-1" /> {record.dropoffLocation}
                          </div>
                        </td>
                        <td className="py-3 capitalize">
                          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-bold text-gray-600">
                            {record.vehicleType}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-gray-900">₹{record.fare}</td>
                        <td className="py-3 capitalize">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            record.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 
                            record.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3">
                          {record.review ? (
                            <div className="flex items-center space-x-1 font-bold text-amber-500">
                              <Star className="h-3.5 w-3.5 fill-amber-500 shrink-0" />
                              <span>{record.review.rating}★</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400">No Review Left</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Map Reference & Safety Charter */}
        <div className="space-y-6">
          {/* Elevation Reference Grid */}
          {!activeBooking && (
            <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm text-left">
              <h3 className="font-display font-black text-gray-900 text-sm">Interactive Pithoragarh Grid</h3>
              <p className="mt-1 text-[10px] text-gray-450 leading-tight">View regional mountain routes and click points to configure scheduling instantly.</p>
              
              <div className="mt-4">
                <MapPlaceholder 
                  pickup={pickup} 
                  dropoff={dropoff} 
                  interactive={true} 
                  onSelectNode={(name) => {
                    if (!pickup) setPickup(name);
                    else if (!dropoff && name !== pickup) setDropoff(name);
                    else {
                      setPickup(name);
                      setDropoff('');
                    }
                  }}
                />
              </div>
              <p className="mt-2 text-[9px] text-center text-gray-400">💡 <i>Tip: Tap a location circle to select origin, then tap a separate circle for destination.</i></p>
            </div>
          )}

          {/* Local Support Call Board */}
          <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm text-left">
            <h3 className="font-display font-black text-gray-950 text-sm">Kumaon Regional Commute Charter</h3>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">During travel, passengers enjoy several safety standard locks:</p>
            
            <ul className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600">
              <li className="flex space-x-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span className="text-[11px]"><b>Rigorous Background Verification:</b> Driver Aadhaar cards and driver licenses are manually audited by Admin panel.</span>
              </li>
              <li className="flex space-x-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span className="text-[11px]"><b>Fair Tariff Calibration:</b> Tariffs adhere exactly to baseline rates, providing equitable driver income and reasonable client costs.</span>
              </li>
              <li className="flex space-x-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span className="text-[11px]"><b>SOS Control Panel Helplines:</b> Emergency support and heli-grid connections are live 24/7.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
