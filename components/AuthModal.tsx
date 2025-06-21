/// <reference types="vite/client" />
import React, { useState, FormEvent, useEffect, useRef } from 'react';
import type { User } from '../App';
import { GoogleIcon, CloseIcon } from '../constants'; // Removed LinkedInIcon
import { 
  signupWithEmailPassword, 
  loginWithEmailPassword,
  signInWithGoogleIdToken // Updated to use this for actual Google Sign-In
} from '../services/authService';

declare global {
  interface Window {
    google: any;
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleButtonDivRef = useRef<HTMLDivElement>(null);

  const VITE_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleSignInResponse = async (response: any) => {
    setError(null);
    setIsLoading(true);
    try {
      const idToken = response.credential;
      if (!idToken) {
        throw new Error("Google Sign-In did not return a credential.");
      }
      const userData = await signInWithGoogleIdToken(idToken);
      if (userData) {
        onAuthSuccess(userData);
        resetFormFields();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during Google Sign-In.');
      }
      console.error("Google Sign-In frontend error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && VITE_GOOGLE_CLIENT_ID && googleButtonDivRef.current) {
      if (typeof window.google !== 'undefined' && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleSignInResponse,
            ux_mode: 'popup', 
          });
          // Ensure the div is empty before rendering, to avoid duplicate buttons on mode switch
          while (googleButtonDivRef.current.firstChild) {
            googleButtonDivRef.current.removeChild(googleButtonDivRef.current.firstChild);
          }
          window.google.accounts.id.renderButton(
            googleButtonDivRef.current,
            { theme: 'outline', size: 'large', text: authMode === 'login' ? 'signin_with' : 'signup_with' } // Removed width property
          );
        } catch (e) {
            console.error("Error initializing or rendering Google Sign-In button:", e);
            setError("Could not initialize Google Sign-In. Please try again.");
        }
      } else {
        // setError("Google Sign-In library not loaded. Please check your internet connection or try refreshing.");
        // This message will be handled by the conditional rendering below if googleButtonDivRef.current has no children
        console.warn("Google Sign-In library (window.google.accounts.id) not available yet or VITE_GOOGLE_CLIENT_ID missing.");
      }
    } else if (isOpen && !VITE_GOOGLE_CLIENT_ID) {
        setError("Google Client ID is not configured. Google Sign-In is disabled.");
        console.error("VITE_GOOGLE_CLIENT_ID is not set in environment variables.");
    }
  }, [isOpen, authMode, VITE_GOOGLE_CLIENT_ID]); // Rerun when authMode changes to update button text


  const resetFormFields = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  const handleEmailPasswordAuth = async () => {
    setError(null);
    setIsLoading(true);

    try {
      let userData: User | null = null;
      if (!email.includes('@')) {
        setError("Please enter a valid email.");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setIsLoading(false);
        return;
      }

      if (authMode === 'signup') {
        if (password !== confirmPassword) {
          setError("Passwords don't match.");
          setIsLoading(false);
          return;
        }
        if (!name.trim()) {
          setError("Please enter your name for signup.");
          setIsLoading(false);
          return;
        }
        userData = await signupWithEmailPassword(email, password, name);
      } else { // Login
        userData = await loginWithEmailPassword(email, password);
      }

      if (userData) {
        onAuthSuccess(userData);
        resetFormFields();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleEmailPasswordAuth();
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 text-sm";
  const buttonClass = "w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          {authMode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-300 rounded-md text-sm break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 sr-only">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className={inputClass}
                required
                disabled={isLoading}
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className={inputClass}
              required
              disabled={isLoading}
              autoComplete={authMode === 'signup' ? 'new-email' : 'email'}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 sr-only">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={inputClass}
              required
              disabled={isLoading}
              autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>
          {authMode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 sr-only">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className={inputClass}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
          )}
          <button
            type="submit"
            className={`${buttonClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300`}
            disabled={isLoading}
          >
            {isLoading && authMode === 'login' ? 'Logging in...' : 
             isLoading && authMode === 'signup' ? 'Signing up...' : 
             authMode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
          {/* Container for Google Sign-In button */}
          <div ref={googleButtonDivRef} className="flex justify-center [&>iframe]:!w-full [&>div]:!w-full"></div>
           {VITE_GOOGLE_CLIENT_ID && isOpen && !googleButtonDivRef.current?.hasChildNodes() && !isLoading && (
             <p className="text-xs text-center text-gray-500">Loading Google Sign-In...</p>
           )}
           {!VITE_GOOGLE_CLIENT_ID && isOpen && (
            <p className="text-xs text-center text-red-500">Google Sign-In is currently unavailable (client ID missing).</p>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => { 
              setAuthMode(authMode === 'login' ? 'signup' : 'login'); 
              setError(null);
            }}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
          >
            {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;