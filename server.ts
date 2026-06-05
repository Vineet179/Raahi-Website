import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authenticateToken, authorizeRoles } from './server/middleware/auth';
import { AuthController, UserController, RiderController, BookingController, AdminController } from './server/controllers';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Debug logger for server APIs
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // CORS headers for flexible sandbox preview
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // ==========================================
  // API ROUTES
  // ==========================================

  // 1. Authentication Endpoints
  app.post('/api/auth/register', AuthController.register as any);
  app.post('/api/auth/login', AuthController.login as any);
  app.post('/api/auth/google', AuthController.googleLogin as any);

  // 2. User & Profile Endpoints (Requires Login)
  app.get('/api/users/profile', authenticateToken as any, UserController.getProfile as any);
  app.put('/api/users/profile', authenticateToken as any, UserController.updateProfile as any);

  // 3. Rider-Specific Endpoints (Requires Login & Rider/Admin validation)
  app.post('/api/riders/verify', authenticateToken as any, authorizeRoles('rider', 'admin') as any, RiderController.submitVerificationDocs as any);
  app.get('/api/riders/dashboard', authenticateToken as any, authorizeRoles('rider', 'admin') as any, RiderController.getDashboardData as any);
  app.put('/api/riders/availability', authenticateToken as any, authorizeRoles('rider', 'admin') as any, RiderController.toggleAvailability as any);

  // 4. Booking Endpoints
  app.get('/api/bookings/locations', BookingController.getLocations as any);
  app.post('/api/bookings/estimate', BookingController.estimateFare as any);
  app.post('/api/bookings/create', authenticateToken as any, BookingController.createBooking as any);
  app.get('/api/bookings/my-bookings', authenticateToken as any, BookingController.getMyBookings as any);
  app.put('/api/bookings/:id/status', authenticateToken as any, BookingController.updateBookingStatus as any);
  app.post('/api/bookings/:id/review', authenticateToken as any, BookingController.submitReview as any);

  // 5. Admin-Specific Endpoints (Requires Admin Verification)
  app.get('/api/admin/analytics', authenticateToken as any, authorizeRoles('admin') as any, AdminController.getAnalytics as any);
  app.get('/api/admin/riders', authenticateToken as any, authorizeRoles('admin') as any, AdminController.getAllRiders as any);
  app.put('/api/admin/riders/:id/verify', authenticateToken as any, authorizeRoles('admin') as any, AdminController.verifyRider as any);
  app.get('/api/admin/bookings', authenticateToken as any, authorizeRoles('admin') as any, AdminController.getAllBookings as any);
  app.get('/api/admin/users', authenticateToken as any, authorizeRoles('admin') as any, AdminController.getAllUsers as any);

  // 6. Direct Mock File Upload Handler (Simulating Multer & Cloudinary safely)
  app.post('/api/uploads', (req, res) => {
    // Generates high-quality Unsplash image URLs to simulate responsive uploads in sandbox preview
    const sampleDocs = [
      'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'
    ];
    const mockUrl = sampleDocs[Math.floor(Math.random() * sampleDocs.length)];
    res.status(200).json({
      message: 'Document uploaded successfully',
      url: mockUrl
    });
  });

  // ==========================================
  // VITE ENGINE INTEGRATION & ASSET SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`Raahi Fullstack MERN Portal Active!`);
    console.log(`Running in Local Development / Workspace sandbox mode`);
    console.log(`Target URL: http://0.0.0.0:${PORT}`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Raahi full-stack platform server', err);
});
