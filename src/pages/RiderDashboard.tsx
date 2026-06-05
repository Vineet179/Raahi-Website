import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { MapPlaceholder } from '../components/MapPlaceholder';
import { 
  Compass, Upload, CheckCircle2, ShieldAlert, Star, DollarSign, Clock, 
  MapPin, Check, X, ArrowRight, User, Settings, AlertCircle 
} from 'lucide-react';

export const RiderDashboard: React.FC = () => {
  const { token, user, riderProfile, fetchProfile, setRiderProfileInContext } = useAuth();
  const { history, fetchMyBookings, updateStatus } = useBooking();

  // Onboarding Registration fields
  const [aadhaar, setAadhaar] = useState('');
  const [license, setLicense] = useState('');
  const [vehicle, setVehicle] = useState('bike');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');

  // Uploaded paths state
  const [aadhaarFile, setAadhaarFile] = useState('');
  const [licenseFile, setLicenseFile] = useState('');
  const [vehicleFile, setVehicleFile] = useState('');

  const [registering, setRegistering] = useState(false);
  const [fileSubmitting, setFileSubmitting] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  // Active driver states
  const [activeTab, setActiveTab] = useState<'terminal' | 'stats'>('terminal');
  const [online, setOnline] = useState(riderProfile?.isAvailable || false);

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchMyBookings();
    }
  }, [token]);

  useEffect(() => {
    if (riderProfile) {
      setOnline(riderProfile.isAvailable);
    }
  }, [riderProfile]);

  // Handle Mock file upload through express uploads router
  const handleFileUpload = async (e: javaScriptFilesProps, documentKey: 'aadhaar' | 'license' | 'vehicle') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileSubmitting(documentKey);
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (documentKey === 'aadhaar') setAadhaarFile(data.url);
        if (documentKey === 'license') setLicenseFile(data.url);
        if (documentKey === 'vehicle') setVehicleFile(data.url);
      } else {
        alert('File upload failed. Defaulting to mock secure asset links.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFileSubmitting(null);
    }
  };

  const handleDocumentOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhaar || !license || !plate || !model) {
      setRegError('All fields with asterisks are required to onboard a vehicle permit.');
      return;
    }

    setRegistering(true);
    setRegError(null);

    const payload = {
      aadhaarNumber: aadhaar,
      aadhaarDocUrl: aadhaarFile || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80',
      licenseNumber: license,
      licenseDocUrl: licenseFile || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80',
      vehicleType: vehicle,
      model,
      plateNumber: plate,
      color: color || 'Black',
      vehicleDocUrl: vehicleFile || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80'
    };

    try {
      const response = await fetch('/api/riders/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok) {
        setRiderProfileInContext(data.rider);
        fetchProfile();
      } else {
        setRegError(data.message || 'Onboarding failed. Verify coordinates.');
      }
    } catch (err) {
      setRegError('Express server unreachable. Verify network pipeline.');
    } finally {
      setRegistering(false);
    }
  };

  const toggleAvailabilityState = async () => {
    const nextAvailability = !online;
    setOnline(nextAvailability);

    try {
      const response = await fetch('/api/riders/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: nextAvailability })
      });
      if (response.ok) {
        const data = await response.json();
        setRiderProfileInContext(data.rider);
      }
    } catch (err) {
      setOnline(online); // fallback rollback on failure
      console.error(err);
    }
  };

  // Filter incoming pending dispatches matching our vehicle type
  const activeUnassignedRides = history.filter(b => b.status === 'pending' && b.vehicleType === riderProfile?.vehicleDetails.vehicleType);
  const activeAssignedRides = history.filter(b => b.riderId === user?.id && ['accepted', 'arrived', 'ongoing'].includes(b.status));

  // Visual document loader interface
  const isProfileComplete = riderProfile && riderProfile.aadhaarNumber;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50/10">
      
      {/* ⚠️ BANNER FOR DEMO ASSISTANCE: Quick Admin link */}
      <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-left flex items-start space-x-3 text-xs leading-relaxed text-indigo-900">
        <AlertCircle className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold font-display">Developer Sandbox Assistant:</span>
          <p className="mt-0.5">Need to review verification flows instantly? Sign in to the platform utilizing the credentials <b>admin@raahi.com</b> / <b>admin123</b> to open the admin panel and manually approve/reject driver licensing files!</p>
        </div>
      </div>

      {isProfileComplete ? (
        /* ==============================================================
           A. VERIFIED OR PENDING ACTIVE DRIVER DASHBOARD
           ============================================================== */
        <div className="space-y-6">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-gray-150 bg-white p-6 shadow-xs text-left">
            <div className="flex items-center space-x-4">
              <img
                src={user?.avatarUrl}
                className="h-12 w-12 rounded-full border-2 border-emerald-500"
                alt="Driver profile vector"
              />
              <div>
                <h1 className="font-display text-xl font-black text-gray-950 leading-none">Rider: {user?.name}</h1>
                <p className="text-xs text-gray-400 capitalize mt-1 font-semibold">
                  Fleet: {riderProfile.vehicleDetails.color} {riderProfile.vehicleDetails.model} — {riderProfile.vehicleDetails.plateNumber}
                </p>
              </div>
            </div>

            {/* Verification Status Pills */}
            <div className="flex items-center space-x-4 text-xs">
              <div>
                {riderProfile.isVerified === 'pending' && (
                  <span className="rounded-full bg-amber-50 border border-amber-100 px-3 py-1 font-bold text-amber-700 capitalize animate-pulse">
                    ⏳ Verification Review Pending
                  </span>
                )}
                {riderProfile.isVerified === 'rejected' && (
                  <div className="text-right">
                    <span className="rounded-full bg-red-50 border border-red-100 px-3 py-1 font-bold text-red-700 capitalize">
                      ❌ Verification Rejected
                    </span>
                    <p className="text-[9px] text-red-500 mt-1 max-w-xs">{riderProfile.rejectionReason || 'Uploaded documents unclear.'}</p>
                  </div>
                )}
                {riderProfile.isVerified === 'verified' && (
                  <div className="flex items-center space-x-3">
                    {/* Toggle Switch */}
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${online ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {online ? 'ONLINE (ACTIVE)' : 'OFFLINE'}
                      </span>
                      <button
                        onClick={toggleAvailabilityState}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${
                          online ? 'bg-emerald-600' : 'bg-gray-250'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                            online ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* If driver is rejected or seeking document corrections */}
          {riderProfile.isVerified === 'rejected' && (
            <div className="rounded-2xl border border-red-200 bg-red-50/20 p-6 text-left">
              <h3 className="font-display font-black text-red-950 text-sm">Resubmit Corporate Qualifications</h3>
              <p className="text-[11px] text-gray-500">Edit elements below to rectify operational blocks:</p>
              
              <button
                onClick={async () => {
                  // Resets isVerified on the fly or opens editor values
                  setAadhaar('');
                  setLicense('');
                  window.location.reload();
                }}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Reset Verification Fields to Edit
              </button>
            </div>
          )}

          {/* Verified Rider UI Grid Panels */}
          {riderProfile.isVerified === 'verified' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 text-left">
              
              {/* SECTION 1: Active Incoming commuter Match dispatches */}
              <div className="lg:col-span-2 space-y-6">
                
                {activeAssignedRides.length > 0 ? (
                  /* Active run loop in progress! */
                  activeAssignedRides.map((ride) => (
                    <div key={ride.id} className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 text-xs font-semibold">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-emerald-800 font-bold uppercase text-[9px] tracking-wider animate-pulse">
                          Active Cabin Commute Job: {ride.status}
                        </span>
                        <span className="text-gray-400">ID: #{ride.id}</span>
                      </div>

                      {/* Map tracer visualizer for Driver */}
                      <MapPlaceholder pickup={ride.pickupLocation} dropoff={ride.dropoffLocation} status={ride.status} />

                      {/* Client parameters */}
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl bg-gray-50 border border-gray-150 p-4 font-sans text-xs">
                        <div className="space-y-1">
                          <span className="text-gray-400 font-semibold uppercase text-[9px]">Pickup node:</span>
                          <p className="font-bold text-gray-900 capitalize flex items-center leading-none">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600 mr-1 shrink-0" /> {ride.pickupLocation}
                          </p>

                          <span className="block text-gray-400 font-semibold uppercase text-[9px] pt-1">Dropoff node:</span>
                          <p className="font-bold text-gray-900 capitalize flex items-center leading-none">
                            <MapPin className="h-3.5 w-3.5 text-red-500 mr-1 shrink-0" /> {ride.dropoffLocation}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between border-b border-gray-200/60 pb-1.5 pt-0.5">
                            <span className="text-gray-400">Passenger Commuter:</span>
                            <span className="font-bold text-gray-800">{ride.userName}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-gray-200/60 py-1.5">
                            <span className="text-gray-400">Commuter Contact:</span>
                            <span className="font-semibold text-emerald-700 tracking-wider bg-white px-1.5 py-0.5 rounded border border-gray-150">{ride.userPhone}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1.5">
                            <span className="text-gray-400">Customer Bill:</span>
                            <span className="font-black text-emerald-700 text-sm leading-none">₹{ride.fare}</span>
                          </div>
                        </div>
                      </div>

                      {/* Advancing controls for interactive testing */}
                      <div className="mt-6 border-t border-gray-100 pt-4 text-xs font-semibold">
                        <span className="text-gray-400">Advance customer trip loop parameters:</span>
                        
                        <div className="mt-3 flex gap-2">
                          {ride.status === 'accepted' && (
                            <button
                              onClick={() => updateStatus(ride.id, 'arrived')}
                              className="grow rounded-lg bg-indigo-600 py-3 text-white hover:bg-indigo-700 text-center transition"
                            >
                              Arrive at Customer Pickup Area
                            </button>
                          )}
                          {ride.status === 'arrived' && (
                            <button
                              onClick={() => updateStatus(ride.id, 'ongoing')}
                              className="grow rounded-lg bg-emerald-600 py-3 text-white hover:bg-emerald-700 text-center transition"
                            >
                              Start Mountain Trip Transit
                            </button>
                          )}
                          {ride.status === 'ongoing' && (
                            <button
                              onClick={() => updateStatus(ride.id, 'completed')}
                              className="grow rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 text-center transition"
                            >
                              Arrive at Destination & Collect Cash/UPI
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                ) : (
                  /* Waiting for bookings / incoming streams */
                  <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm">
                    <h3 className="font-display font-black text-gray-900 text-base">Incoming Grid Dispatches</h3>
                    <p className="text-xs text-gray-400">Commute matches targeting your mountain vehicle category:</p>

                    {!online ? (
                      <div className="mt-6 border-2 border-dashed border-gray-100 rounded-xl py-8 text-center text-xs text-gray-400 flex flex-col items-center">
                        <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
                        <span>You are currently OFFLINE. Toggle online status above to receive ride requests.</span>
                      </div>
                    ) : activeUnassignedRides.length === 0 ? (
                      <div className="mt-6 border-2 border-dotted border-gray-150 rounded-xl py-10 text-center text-xs text-gray-400 flex flex-col items-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3"></div>
                        <span className="font-medium text-gray-500">Awaiting passenger requests around Pithoragarh...</span>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Switch to client login on another panel to place a booking request instantly!</p>
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        {activeUnassignedRides.map((offer) => (
                          <div key={offer.id} className="rounded-xl border border-emerald-100 bg-emerald-50/15 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="text-xs">
                              <div className="font-bold text-gray-900 leading-none">Commute Order #{offer.id}</div>
                              <p className="text-[11px] text-gray-500 mt-1 flex items-center leading-none">
                                {offer.pickupLocation} <ArrowRight className="h-3 w-3 mx-1 text-emerald-600" /> {offer.dropoffLocation}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-[10px] text-gray-400 font-semibold font-mono">
                                <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">Fare: ₹{offer.fare}</span>
                                <span>Dist: {offer.distanceKm} KM</span>
                                <span>Est Mins: {offer.durationMins} Mins</span>
                              </div>
                            </div>

                            <div className="flex space-x-2 w-full sm:w-auto text-[10px] font-bold shrink-0">
                              <button
                                onClick={() => updateStatus(offer.id, 'accepted')}
                                className="grow sm:grow-0 rounded bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 transition"
                              >
                                Accept Match
                              </button>
                              <button
                                onClick={() => alert('Declined in dispatch list')}
                                className="rounded bg-white border border-gray-200 px-2.5 py-2 text-gray-600 hover:bg-gray-50 transition"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* SECTION 2: Rider stats & review table summary */}
              <div className="space-y-6">
                
                {/* Statistics Box */}
                <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm">
                  <h3 className="font-display font-black text-gray-950 text-sm">Income Metrics Summary</h3>
                  
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl bg-emerald-50/20 border border-emerald-100 p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Total Earnings:</span>
                        <p className="font-display font-display text-2xl font-black text-emerald-700 mt-1">₹{riderProfile.earnings}</p>
                      </div>
                      <div className="rounded bg-emerald-100 p-1.5 text-emerald-700">
                        <DollarSign className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                      <div className="rounded-lg border border-gray-150 p-3.5">
                        <span className="text-gray-400 block pb-1 border-b border-gray-100 mb-1.5">Hours Active:</span>
                        <span className="font-display font-bold text-gray-900">{(riderProfile.totalWorkMinutes / 60).toFixed(1)} hrs</span>
                      </div>
                      <div className="rounded-lg border border-gray-150 p-3.5">
                        <span className="text-gray-400 block pb-1 border-b border-gray-100 mb-1.5">Driver Rank:</span>
                        <span className="font-display font-bold text-gray-950 inline-flex items-center">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-0.5" /> {riderProfile.ratings}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historic review lists */}
                <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm">
                  <h3 className="font-display font-black text-gray-950 text-sm">Passenger Reviews</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Reviews submitted on your mountain runs:</p>

                  <div className="mt-4 space-y-3.5">
                    {history.filter(b => b.riderId === user?.id && b.review).length === 0 ? (
                      <span className="text-xs text-gray-400 block py-4 text-center">No reviews registered under this account yet.</span>
                    ) : (
                      history.filter(b => b.riderId === user?.id && b.review).map((rev) => (
                        <div key={rev.id} className="text-xs border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-gray-900">{rev.userName}</span>
                            <div className="flex items-center text-amber-500 font-bold font-mono">
                              <Star className="h-3 w-3 fill-amber-500 mr-0.5" /> {rev.review?.rating}★
                            </div>
                          </div>
                          <p className="text-gray-500 italic mt-1 leading-right text-[11px]">&quot;{rev.review?.comment}&quot;</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      ) : (
        /* ==============================================================
           B. STEP-BY-STEP DOCUMENT ONBOARDING ENTRANCE (FORM)
           ============================================================== */
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-150 bg-white p-8 shadow-xs text-left">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-100">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black text-gray-950 leading-none">Vehicle Onboarding Permit</h1>
              <p className="mt-1 text-xs text-gray-500">Submit official government licensing cards to start driving.</p>
            </div>
          </div>

          {regError && (
            <div className="mb-6 rounded-lg bg-red-50 p-3 text-xs text-red-600 font-semibold">
              {regError}
            </div>
          )}

          {/* Form wrapper */}
          <form onSubmit={handleDocumentOnboarding} className="space-y-6 text-xs text-gray-700">
            
            {/* Step 1: Aadhaar */}
            <div className="border-b border-gray-100 pb-6 space-y-4">
              <h3 className="font-display font-black text-emerald-800 text-sm">Step 1: Government Identity Card</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold">Aadhaar Number Card (12 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    placeholder="e.g. 1234 5678 9012"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold">Attach Copy Photo (PNG/JPG) *</label>
                  <div className="mt-1 flex items-center space-x-3">
                    <label className="flex cursor-pointer items-center space-x-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 hover:bg-gray-100 transition">
                      <Upload className="h-3.5 w-3.5 text-gray-500" />
                      <span>{fileSubmitting === 'aadhaar' ? 'Uploading..' : 'Select File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'aadhaar')}
                        className="hidden"
                      />
                    </label>
                    {aadhaarFile ? (
                      <span className="text-[10px] font-semibold text-emerald-700 flex items-center">
                        <Check className="h-3.5 w-3.5 mr-0.5 inline" /> Attached
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">No copy attached</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: License info */}
            <div className="border-b border-gray-100 pb-6 space-y-4">
              <h3 className="font-display font-black text-emerald-800 text-sm">Step 2: Driving Permit Card (DL)</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold">DL Number (15 digits/alphanumeric) *</label>
                  <input
                    type="text"
                    required
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    placeholder="e.g. DL-052024009821"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold">Attach DL Front Copy *</label>
                  <div className="mt-1 flex items-center space-x-3">
                    <label className="flex cursor-pointer items-center space-x-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 hover:bg-gray-100 transition">
                      <Upload className="h-3.5 w-3.5 text-gray-500" />
                      <span>{fileSubmitting === 'license' ? 'Uploading..' : 'Select File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'license')}
                        className="hidden"
                      />
                    </label>
                    {licenseFile ? (
                      <span className="text-[10px] font-semibold text-emerald-700 flex items-center">
                        <Check className="h-3.5 w-3.5 mr-0.5 inline" /> Attached
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">No copy attached</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Vehicle Specs */}
            <div className="pb-4 space-y-4">
              <h3 className="font-display font-black text-emerald-800 text-sm">Step 3: Vehicle Parameters & Blue Book RC</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold">Vehicles Category *</label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2.5 outline-none"
                  >
                    <option value="bike">Mountain Motorcycle / Bike (1 passenger seat / sheet)</option>
                    <option value="scooter">Scooty / Scooter (1 passenger seat / sheet)</option>
                    <option value="auto">Local passenger Auto (3 passenger seats / sheets)</option>
                    <option value="cab">Hill Cab / Car / SUV (4 passenger seats / sheets)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold">Model Name (e.g. Royal Enfield Himalayan) *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Hero Splendor Plus"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold">Registration Number plate (UK-05-XXXX) *</label>
                  <input
                    type="text"
                    required
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    placeholder="e.g. UK-05-A-8756"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold">Vehicle Color *</label>
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Matte Gray"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold">Attach RC / Registrations certificate book PDF/Image *</label>
                <div className="mt-2 flex items-center space-x-3">
                  <label className="flex cursor-pointer items-center space-x-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 hover:bg-gray-100 transition">
                    <Upload className="h-3.5 w-3.5 text-gray-500" />
                    <span>{fileSubmitting === 'vehicle' ? 'Uploading..' : 'Select File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'vehicle')}
                      className="hidden"
                    />
                  </label>
                  {vehicleFile ? (
                    <span className="text-[10px] font-semibold text-emerald-700 flex items-center">
                      <Check className="h-3.5 w-3.5 mr-0.5 inline" /> Attached
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400">Attached RC document</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={registering}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-emerald-600 py-3.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <span>{registering ? 'Filing Mountain Permit dossier...' : 'Submit Verification Permit Files'}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

// TypeScript Prop workaround for files helper in plain custom JS
interface javaScriptFilesProps {
  target: {
    files?: FileList | null;
  };
}
