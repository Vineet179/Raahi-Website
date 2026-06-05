import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel as UM, RiderModel as RM, BookingModel as BM } from './models/mongooseSchemas';

const UserModel = UM as any;
const RiderModel = RM as any;
const BookingModel = BM as any;

const DATA_FILE = path.join(process.cwd(), 'server', 'data-store.json');

// Interface representation matching mongooseSchemas
interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'user' | 'rider' | 'admin';
  avatarUrl: string;
  createdAt: string;
}

interface DbVehicle {
  vehicleType: 'bike' | 'auto' | 'cab' | 'scooter';
  model: string;
  plateNumber: string;
  color: string;
}

interface DbRiderProfile {
  id: string;
  userId: string;
  aadhaarNumber: string;
  aadhaarDocUrl: string;
  licenseNumber: string;
  licenseDocUrl: string;
  vehicleDetails: DbVehicle;
  vehicleDocUrl: string;
  isVerified: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  isAvailable: boolean;
  ratings: number;
  totalWorkMinutes: number;
  earnings: number;
  createdAt: string;
}

interface DbBooking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  riderId?: string;
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
  createdAt: string;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

interface DataSchema {
  users: DbUser[];
  riders: DbRiderProfile[];
  bookings: DbBooking[];
}

// Convert JSON IDs safely and deterministically to valid MongoDB 24-character hex ObjectIDs
function toMongoId(id: string): string {
  if (!id) return id;
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    return id;
  }
  if (id.startsWith('u')) {
    const num = id.slice(1);
    return '0000000000000000000000' + num.padStart(2, '0');
  }
  if (id.startsWith('r')) {
    const num = id.slice(1);
    return '0000000000000000000001' + num.padStart(2, '0');
  }
  if (id.startsWith('b')) {
    const num = id.slice(1);
    return '0000000000000000000002' + num.padStart(2, '0');
  }
  // Safe general fallback
  const hex = Buffer.from(id).toString('hex').slice(0, 24);
  return hex.padEnd(24, '0');
}

// Ensure the directory exists
function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

class Database {
  private data: DataSchema = { users: [], riders: [], bookings: [] };
  private useMongo: boolean = false;

  constructor() {
    // Initial fallback load
    this.load();
    // Initialize MongoDB connect workflow asynchronously
    this.initMongo();
  }

  private async initMongo() {
    const uri = process.env.MONGODB_URI;
    if (uri) {
      try {
        console.log('MongoDB connection string found. Initiating Mongoose cluster client...');
        await mongoose.connect(uri);
        this.useMongo = true;
        console.log('MongoDB connected successfully!');
        await this.syncAndSeedMongo();
      } catch (err) {
        console.error('Failed to connect to MongoDB, falling back to local JSON data storage:', err);
        this.useMongo = false;
      }
    } else {
      console.log('No MONGODB_URI environment variable detected. Running in local JSON storage mode.');
      console.log('Configure MONGODB_URI in settings to activate cloud-hosted MongoDB storage.');
    }
  }

  private async syncAndSeedMongo() {
    try {
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log('Database collections are empty. Seeding MongoDB with fallback data models...');
        
        // Ensure data-store loaded
        this.load();

        // Feed standard users
        for (const u of this.data.users) {
          await UserModel.create({
            _id: new mongoose.Types.ObjectId(toMongoId(u.id)),
            name: u.name,
            email: u.email,
            passwordHash: u.passwordHash,
            phone: u.phone,
            role: u.role,
            avatarUrl: u.avatarUrl,
            createdAt: new Date(u.createdAt)
          });
        }

        // Feed standard riders
        for (const r of this.data.riders) {
          await RiderModel.create({
            _id: new mongoose.Types.ObjectId(toMongoId(r.id)),
            user: new mongoose.Types.ObjectId(toMongoId(r.userId)),
            aadhaarNumber: r.aadhaarNumber,
            aadhaarDocUrl: r.aadhaarDocUrl,
            licenseNumber: r.licenseNumber,
            licenseDocUrl: r.licenseDocUrl,
            vehicleDetails: {
              vehicleType: r.vehicleDetails.vehicleType,
              model: r.vehicleDetails.model,
              plateNumber: r.vehicleDetails.plateNumber,
              color: r.vehicleDetails.color,
            },
            vehicleDocUrl: r.vehicleDocUrl,
            isVerified: r.isVerified,
            isAvailable: r.isAvailable,
            ratings: r.ratings,
            totalWorkMinutes: r.totalWorkMinutes,
            earnings: r.earnings,
            createdAt: new Date(r.createdAt)
          });
        }

        // Feed standard bookings
        for (const b of this.data.bookings) {
          await BookingModel.create({
            _id: new mongoose.Types.ObjectId(toMongoId(b.id)),
            user: new mongoose.Types.ObjectId(toMongoId(b.userId)),
            userName: b.userName,
            userPhone: b.userPhone,
            rider: b.riderId ? new mongoose.Types.ObjectId(toMongoId(b.riderId)) : undefined,
            riderName: b.riderName,
            riderPhone: b.riderPhone,
            pickupLocation: b.pickupLocation,
            dropoffLocation: b.dropoffLocation,
            pickupCoords: b.pickupCoords,
            dropoffCoords: b.dropoffCoords,
            vehicleType: b.vehicleType,
            status: b.status,
            fare: b.fare,
            distanceKm: b.distanceKm,
            durationMins: b.durationMins,
            paymentMethod: b.paymentMethod,
            paymentStatus: b.paymentStatus,
            review: b.review ? {
              rating: b.review.rating,
              comment: b.review.comment,
              createdAt: new Date(b.review.createdAt)
            } : undefined,
            createdAt: new Date(b.createdAt)
          });
        }
        console.log('MongoDB Seed operations finished successfully!');
      } else {
        console.log('Datasets detected on cloud cluster, executing sync operation...');
      }

      await this.loadFromMongo();
    } catch (err) {
      console.error('Error during MongoDB sync/seed flow:', err);
    }
  }

  private async loadFromMongo() {
    try {
      const dbUsers = await UserModel.find().sort({ createdAt: 1 });
      const dbRiders = await RiderModel.find().sort({ createdAt: 1 });
      const dbBookings = await BookingModel.find().sort({ createdAt: 1 });

      const users: DbUser[] = dbUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        phone: u.phone,
        role: u.role,
        avatarUrl: u.avatarUrl || '',
        createdAt: u.createdAt ? u.createdAt.toISOString() : new Date().toISOString()
      }));

      const riders: DbRiderProfile[] = dbRiders.map(r => ({
        id: r._id.toString(),
        userId: r.user.toString(),
        aadhaarNumber: r.aadhaarNumber,
        aadhaarDocUrl: r.aadhaarDocUrl,
        licenseNumber: r.licenseNumber,
        licenseDocUrl: r.licenseDocUrl,
        vehicleDetails: {
          vehicleType: r.vehicleDetails.vehicleType,
          model: r.vehicleDetails.model,
          plateNumber: r.vehicleDetails.plateNumber,
          color: r.vehicleDetails.color,
        },
        vehicleDocUrl: r.vehicleDocUrl,
        isVerified: r.isVerified,
        rejectionReason: r.rejectionReason,
        isAvailable: r.isAvailable,
        ratings: r.ratings,
        totalWorkMinutes: r.totalWorkMinutes,
        earnings: r.earnings,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
      }));

      const bookings: DbBooking[] = dbBookings.map(b => ({
        id: b._id.toString(),
        userId: b.user.toString(),
        userName: b.userName,
        userPhone: b.userPhone,
        riderId: b.rider ? b.rider.toString() : undefined,
        riderName: b.riderName,
        riderPhone: b.riderPhone,
        pickupLocation: b.pickupLocation,
        dropoffLocation: b.dropoffLocation,
        pickupCoords: b.pickupCoords,
        dropoffCoords: b.dropoffCoords,
        vehicleType: b.vehicleType,
        status: b.status,
        fare: b.fare,
        distanceKm: b.distanceKm,
        durationMins: b.durationMins,
        paymentMethod: b.paymentMethod,
        paymentStatus: b.paymentStatus,
        review: b.review ? {
          rating: b.review.rating,
          comment: b.review.comment,
          createdAt: b.review.createdAt ? b.review.createdAt.toISOString() : new Date().toISOString()
        } : undefined,
        createdAt: b.createdAt ? b.createdAt.toISOString() : new Date().toISOString()
      }));

      this.data = { users, riders, bookings };
      console.log(`Synchronization OK! Loaded: ${users.length} Users, ${riders.length} Riders, ${bookings.length} Bookings.`);
    } catch (err) {
      console.error('Error fetching datasets from MongoDB client:', err);
    }
  }

  private load() {
    try {
      ensureDirectoryExistence(DATA_FILE);
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.seedInitialData();
      }
    } catch (error) {
      console.error('Error loading local database, seeding standard structure instead:', error);
      this.seedInitialData();
    }
  }

  private save() {
    try {
      ensureDirectoryExistence(DATA_FILE);
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving data to database file:', error);
    }
  }

  private seedInitialData() {
    console.log('Seeding initial full-stack database tables for Raahi (Pithoragarh)...');
    
    // Hash passwords synchronously on boot seed
    const passwordHashAdmin = bcrypt.hashSync('admin123', 10);

    const users: DbUser[] = [
      {
        id: 'u4',
        name: 'Devendra Pandey (Admin)',
        email: 'admin@raahi.com',
        passwordHash: passwordHashAdmin,
        phone: '+91 94111 88320',
        role: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date().toISOString()
      }
    ];

    const riders: DbRiderProfile[] = [];
    const bookings: DbBooking[] = [];

    this.data = { users, riders, bookings };
    this.save();
  }

  // Helper APIs to fetch standard DB entries
  getUsers() {
    return this.data.users;
  }

  getRiders() {
    return this.data.riders;
  }

  getBookings() {
    return this.data.bookings;
  }

  addUser(user: DbUser) {
    const mongoIdHex = new mongoose.Types.ObjectId();
    user.id = mongoIdHex.toString();

    this.data.users.push(user);
    this.save();

    if (this.useMongo) {
      UserModel.create({
        _id: mongoIdHex,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: new Date(user.createdAt)
      }).catch(err => console.error('MongoDB async User.create failed:', err));
    }

    return user;
  }

  updateUser(id: string, updates: Partial<DbUser>) {
    const user = this.data.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates);
      this.save();

      if (this.useMongo) {
        UserModel.findByIdAndUpdate(toMongoId(id), { $set: updates })
          .catch(err => console.error('MongoDB async User update failed:', err));
      }
    }
    return user;
  }

  addRider(rider: DbRiderProfile) {
    const mongoIdHex = new mongoose.Types.ObjectId();
    rider.id = mongoIdHex.toString();

    this.data.riders.push(rider);
    this.save();

    if (this.useMongo) {
      RiderModel.create({
        _id: mongoIdHex,
        user: new mongoose.Types.ObjectId(toMongoId(rider.userId)),
        aadhaarNumber: rider.aadhaarNumber,
        aadhaarDocUrl: rider.aadhaarDocUrl,
        licenseNumber: rider.licenseNumber,
        licenseDocUrl: rider.licenseDocUrl,
        vehicleDetails: {
          vehicleType: rider.vehicleDetails.vehicleType,
          model: rider.vehicleDetails.model,
          plateNumber: rider.vehicleDetails.plateNumber,
          color: rider.vehicleDetails.color,
        },
        vehicleDocUrl: rider.vehicleDocUrl,
        isVerified: rider.isVerified,
        isAvailable: rider.isAvailable,
        ratings: rider.ratings,
        totalWorkMinutes: rider.totalWorkMinutes,
        earnings: rider.earnings,
        createdAt: new Date(rider.createdAt)
      }).catch(err => console.error('MongoDB async Rider.create failed:', err));
    }

    return rider;
  }

  updateRider(id: string, updates: Partial<DbRiderProfile>) {
    const rider = this.data.riders.find(r => r.id === id);
    if (rider) {
      Object.assign(rider, updates);
      this.save();

      if (this.useMongo) {
        const mongoUpdates: any = { ...updates };
        if (updates.userId) {
          mongoUpdates.user = new mongoose.Types.ObjectId(toMongoId(updates.userId));
          delete mongoUpdates.userId;
        }
        RiderModel.findByIdAndUpdate(toMongoId(id), { $set: mongoUpdates })
          .catch(err => console.error('MongoDB async Rider update failed:', err));
      }
    }
    return rider;
  }

  updateRiderByUserId(userId: string, updates: Partial<DbRiderProfile>) {
    const rider = this.data.riders.find(r => r.userId === userId);
    if (rider) {
      Object.assign(rider, updates);
      this.save();

      if (this.useMongo) {
        const mongoUpdates: any = { ...updates };
        if (updates.userId) {
          mongoUpdates.user = new mongoose.Types.ObjectId(toMongoId(updates.userId));
          delete mongoUpdates.userId;
        }
        RiderModel.findOneAndUpdate({ user: new mongoose.Types.ObjectId(toMongoId(userId)) }, { $set: mongoUpdates })
          .catch(err => console.error('MongoDB async Rider update by userId failed:', err));
      }
    }
    return rider;
  }

  addBooking(booking: DbBooking) {
    const mongoIdHex = new mongoose.Types.ObjectId();
    booking.id = mongoIdHex.toString();

    this.data.bookings.push(booking);
    this.save();

    if (this.useMongo) {
      BookingModel.create({
        _id: mongoIdHex,
        user: new mongoose.Types.ObjectId(toMongoId(booking.userId)),
        userName: booking.userName,
        userPhone: booking.userPhone,
        rider: booking.riderId ? new mongoose.Types.ObjectId(toMongoId(booking.riderId)) : undefined,
        riderName: booking.riderName,
        riderPhone: booking.riderPhone,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        pickupCoords: booking.pickupCoords,
        dropoffCoords: booking.dropoffCoords,
        vehicleType: booking.vehicleType,
        status: booking.status,
        fare: booking.fare,
        distanceKm: booking.distanceKm,
        durationMins: booking.durationMins,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        review: booking.review ? {
          rating: booking.review.rating,
          comment: booking.review.comment,
          createdAt: new Date(booking.review.createdAt)
        } : undefined,
        createdAt: new Date(booking.createdAt)
      }).catch(err => console.error('MongoDB async Booking.create failed:', err));
    }

    return booking;
  }

  updateBooking(id: string, updates: Partial<DbBooking>) {
    const booking = this.data.bookings.find(b => b.id === id);
    if (booking) {
      Object.assign(booking, updates);
      this.save();

      if (this.useMongo) {
        const mongoUpdates: any = { ...updates };
        if (updates.userId) {
          mongoUpdates.user = new mongoose.Types.ObjectId(toMongoId(updates.userId));
          delete mongoUpdates.userId;
        }
        if (updates.riderId) {
          mongoUpdates.rider = new mongoose.Types.ObjectId(toMongoId(updates.riderId));
          delete mongoUpdates.riderId;
        }
        BookingModel.findByIdAndUpdate(toMongoId(id), { $set: mongoUpdates })
          .catch(err => console.error('MongoDB async Booking update failed:', err));
      }
    }
    return booking;
  }
}

export const db = new Database();
export default db;
