import React, { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal'; // Import the new AuthModal

export interface User {
  id?: number | string; // Optional: Backend might provide an ID
  name: string;
  email?: string; // Optional: Backend might provide an email
}

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
    console.log("Login success with user data:", userData); // For debugging
    setIsLoggedIn(true);
    setCurrentUser(userData);
    setIsAuthModalOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    // Potentially call a backend /api/auth/logout endpoint here in a real app
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onOpenAuthModal={openAuthModal}
        onLogout={handleLogout}
      />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <HeroSection />
      </main>
      <Footer />
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          onAuthSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default App;
