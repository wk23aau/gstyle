
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-center py-6 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <p className="text-gray-600 text-sm"> 
          &copy; {new Date().getFullYear()} AI CV Maker. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center sm:justify-end space-x-4">
          <Link 
            to="/terms-of-service" 
            className="text-gray-600 hover:text-blue-600 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-sm"
          >
            Terms of Service
          </Link>
          <span className="text-gray-400 text-sm hidden sm:inline">|</span>
          <Link 
            to="/privacy-policy" 
            className="text-gray-600 hover:text-blue-600 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-sm"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-400 text-sm hidden sm:inline">|</span>
          <Link 
            to="/gdpr-consent" 
            className="text-gray-600 hover:text-blue-600 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-sm"
          >
            Data & GDPR
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;