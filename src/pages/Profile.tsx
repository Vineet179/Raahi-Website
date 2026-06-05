import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, Shield, Check, Save } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, token, updateUserInContext } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setError('Please provide standard inputs for Name and Phone.');
      return;
    }

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, avatarUrl: avatar })
      });

      const data = await response.json();

      if (response.ok) {
        updateUserInContext(data.user);
        setSuccess(true);
        setError(null);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.message || 'Failed to update profile info.');
      }
    } catch (err) {
      setError('Express API server is offline.');
    }
  };

  const randomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="rounded-2xl border border-gray-150 bg-white p-8 shadow-xs text-left">
        <h1 className="font-display text-2xl font-black text-gray-950 leading-none">Your Profile Settings</h1>
        <p className="mt-1 text-xs text-gray-500">Edit your mountain commuter name, avatar seed, and active phone grids.</p>

        {success && (
          <div className="mt-6 flex items-center space-x-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
            <Check className="h-4.5 w-4.5 shrink-0" />
            <span>Profile settings persisted successfully to database!</span>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-3 text-xs text-red-600 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="mt-8 space-y-6 text-xs text-gray-700">
          
          {/* Avatar Edit Section */}
          <div className="flex items-center space-x-6 border-b border-gray-100 pb-6">
            <img
              src={avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Raahi'}
              className="h-16 w-16 rounded-full border-2 border-emerald-500 bg-gray-55"
              alt="Avatar Profile view"
            />
            <div>
              <button
                type="button"
                onClick={randomizeAvatar}
                className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50 text-[10px]"
              >
                Randomize Core Avatar Vector
              </button>
              <p className="mt-1 text-[10px] text-gray-400">Generates unique high-contrast SVGs from Dicebear API.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 text-[11px]">Direct Full Name</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 text-[11px]">Primary Email (Non-Editable)</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                </span>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'N/A'}
                  className="w-full rounded-lg border border-gray-150 bg-gray-50 py-2.5 pl-10 pr-3 cursor-not-allowed text-gray-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 text-[11px]">Phone Coordinate (+91)</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 text-[11px]">Assigned Role</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Shield className="h-4 w-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  disabled
                  value={(user?.role || 'user').toUpperCase()}
                  className="w-full rounded-lg border border-gray-150 bg-gray-50 py-2.5 pl-10 pr-3 cursor-not-allowed font-medium text-gray-500 uppercase font-mono tracking-wider"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-emerald-600 py-3 text-xs font-semibold text-white hover:bg-emerald-700 transition"
          >
            <Save className="h-4 w-4" />
            <span>Persist Changes</span>
          </button>
        </form>
      </div>
    </div>
  );
};
