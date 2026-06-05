import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Compass, LogOut, User as UserIcon, ShieldAlert, Car } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-emerald-200 shadow-md">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-display text-xl font-bold tracking-tight text-gray-900">Raahi</span>
                <span className="hidden text-[8px] font-semibold text-emerald-600 block leading-none sm:inline sm:ml-1 uppercase tracking-widest">
                  Pithoragarh
                </span>
              </div>
            </Link>

            {/* Desktop Center Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <Link
                to="/"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/about') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Our Mission
              </Link>
              <Link
                to="/contact"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/contact') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Desktop Right Links (Based on Auth) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Specific Role Link Router */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                {user.role === 'rider' && (
                  <Link
                    to="/rider"
                    className="flex items-center space-x-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>Rider Terminal</span>
                  </Link>
                )}

                {user.role === 'user' && (
                  <Link
                    to="/dashboard"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-emerald-200 hover:bg-emerald-700 transition"
                  >
                    Book a Ride
                  </Link>
                )}

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 border-l border-gray-200 pl-4 py-1 hover:opacity-80 transition"
                >
                  <img
                    className="h-8 w-8 rounded-full border border-gray-200 bg-gray-50 object-cover"
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`}
                    referrerPolicy="no-referrer"
                    alt={user.name}
                  />
                  <div className="text-left text-xs">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="ml-2 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-emerald-200 hover:bg-emerald-700 transition"
                >
                  Become a Rider / Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger button */}
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="border-b border-gray-200 bg-white px-4 pb-4 pt-2 shadow-lg md:hidden">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Our Mission
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Contact
            </Link>

            {isAuthenticated && user ? (
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center space-x-3 px-3 mb-3">
                  <img
                    className="h-10 w-10 rounded-full border border-gray-200"
                    src={user.avatarUrl}
                    referrerPolicy="no-referrer"
                    alt={user.name}
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-indigo-700 hover:bg-indigo-50"
                  >
                    Admin Control Board
                  </Link>
                )}

                {user.role === 'rider' && (
                  <Link
                    to="/rider"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    Rider Terminal
                  </Link>
                )}

                {user.role === 'user' && (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    Book a Ride
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  My Profile Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full rounded-lg border border-gray-200 py-2 text-center text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full rounded-lg bg-emerald-600 py-2 text-center text-base font-medium text-white hover:bg-emerald-700"
                >
                  Register / Driver Onboarding
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
