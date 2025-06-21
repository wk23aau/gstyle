import React, { useState, FormEvent } from 'react';
import type { User } from '../App'; // Import User type
import { GoogleIcon, LinkedInIcon, CloseIcon } from '../constants';
import { 
  signupWithEmailPassword, 
  loginWithEmailPassword, 
  loginWithGoogle, 
  loginWithLinkedIn 
} from '../services/authService'; // Import auth service functions

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
  const [name, setName] = useState(''); // For signup name field
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthAction = async (authProvider?: 'Google' | 'LinkedIn' | 'EmailPassword') => {
    setError(null);
    setIsLoading(true);

    try {
      let userData: User | null = null;

      if (authProvider === 'Google') {
        if (!email.includes('@')) {
          setError("Please enter a valid email to simulate Google Sign-In.");
          setIsLoading(false);
          return;
        }
        userData = await loginWithGoogle(email);
      } else if (authProvider === 'LinkedIn') {
         if (!email.includes('@')) {
          setError("Please enter a valid email to simulate LinkedIn Sign-In.");
          setIsLoading(false);
          return;
        }
        userData = await loginWithLinkedIn(email);
      } else { // Email/Password
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
      }

      if (userData) {
        onAuthSuccess(userData);
        // Reset form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
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
    handleAuthAction('EmailPassword');
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 text-sm";
  const buttonClass = "w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const socialButtonClass = "w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors";

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
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-300 rounded-md text-sm">
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
              />
            </div>
          )}
          <button
            type="submit"
            className={`${buttonClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300`}
            disabled={isLoading}
          >
            {isLoading ? (authMode === 'login' ? 'Logging in...' : 'Signing up...') : (authMode === 'login' ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">Or {authMode === 'login' ? 'log in' : 'sign up'} with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
           <p className="text-xs text-gray-500 text-center">For social login simulation, please enter an email above first, then click the social button.</p>
          <button 
            type="button" 
            onClick={() => handleAuthAction('Google')} 
            className={`${socialButtonClass}`}
            disabled={isLoading}
            aria-label="Sign in with Google"
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            Sign {authMode === 'login' ? 'in' : 'up'} with Google
          </button>
          <button 
            type="button" 
            onClick={() => handleAuthAction('LinkedIn')} 
            className={`${socialButtonClass}`}
            disabled={isLoading}
            aria-label="Sign in with LinkedIn"
          >
            <LinkedInIcon className="w-5 h-5 mr-2" />
            Sign {authMode === 'login' ? 'in' : 'up'} with LinkedIn
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => { 
              setAuthMode(authMode === 'login' ? 'signup' : 'login'); 
              setError(null);
              // Optionally clear form fields
              // setEmail('');
              // setPassword('');
              // setConfirmPassword('');
              // setName('');
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
