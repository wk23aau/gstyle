
import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import UserDashboardPage from './pages/UserDashboardPage'; // Renamed
import AdminDashboardPage from './pages/AdminDashboardPage'; // New import
import ProtectedRoute from './components/ProtectedRoute';

export interface User {
  id?: number | string;
  name: string;
  email?: string;
  google_id?: string;
  role?: 'admin' | 'user'; // Added role
}

// Main layout component
const Layout: React.FC<{
  isLoggedIn: boolean;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}> = ({ isLoggedIn, currentUser, onOpenAuthModal, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onOpenAuthModal={onOpenAuthModal}
        onLogout={onLogout}
      />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <Outlet /> {/* Nested routes will render here */}
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleLoginSuccess = useCallback((userData: User) => {
    console.log("Login success with user data (including role):", userData);
    setIsLoggedIn(true);
    setCurrentUser(userData); // userData should now include 'role' from backend
    setIsAuthModalOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          element={
            <Layout 
              isLoggedIn={isLoggedIn} 
              currentUser={currentUser} 
              onOpenAuthModal={openAuthModal}
              onLogout={handleLogout} 
            />
          }
        >
          <Route path="/" element={<HeroSection />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                {currentUser?.role === 'admin' ? (
                  <AdminDashboardPage currentUser={currentUser} />
                ) : (
                  <UserDashboardPage currentUser={currentUser} />
                )}
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          onAuthSuccess={handleLoginSuccess}
        />
      )}
    </BrowserRouter>
  );
};

export default App;