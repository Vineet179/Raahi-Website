/**
 * Production-Ready Mongoose Schema Definitions for Raahi Platform
 * These schemas can be imported directly into a production MongoDB environment.
 */

import mongoose, { Schema, Document } from 'mongoose';

// ==========================================
// 1. User Schema
// ==========================================
export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'user' | 'rider' | 'admin';
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ['user', 'rider', 'admin'], default: 'user' },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// ==========================================
// 2. Rider Vehicle Embedded Schema
// ==========================================
const VehicleSchema = new Schema({
  vehicleType: { type: String, enum: ['bike', 'auto', 'cab', 'scooter'], required: true },
  model: { type: String, required: true },
  plateNumber: { type: String, required: true, unique: true },
  color: { type: String, required: true },
});

// ==========================================
// 3. Rider Schema
// ==========================================
export interface IRiderDocument extends Document {
  user: mongoose.Types.ObjectId;
  aadhaarNumber: string;
  aadhaarDocUrl: string;
  licenseNumber: string;
  licenseDocUrl: string;
  vehicleDetails: {
    vehicleType: 'bike' | 'auto' | 'cab' | 'scooter';
    model: string;
    plateNumber: string;
    color: string;
  };
  vehicleDocUrl: string;
  isVerified: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  isAvailable: boolean;
  ratings: number;
  totalWorkMinutes: number;
  earnings: number;
  createdAt: Date;
  updatedAt: Date;
}

export const RiderSchema = new Schema<IRiderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    aadhaarNumber: { type: String, required: true, trim: true },
    aadhaarDocUrl: { type: String, required: true },
    licenseNumber: { type: String, required: true, trim: true },
    licenseDocUrl: { type: String, required: true },
    vehicleDetails: { type: VehicleSchema, required: true },
    vehicleDocUrl: { type: String, required: true },
    isVerified: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
    rejectionReason: { type: String },
    isAvailable: { type: Boolean, default: false, index: true },
    ratings: { type: Number, default: 5.0 },
    totalWorkMinutes: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ==========================================
// 4. Booking Schema (Embedded Payment & Review)
// ==========================================
export interface IBookingDocument extends Document {
  user: mongoose.Types.ObjectId;
  userName: string;
  userPhone: string;
  rider?: mongoose.Types.ObjectId;
  riderName?: string;
  riderPhone?: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: { lat: number; lng: number };
  dropoffCoords: { lat: number; lng: number };
  vehicleType: 'bike' | 'auto' | 'cab' | 'scooter';
  status: 'pending' | 'accepted' | 'arrived' | 'ongoing' | 'completed' | 'cancelled';
  fare: number;
  distanceKm: number;
  durationMins: number;
  paymentMethod: 'cash' | 'online';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  review?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const BookingSchema = new Schema<IBookingDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    rider: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    riderName: { type: String },
    riderPhone: { type: String },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    pickupCoords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    dropoffCoords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    vehicleType: { type: String, enum: ['bike', 'auto', 'cab', 'scooter'], required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'arrived', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    fare: { type: Number, required: true },
    distanceKm: { type: Number, required: true },
    durationMins: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'online'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// Mongoose Model compile references (optional, depends if Mongo connection is live)
export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
export const RiderModel = mongoose.models.Rider || mongoose.model<IRiderDocument>('Rider', RiderSchema);
export const BookingModel = mongoose.models.Booking || mongoose.model<IBookingDocument>('Booking', BookingSchema);
