import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Compass, HelpCircle } from 'lucide-react';

export const Signup: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'rider'>('user');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'rider') {
      setRole('rider');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError('Please fill in all standard fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, password, role })
      });

      const data = await response.json();

      if (response.ok) {
        // Automatic login on signup
        login(data.token, data.user);
        if (data.user.role === 'rider') {
          navigate('/rider'); // Sends driver directly to upload portal
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Registration failed. Try a different email ID.');
      }
    } catch (err) {
      setError('Express API server unreachable. Please verify server daemon.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-150 bg-white p-8 shadow-xs">
        
        {/* Title Block */}
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 shadow-md">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-black text-gray-900 leading-none">Create Your Account</h2>
          <p className="mt-2 text-xs text-gray-500">
            Sign up to commute, or register your vehicle to start earning.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 text-left font-semibold">
            {error}
          </div>
        )}

        {/* Role Select Toggle Cards */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`flex flex-col rounded-xl border p-4 transition text-left ${
              role === 'user' ? 'border-emerald-600 bg-emerald-50/30' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <User className={`h-5 w-5 ${role === 'user' ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span className="mt-2 font-display text-xs font-bold text-gray-900">Passenger Commuter</span>
            <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">Book quick local rides in Pithoragarh</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('rider')}
            className={`flex flex-col rounded-xl border p-4 transition text-left ${
              role === 'rider' ? 'border-emerald-600 bg-emerald-50/30' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Compass className={`h-5 w-5 ${role === 'rider' ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span className="mt-2 font-display text-xs font-bold text-gray-900">Rider Partner</span>
            <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">Onboard your motorcycle/scooter or cab</span>
          </button>
        </div>

        {role === 'rider' && (
          <div className="rounded-lg bg-amber-50/70 p-3.5 text-left border border-amber-100 text-[11px] text-amber-800 leading-relaxed">
            💡 <b>Mountain Driver Notice:</b> After signing up, you will be directed to submit driving license and vehicle registration logs for rapid Admin verification.
          </div>
        )}

        {/* Form Inputs */}
        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anand Mehra"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anand@mehraExample.com"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Phone Number (+91)</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 94120 75893"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Choose Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 alphanumeric characters"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-emerald-600 py-3 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:bg-gray-400"
          >
            <span>{submitting ? 'Registering...' : 'Complete Register & Sign In'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
            Sign In Instead
          </Link>
        </p>
      </div>
    </div>
  );
};
