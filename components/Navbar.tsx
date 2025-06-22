
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../types'; // Updated import

interface NavbarProps {
  isLoggedIn: boolean;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, currentUser, onOpenAuthModal, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'About Us', path: '/about-us' },
    { name: 'Contact Us', path: '/contact-us' },
  ];

  const handleLogoutClick = () => {
    onLogout();
    setIsMobileMenuOpen(false);
    navigate('/'); 
  };
  
  const handleMobileAuthModalOpen = () => {
    onOpenAuthModal();
    setIsMobileMenuOpen(false);
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-medium text-gray-800 hover:text-blue-600 transition-colors">
            AI CV Maker
          </Link>
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-2 sm:space-x-4 items-center">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path} 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                {item.name}
              </Link>
            ))}
            {isLoggedIn && currentUser && (
                 <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    Dashboard
                  </Link>
            )}
            {isLoggedIn ? (
              <>
                <span className="text-gray-700 text-sm font-medium px-3 py-2">
                  Hi, {currentUser?.name?.split(' ')[0] || 'User'}
                </span>
                <button
                  onClick={handleLogoutClick}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Login/Sign Up
              </button>
            )}
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-gray-600 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={handleNavLinkClick}
              >
                {item.name}
              </Link>
            ))}
             {isLoggedIn && currentUser && (
                 <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={handleNavLinkClick}
                  >
                    Dashboard
                  </Link>
            )}
            {isLoggedIn ? (
              <>
                 <span className="text-gray-700 block px-3 py-2 text-base font-medium">
                  Hi, {currentUser?.name?.split(' ')[0] || 'User'}
                </span>
                <button
                  onClick={handleLogoutClick}
                  className="bg-red-500 hover:bg-red-600 text-white block w-full text-left mt-1 px-3 py-2 rounded-md text-base font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleMobileAuthModalOpen}
                className="bg-blue-600 hover:bg-blue-700 text-white block w-full text-left mt-1 px-3 py-2 rounded-md text-base font-medium transition-colors shadow-sm hover:shadow-md"
              >
                Login/Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;