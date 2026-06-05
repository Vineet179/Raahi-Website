import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Shared Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';
import { UserDashboard } from './pages/UserDashboard';
import { RiderDashboard } from './pages/RiderDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <div className="flex min-h-screen flex-col justify-between bg-[#fafafa]">
            {/* Header navbar matches context-level portals */}
            <Navbar />

            {/* Core pages router layout */}
            <main className="grow">
              <Routes>
                {/* A. Public Pathways */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* B. Private Commuter Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['user', 'admin']}>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* C. Private Driver Routes */}
                <Route
                  path="/rider"
                  element={
                    <ProtectedRoute allowedRoles={['rider', 'admin']}>
                      <RiderDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* D. Private Administrator Admin boundaries */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* E. Shared Personal Settings */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* F. Fallback catch */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Static geography copyright alignments */}
            <Footer />
          </div>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}
