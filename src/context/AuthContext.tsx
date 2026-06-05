import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RiderProfile } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  riderProfile: RiderProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUserInContext: (userData: User) => void;
  setRiderProfileInContext: (profile: RiderProfile | null) => void;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('raahi_token'));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('raahi_user') ? JSON.parse(localStorage.getItem('raahi_user')!) : null
  );
  const [riderProfile, setRiderProfile] = useState<RiderProfile | null>(
    localStorage.getItem('raahi_rider') ? JSON.parse(localStorage.getItem('raahi_rider')!) : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Perform initial profile lookup on page load
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setRiderProfile(data.riderProfile);
        localStorage.setItem('raahi_user', JSON.stringify(data.user));
        if (data.riderProfile) {
          localStorage.setItem('raahi_rider', JSON.stringify(data.riderProfile));
        } else {
          localStorage.removeItem('raahi_rider');
        }
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (err) {
      console.error('Failed to resolve profile reference on boot:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (jwtToken: string, userData: User) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('raahi_token', jwtToken);
    localStorage.setItem('raahi_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRiderProfile(null);
    localStorage.removeItem('raahi_token');
    localStorage.removeItem('raahi_user');
    localStorage.removeItem('raahi_rider');
  };

  const updateUserInContext = (userData: User) => {
    setUser(userData);
    localStorage.setItem('raahi_user', JSON.stringify(userData));
  };

  const setRiderProfileInContext = (profile: RiderProfile | null) => {
    setRiderProfile(profile);
    if (profile) {
      localStorage.setItem('raahi_rider', JSON.stringify(profile));
    } else {
      localStorage.removeItem('raahi_rider');
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        riderProfile,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUserInContext,
        setRiderProfileInContext,
        fetchProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be mounted inside an AuthProvider wrapper');
  }
  return context;
};
