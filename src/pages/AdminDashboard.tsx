import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Compass, ShieldCheck, DollarSign, Calendar, Eye, 
  Check, X, ChevronRight, FileText, Clock, Trash2, ShieldAlert,
  TrendingUp, BarChart2, PieChart as PieIcon, Landmark, Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DailyTrend {
  date: string;
  label: string;
  bookings: number;
  revenue: number;
  cumulativeRevenue: number;
}

interface VehiclePreference {
  name: string;
  value: number;
}

interface Stats {
  totalUsers: number;
  totalRiders: number;
  pendingVerifications: number;
  totalBookings: number;
  totalEarnings: number;
  completedBookings: number;
  activeBookings: number;
  dailyTrends?: DailyTrend[];
  vehiclePreferences?: VehiclePreference[];
}

const COLORS = ['#10b981', '#34d399', '#3b82f6', '#f59e0b'];

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRiders: 0,
    pendingVerifications: 0,
    totalBookings: 0,
    totalEarnings: 0,
    completedBookings: 0,
    activeBookings: 0,
    dailyTrends: [],
    vehiclePreferences: []
  });

  const [riders, setRiders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'verifications' | 'bookings' | 'users'>('analytics');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // Rejection reason state mapping
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) {
      loadAdminData();
    }
  }, [token]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Load Admin Statistics
      const statRes = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statRes.ok) {
        const statData = await statRes.ok ? await statRes.json() : null;
        if (statData) setStats(statData);
      }

      // 2. Load Riders Queue
      const riderRes = await fetch('/api/admin/riders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (riderRes.ok) {
        const riderData = await riderRes.json();
        setRiders(riderData.riders);
      }

      // 3. Load Bookings List
      const bookingRes = await fetch('/api/admin/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bookingRes.ok) {
        const bookingData = await bookingRes.json();
        setBookings(bookingData.bookings);
      }

      // 4. Load Users List
      const userRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUsers(userData.users);
      }

    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (riderId: string, status: 'verified' | 'rejected') => {
    setMsg(null);
    const reason = rejectionReason[riderId] || '';

    if (status === 'rejected' && !reason) {
      alert('Please specify a rejection reason before rejecting files.');
      return;
    }

    try {
      const response = await fetch(`/api/admin/riders/${riderId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, rejectionReason: reason })
      });

      if (response.ok) {
        setMsg(`Driver listing successfully marked ${status.toUpperCase()}`);
        loadAdminData(); // refresh
      } else {
        const data = await response.json();
        alert(data.message || 'Verification update failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingList = riders.filter(r => r.isVerified === 'pending');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50/10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 pb-6 mb-8">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-950 leading-none">Admin Management Console</h1>
          <p className="mt-1 text-xs text-gray-500">Global dispatcher dashboards, user statistics, and driver permit controls.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={loadAdminData}
            className="rounded-lg bg-white border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            Refresh Global Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400 font-medium">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <span>Loading platform stats directories...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* =======================================================
             1. CORE STATISTICS GRID
             ======================================================= */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 text-left">
            
            <div className="rounded-xl border border-gray-150 bg-white p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Commuters</span>
              <p className="font-display text-2xl font-black text-gray-900 mt-1">{stats.totalUsers}</p>
              <div className="text-[9px] text-gray-400 mt-1 flex items-center">
                <Users className="h-3 w-3 mr-1 text-emerald-500 shrink-0" /> Standard passenger nodes
              </div>
            </div>

            <div className="rounded-xl border border-gray-150 bg-white p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400">Awaiting Permits</span>
              <p className="font-display text-2xl font-black text-amber-600 mt-1">{stats.pendingVerifications}</p>
              <div className="text-[9px] text-amber-600 mt-1 font-semibold animate-pulse">
                Action required by Desk
              </div>
            </div>

            <div className="rounded-xl border border-gray-150 bg-white p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400">Active Riders</span>
              <p className="font-display text-2xl font-black text-gray-900 mt-1">{stats.totalRiders}</p>
              <div className="text-[9px] text-gray-400 mt-1 flex items-center">
                <Compass className="h-3 w-3 mr-1 text-emerald-500 shrink-0" /> Registered vehicle permits
              </div>
            </div>

            <div className="rounded-xl border border-gray-150 bg-white p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Fare Cashflow</span>
              <p className="font-display text-2xl font-black text-emerald-700 mt-1">₹{stats.totalEarnings}</p>
              <div className="text-[9px] text-gray-400 mt-1 flex items-center">
                <DollarSign className="h-3 w-3 mr-1 text-emerald-500 shrink-0" /> Completed trip invoices
              </div>
            </div>

            <div className="rounded-xl border border-gray-150 bg-white p-4 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-gray-400">Platform Bookings</span>
              <p className="font-display text-2xl font-black text-gray-900 mt-1">{stats.totalBookings}</p>
              <div className="text-[9px] text-gray-400 mt-1 flex items-center font-mono">
                Active: {stats.activeBookings} | Completed: {stats.completedBookings}
              </div>
            </div>

          </div>

          {msg && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-xs text-indigo-800 font-semibold mb-4">
              ✅ {msg}
            </div>
          )}

          {/* Tab selectors */}
          <div className="border-b border-gray-150 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('analytics'); setMsg(null); }}
              className={`pb-3 transition-colors relative ${
                activeTab === 'analytics' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Analytics Insights 📈
            </button>
            <button
              onClick={() => { setActiveTab('verifications'); setMsg(null); }}
              className={`pb-3 transition-colors relative ${
                activeTab === 'verifications' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Rider Verification Auditing Queue ({pendingList.length})
            </button>
            <button
              onClick={() => { setActiveTab('bookings'); setMsg(null); }}
              className={`pb-3 transition-colors relative ${
                activeTab === 'bookings' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              All Platform Rides ({bookings.length})
            </button>
            <button
              onClick={() => { setActiveTab('users'); setMsg(null); }}
              className={`pb-3 transition-colors relative ${
                activeTab === 'users' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Registered Users Database ({users.length})
            </button>
          </div>

          {/* =======================================================
             2. TAB PANELS CONTENT
             ====================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-4 mb-6">
                  <div>
                    <h3 className="font-display font-black text-gray-950 text-lg flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" /> Operational Metrics & Analytics
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Real-time daily booking counts and total accumulated revenue growth trajectory in Pithoragarh region.</p>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center space-x-2 text-[10px] text-gray-400">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live feedback loop active</span>
                  </div>
                </div>

                {/* Main Charts Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Daily Booking Trends Chart */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center">
                        <BarChart2 className="h-4 w-4 mr-1.5 text-blue-500" /> Daily Booking Trends
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium">Last 8 Days</span>
                    </div>
                    
                    <div className="h-64 w-full">
                      {stats.dailyTrends && stats.dailyTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="label" fontSize={9} tickLine={false} axisLine={false} stroke="#94a3b8" />
                            <YAxis fontSize={9} tickLine={false} axisLine={false} stroke="#94a3b8" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                              labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                            />
                            <Bar dataKey="bookings" name="Bookings Count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">Insufficient timeline data available.</div>
                      )}
                    </div>
                  </div>

                  {/* Total Revenue Growth Chart */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center">
                        <DollarSign className="h-4 w-4 mr-1.5 text-emerald-500" /> Total Revenue Growth (INR)
                      </h4>
                      <span className="text-[10px] text-emerald-600 font-bold">₹{stats.totalEarnings} Total Cashflow</span>
                    </div>
                    
                    <div className="h-64 w-full">
                      {stats.dailyTrends && stats.dailyTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.dailyTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <defs>
                              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="label" fontSize={9} tickLine={false} axisLine={false} stroke="#94a3b8" />
                            <YAxis fontSize={9} tickLine={false} axisLine={false} stroke="#94a3b8" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                              labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                            />
                            <Area type="monotone" dataKey="cumulativeRevenue" name="Cumulative Revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">Insufficient financial data available.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Secondary Analytics Layer */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8 border-t border-gray-100 pt-8">
                  {/* Vehicle preferences chart (Pie chart) */}
                  <div className="md:col-span-6 rounded-xl border border-gray-100 p-5">
                    <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider mb-4 flex items-center">
                      <PieIcon className="h-4 w-4 mr-1.5 text-indigo-500" /> Vehicle Demand Distribution
                    </h4>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="h-48 w-48 shrink-0 relative mx-auto sm:mx-0">
                        {stats.vehiclePreferences && stats.vehiclePreferences.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats.vehiclePreferences}
                                cx="50%"
                                cy="50%"
                                innerRadius={42}
                                outerRadius={68}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {stats.vehiclePreferences.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ fontSize: '10px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : null}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent pointer-events-none">
                          <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Most Active</span>
                          <span className="text-sm font-black text-gray-950">
                            {stats.vehiclePreferences && stats.vehiclePreferences.length > 0 ? [...stats.vehiclePreferences].sort((a,b) => b.value - a.value)[0]?.name : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="grow space-y-2 select-none w-full sm:w-auto">
                        {stats.vehiclePreferences ? stats.vehiclePreferences.map((pref, idx) => (
                          <div key={pref.name} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg border border-transparent hover:border-gray-50 hover:bg-gray-50/50 transition duration-150">
                            <div className="flex items-center space-x-2">
                              <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                              <span className="font-medium text-gray-600">{pref.name}</span>
                            </div>
                            <span className="font-bold text-gray-900">{pref.value} bookings</span>
                          </div>
                        )) : null}
                      </div>
                    </div>
                  </div>

                  {/* Pithoragarh Area Transport Performance Summaries */}
                  <div className="md:col-span-6 rounded-xl border border-gray-100 p-5 space-y-4">
                    <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center">
                      <Landmark className="h-4 w-4 mr-1.5 text-amber-500" /> Operational & Fleet Invoices Summary
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gray-50/50 p-4 border border-gray-50">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Average Ticket Fare</span>
                        <p className="text-lg font-black text-gray-900 mt-1">
                          ₹{stats.totalBookings > 0 ? Math.round(stats.totalEarnings / stats.totalBookings) : 185}
                        </p>
                        <span className="text-[9px] text-emerald-600 font-semibold mt-1 block">Higher hill tariff active</span>
                      </div>

                      <div className="rounded-lg bg-gray-50/50 p-4 border border-gray-50">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Order Completion Rate</span>
                        <p className="text-lg font-black text-gray-900 mt-1">
                          {stats.totalBookings > 0 ? `${Math.round((stats.completedBookings / stats.totalBookings) * 100)}%` : '88%'}
                        </p>
                        <span className="text-[9px] text-gray-400 block mt-1">Excellent driver matching</span>
                      </div>

                      <div className="rounded-lg bg-gray-50/50 p-4 border border-gray-50">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Top Dispatch Core</span>
                        <p className="text-sm font-black text-gray-800 mt-1.5 max-w-full truncate">
                          Siltham Tiraha
                        </p>
                        <span className="text-[9px] text-gray-450 block mt-0.5 font-sans">Primary grid node</span>
                      </div>

                      <div className="rounded-lg bg-gray-50/50 p-4 border border-gray-50">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Average Driver Rating</span>
                        <p className="text-lg font-black text-amber-600 mt-1 flex items-center">
                          4.9 <Award className="h-4 w-4 ml-1 text-amber-500 fill-amber-400" />
                        </p>
                        <span className="text-[9px] text-emerald-600 font-semibold mt-1 block font-sans">Highly verified profiles</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'verifications' && (
            <div className="space-y-6">
              <h3 className="font-display font-black text-gray-950 text-base">Driver Permit Auditing Desk</h3>
              <p className="text-xs text-gray-400 mt-0.5">Approve licenses and vehicle registrations to unlock driver terminals.</p>

              {pendingList.length === 0 ? (
                <div className="border-2 border-dashed border-gray-150 rounded-2xl py-12 text-center text-xs text-gray-400">
                  <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                  <span className="font-medium text-gray-600">Verification Desk Cleared</span>
                  <p className="text-[10px] text-gray-450 mt-1">No driver partners are currently awaiting permit approvals.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingList.map((rider) => (
                    <div key={rider.id} className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs">
                      
                      {/* Driver Overview Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                        <div className="flex items-center space-x-3 text-xs">
                          <img
                            src={rider.riderAvatar}
                            className="h-10 w-10 rounded-full border border-gray-200"
                            alt="avatar representation"
                          />
                          <div>
                            <div className="font-bold text-gray-900">{rider.riderName}`</div>
                            <p className="text-gray-400 mt-0.5 font-mono">{rider.riderEmail} | {rider.riderPhone}</p>
                          </div>
                        </div>
                        <div className="rounded bg-amber-50 border border-amber-100 font-mono text-[10px] font-bold text-amber-700 px-2 py-0.5 uppercase">
                          Awaiting Document Verification
                        </div>
                      </div>

                      {/* Government Numbers Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-750">
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[9px] block">Aadhaar Verification:</span>
                          <p className="font-semibold text-gray-900 mt-1 font-mono tracking-wider">{rider.aadhaarNumber}</p>
                          <a
                            href={rider.aadhaarDocUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-2 text-[10px] text-indigo-600 font-semibold hover:underline block"
                          >
                            👁️ Click to View Aadhaar Scan Photo
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[9px] block">Driving License (DL):</span>
                          <p className="font-semibold text-gray-900 mt-1 font-mono tracking-wider">{rider.licenseNumber}</p>
                          <a
                            href={rider.licenseDocUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-2 text-[10px] text-indigo-600 font-semibold hover:underline block"
                          >
                            👁️ Click to View DL Scan Photo
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[9px] block">Vehicle Properties (RC):</span>
                          <p className="font-semibold text-gray-900 mt-1 font-mono">
                            Category: <span className="capitalize font-bold">{rider.vehicleDetails?.vehicleType}</span> <br/>
                            Model: {rider.vehicleDetails?.model} <br/>
                            Plate: {rider.vehicleDetails?.plateNumber} | Color: {rider.vehicleDetails?.color}
                          </p>
                          <a
                            href={rider.vehicleDocUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-2 text-[10px] text-indigo-600 font-semibold hover:underline block"
                          >
                            👁️ Click to View RC Blue Book copy
                          </a>
                        </div>
                      </div>

                      {/* Audit Actions Panel */}
                      <div className="mt-6 border-t border-gray-100 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-semibold">
                        <div className="grow max-w-sm">
                          <input
                            type="text"
                            placeholder="Specify rejection reason if declining permit..."
                            value={rejectionReason[rider.id] || ''}
                            onChange={(e) => setRejectionReason({ ...rejectionReason, [rider.id]: e.target.value })}
                            className="w-full rounded-lg border border-gray-250 bg-gray-50 px-3 py-2 text-xs outline-none focus:bg-white"
                          />
                        </div>

                        <div className="flex space-x-2 shrink-0">
                          <button
                            onClick={() => handleVerify(rider.id, 'verified')}
                            className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-white hover:bg-emerald-700 transition"
                          >
                            <Check className="h-4 w-4" />
                            <span>Approve & Verify Permits</span>
                          </button>
                          <button
                            onClick={() => handleVerify(rider.id, 'rejected')}
                            className="flex items-center space-x-1.5 rounded-lg border border-red-200 bg-red-50 text-red-650 hover:bg-red-100 transition"
                          >
                            <X className="h-4 w-4" />
                            <span>Reject resubmit</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h3 className="font-display font-black text-gray-950 text-base">Global Queue Commutes History</h3>
              <p className="text-xs text-gray-400 mt-0.5">Historic audit traces of everything matching Almora-Pithoragarh grids:</p>

              <div className="rounded-2xl border border-gray-150 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 p-4 font-semibold text-gray-400 uppercase text-[9px] tracking-wider">
                      <th className="p-4">Customer Commuter</th>
                      <th className="p-4">Assigned Rider</th>
                      <th className="p-4">Pick/drop Route Nodes</th>
                      <th className="p-4">Cost Tariff</th>
                      <th className="p-4">Trip Stage</th>
                      <th className="p-4">Rider Ratings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/40">
                        <td className="p-4 font-semibold text-gray-900">
                          {b.userName} <br/>
                          <span className="text-[10px] text-gray-400 font-mono font-normal">{b.userPhone}</span>
                        </td>
                        <td className="p-4">
                          {b.riderId ? (
                            <span className="font-semibold text-gray-800">
                              {b.riderName} <br/>
                              <span className="text-[10px] text-gray-400 font-mono font-normal">{b.riderPhone}</span>
                            </span>
                          ) : (
                            <span className="italic text-gray-400">Unassigned Search</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-800 capitalize">{b.pickupLocation}</div>
                          <div className="text-[10px] text-gray-400 flex items-center capitalize mt-0.5">
                            <ChevronRight className="h-3 w-3 text-emerald-500 mr-0.5 shrink-0" /> {b.dropoffLocation}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-gray-900">₹{b.fare}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            b.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                            b.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 font-semibold font-mono text-amber-500">
                          {b.review ? `${b.review.rating}★` : 'No reviews'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="font-display font-black text-gray-950 text-base">Raahi Internal Users Directory</h3>
              <p className="text-xs text-gray-400 mt-0.5">Directory list of riders, customers, and administrator credentials saved securely:</p>

              <div className="rounded-2xl border border-gray-150 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 p-4 font-semibold text-gray-400 uppercase text-[9px] tracking-wider">
                      <th className="p-4">Name Profile</th>
                      <th className="p-4">Email ID Address</th>
                      <th className="p-4">Phone Grids</th>
                      <th className="p-4">Permissions Level</th>
                      <th className="p-4 font-mono text-[9px]">UUID Coordinates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/40">
                        <td className="p-4 flex items-center space-x-3 font-semibold text-gray-900">
                          <img
                            src={item.avatarUrl}
                            className="h-8 w-8 rounded-full border border-gray-200"
                            alt="representation details avatar"
                          />
                          <span>{item.name}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-650">{item.email}</td>
                        <td className="p-4 text-gray-700">{item.phone}</td>
                        <td className="p-4 uppercase">
                          <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                            item.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' :
                            item.role === 'rider' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[10px] text-gray-400">{item.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
