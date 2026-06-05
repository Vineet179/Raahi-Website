import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, User, ShieldAlert, Compass, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectPath = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your registered email and password.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        
        // Dynamic routing redirect based on role
        if (redirectPath) {
          navigate(redirectPath, { replace: true });
        } else if (data.user.role === 'admin') {
          navigate('/admin');
        } else if (data.user.role === 'rider') {
          navigate('/rider');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Connection to Express gateway failed. Verify sandbox state.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Google Login OAuth Simulation
  const handleGoogleLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'google-rider@gmail.com',
          name: 'Yogesh Pant',
          googleId: 'google_123456789'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Google signup failed');
      }
    } catch (err) {
      setError('Google Sign-in failed to contact backend server');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper autofills for frictionless testing
  const triggerAutofill = (role: 'user' | 'driver' | 'driver-pending' | 'admin') => {
    if (role === 'user') {
      setEmail('user@raahi.com');
      setPassword('user123');
    } else if (role === 'driver') {
      setEmail('driver@raahi.com');
      setPassword('driver123');
    } else if (role === 'driver-pending') {
      setEmail('driver-pending@raahi.com');
      setPassword('pankaj123');
    } else if (role === 'admin') {
      setEmail('admin@raahi.com');
      setPassword('admin123');
    }
    setError(null);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-150 bg-white p-8 shadow-xs">
        
        {/* Title branding header */}
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 shadow-md">
            <LogIn className="h-5 w-5 text-white" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-black text-gray-900 leading-none">Access Raahi Portal</h2>
          <p className="mt-2 text-xs text-gray-500">
            Sign in to book a ride or manage mountain transport queues.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 text-left font-medium">
            {error}
          </div>
        )}

        {/* Credentials Sandbox Helper Panels */}
        <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-4 text-left">
          <div className="flex items-center space-x-1 text-emerald-800">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="font-display font-bold text-xs">Sandbox Demo Autocomplete</span>
          </div>
          <p className="mt-1 text-[10px] text-emerald-600">Choose a direct persona to fill credentials instantly:</p>
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-semibold">
            <button
              onClick={() => triggerAutofill('user')}
              className="flex items-center space-x-1.5 rounded-lg bg-white/80 border border-emerald-100 p-1.5 text-emerald-700 hover:bg-white text-left transition"
            >
              <User className="h-3 w-3 text-emerald-500" />
              <span>Normal Passenger</span>
            </button>
            <button
              onClick={() => triggerAutofill('driver')}
              className="flex items-center space-x-1.5 rounded-lg bg-white/80 border border-emerald-100 p-1.5 text-emerald-700 hover:bg-white text-left transition"
            >
              <Compass className="h-3 w-3 text-emerald-500" />
              <span>Verified Rider</span>
            </button>
            <button
              onClick={() => triggerAutofill('driver-pending')}
              className="flex items-center space-x-1.5 rounded-lg bg-white/80 border border-emerald-100 p-1.5 text-emerald-700 hover:bg-white text-left transition"
            >
              <Compass className="h-3 w-3 text-amber-500" />
              <span>Pending Driver</span>
            </button>
            <button
              onClick={() => triggerAutofill('admin')}
              className="flex items-center space-x-1.5 rounded-lg bg-white/80 border border-emerald-100 p-1.5 text-emerald-700 hover:bg-white text-left transition"
            >
              <ShieldAlert className="h-3 w-3 text-indigo-500" />
              <span>Administrator</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@raahi.com"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your secure portal password"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-emerald-600 py-3 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:bg-gray-400"
          >
            <span>{submitting ? 'Verifying...' : 'Log In Securely'}</span>
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-150"></div>
          <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-semibold uppercase tracking-widest">or continue with</span>
          <div className="flex-grow border-t border-gray-150"></div>
        </div>

        {/* OAuth Buttons */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.61 0 3.05.55 4.19 1.63L19.3 3.6A11.83 11.83 0 0012 1c-4.8 0-8.9 2.76-10.95 6.8l3.75 2.9A7.1 7.1 0 0112 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.82-.07-1.61-.21-2.3H12v4.4h6.5A5.55 5.55 0 0116 18l3.7 2.9c2.1-1.9 3.8-4.8 3.8-8.6z"
            />
            <path
              fill="#FBBC05"
              d="M4.8 14.7a7.14 7.14 0 010-4.4L1 7.4a11.9 11.9 0 000 9.2l3.8-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-.1 7.9-2.9l-3.7-2.9c-1.1.7-2.5 1.1-4.2 1.1A7.1 7.1 0 014.8 14.3L1 17.2C3.1 21.2 7.2 23 12 23z"
            />
          </svg>
          <span>Login with Google Account</span>
        </button>

        <p className="text-center text-xs text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-emerald-600 hover:underline">
            Register as Passenger/Driver
          </Link>
        </p>
      </div>
    </div>
  );
};
