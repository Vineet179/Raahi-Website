import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';
import { useAuth } from './AuthContext';

interface BookingEstimate {
  pickup: string;
  dropoff: string;
  distanceKm: number;
  durationMins: number;
  vehicleType: string;
  fare: number;
  coords: {
    pickup: { lat: number; lng: number };
    dropoff: { lat: number; lng: number };
  };
}

interface BookingContextType {
  locations: string[];
  activeBooking: Booking | null;
  history: Booking[];
  isEstimating: boolean;
  estimate: BookingEstimate | null;
  fetchLocations: () => Promise<void>;
  calculateEstimate: (pickup: string, dropoff: string, vehicleType: string) => Promise<BookingEstimate | null>;
  createBookingRequest: (pickup: string, dropoff: string, vehicleType: string, paymentMethod: 'cash' | 'online') => Promise<boolean>;
  fetchMyBookings: () => Promise<void>;
  updateStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  submitRideReview: (bookingId: string, rating: number, comment: string) => Promise<void>;
  clearEstimate: () => void;
  setActiveBooking: (booking: Booking | null) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [locations, setLocations] = useState<string[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [history, setHistory] = useState<Booking[]>([]);
  const [isEstimating, setIsEstimating] = useState<boolean>(false);
  const [estimate, setEstimate] = useState<BookingEstimate | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (token) {
      fetchMyBookings();
    } else {
      setHistory([]);
      setActiveBooking(null);
    }
  }, [token]);

  // Keep polling active booking state or simulate real-time travel
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeBooking && ['accepted', 'arrived', 'ongoing'].includes(activeBooking.status)) {
      interval = setInterval(() => {
        // Automatically fetch bookings to keep synced
        fetchMyBookings();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeBooking]);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/bookings/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations);
      }
    } catch (err) {
      console.error('Failed to query local routes dictionary:', err);
    }
  };

  const calculateEstimate = async (pickup: string, dropoff: string, vehicleType: string): Promise<BookingEstimate | null> => {
    setIsEstimating(true);
    try {
      const response = await fetch('/api/bookings/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pickup, dropoff, vehicleType })
      });
      if (response.ok) {
        const data = await response.json();
        setEstimate(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Failed to estimate route costs:', err);
      return null;
    } finally {
      setIsEstimating(false);
    }
  };

  const createBookingRequest = async (
    pickup: string,
    dropoff: string,
    vehicleType: string,
    paymentMethod: 'cash' | 'online'
  ): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pickupLocation: pickup,
          dropoffLocation: dropoff,
          vehicleType,
          paymentMethod
        })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveBooking(data.booking);
        fetchMyBookings();
        setEstimate(null); // Clear active setup
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to generate local booking request:', err);
      return false;
    }
  };

  const fetchMyBookings = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/bookings/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.bookings);
        
        // Find if there is any active booking in progress
        const activeItem = data.bookings.find((b: Booking) => 
          ['pending', 'accepted', 'arrived', 'ongoing'].includes(b.status)
        );
        if (activeItem) {
          setActiveBooking(activeItem);
        } else if (activeBooking && !data.bookings.find((b: Booking) => b.id === activeBooking.id && ['pending', 'accepted', 'arrived', 'ongoing'].includes(b.status))) {
          // Cleared or matched to completion
          setActiveBooking(null);
        }
      }
    } catch (err) {
      console.error('Failed to update histories:', err);
    }
  };

  const updateStatus = async (bookingId: string, status: BookingStatus) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        const data = await response.json();
        if (activeBooking && activeBooking.id === bookingId) {
          setActiveBooking(data.booking);
        }
        fetchMyBookings();
      }
    } catch (err) {
      console.error('Failed to mutate ride state:', err);
    }
  };

  const submitRideReview = async (bookingId: string, rating: number, comment: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      if (response.ok) {
        fetchMyBookings();
        if (activeBooking && activeBooking.id === bookingId) {
          setActiveBooking(null); // Clear review screen on success
        }
      }
    } catch (err) {
      console.error('Failed to submit passenger review:', err);
    }
  };

  const clearEstimate = () => {
    setEstimate(null);
  };

  return (
    <BookingContext.Provider
      value={{
        locations,
        activeBooking,
        history,
        isEstimating,
        estimate,
        fetchLocations,
        calculateEstimate,
        createBookingRequest,
        fetchMyBookings,
        updateStatus,
        submitRideReview,
        clearEstimate,
        setActiveBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be wrapped under BookingProvider');
  }
  return context;
};
