/**
 * Raahi - Shared Type Definitions
 */

export type UserRole = 'user' | 'rider' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  vehicleType: 'bike' | 'auto' | 'cab' | 'scooter';
  model: string;
  plateNumber: string;
  color: string;
}

export interface RiderProfile {
  id: string;
  userId: string;
  aadhaarNumber: string;
  aadhaarDocUrl: string; // Document upload URL
  licenseNumber: string;
  licenseDocUrl: string; // Document upload URL
  vehicleDetails: Vehicle;
  vehicleDocUrl: string; // Document upload URL
  isVerified: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  isAvailable: boolean;
  ratings: number;
  totalWorkMinutes: number;
  earnings: number;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'accepted' | 'arrived' | 'ongoing' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  riderId?: string; // Assigned driver
  riderName?: string;
  riderPhone?: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: { lat: number; lng: number };
  dropoffCoords: { lat: number; lng: number };
  vehicleType: 'bike' | 'auto' | 'cab' | 'scooter';
  status: BookingStatus;
  fare: number;
  distanceKm: number;
  durationMins: number;
  paymentMethod: 'cash' | 'online';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface Analytics {
  totalUsers: number;
  totalRiders: number;
  pendingVerifications: number;
  totalBookings: number;
  totalEarnings: number;
  completedBookings: number;
  activeBookings: number;
}
