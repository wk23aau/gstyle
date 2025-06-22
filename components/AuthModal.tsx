
import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User, SignupResponse } from '../App';
import { GoogleIcon, CloseIcon } from '../constants'; 
import { 
  signupWithEmailPassword, 
  loginWithEmailPassword,
  signInWithGoogleIdToken 
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null); 
  const [showResendVerificationLink, setShowResendVerificationLink] = useState(false);
  const [emailForResend, setEmailForResend] = useState('');

  const googleButtonDivRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const VITE_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleSignInResponse = async (response: any) => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const idToken = response.credential;
      if (!idToken) throw new Error("Google Sign-In did not return a credential.");
      const userData = await signInWithGoogleIdToken(idToken);
      if (userData) {
        onAuthSuccess(userData);
        resetFormFields();
        onClose(); 
      }
    } catch (err) { // @ts-ignore
      setError(err.message || 'An unknown error occurred during Google Sign-In.');
      console.error("Google Sign-In frontend error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
        setError(null);
        setSuccessMessage(null);
        setShowResendVerificationLink(false);
    }
    if (isOpen && VITE_GOOGLE_CLIENT_ID && googleButtonDivRef.current) {
      if (typeof window.google !== 'undefined' && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({ client_id: VITE_GOOGLE_CLIENT_ID, callback: handleGoogleSignInResponse, ux_mode: 'popup' });
          while (googleButtonDivRef.current.firstChild) googleButtonDivRef.current.removeChild(googleButtonDivRef.current.firstChild);
          window.google.accounts.id.renderButton(googleButtonDivRef.current, { theme: 'outline', size: 'large', text: authMode === 'login' ? 'signin_with' : 'signup_with' });
        } catch (e) { console.error("Error initializing Google Sign-In:", e); setError("Could not initialize Google Sign-In."); }
      } else { console.warn("Google Sign-In library not available yet."); }
    } else if (isOpen && !VITE_GOOGLE_CLIENT_ID) { setError("Google Client ID not configured."); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, authMode, VITE_GOOGLE_CLIENT_ID]);

  const resetFormFields = () => { setEmail(''); setPassword(''); setConfirmPassword(''); setName(''); };

  const handleEmailPasswordAuth = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    setShowResendVerificationLink(false);

    try {
      if (!email.includes('@')) throw new Error("Please enter a valid email.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");

      if (authMode === 'signup') {
        if (password !== confirmPassword) throw new Error("Passwords don't match.");
        if (!name.trim()) throw new Error("Please enter your name for signup.");
        
        const response: SignupResponse = await signupWithEmailPassword(email, password, name);
        setSuccessMessage(`${response.message} An email has been sent to ${email}.`);
        resetFormFields(); 
      } else { // Login
        const userData = await loginWithEmailPassword(email, password);
        onAuthSuccess(userData);
        resetFormFields();
        onClose(); 
      }
    } catch (err) { // @ts-ignore
      const errorMessage = err.message || 'An unknown error occurred.';
      setError(errorMessage);
      // @ts-ignore
      if (err.needsVerification && err.emailForResend) {
        setShowResendVerificationLink(true); // @ts-ignore
        setEmailForResend(err.emailForResend);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); handleEmailPasswordAuth(); };

  const handleResendClick = () => {
    onClose(); 
    navigate('/request-verification', { state: { email: emailForResend } }); 
  };

  const handleForgotPasswordClick = () => {
    onClose();
    navigate('/request-password-reset');
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 text-sm";
  const buttonClass = "w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal"><CloseIcon className="w-6 h-6" /></button>
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">{authMode === 'login' ? 'Welcome Back!' : 'Create Your Account'}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-300 rounded-md text-sm break-words">
            {error}
            {showResendVerificationLink && (
              <button onClick={handleResendClick} className="ml-2 text-blue-600 hover:underline font-semibold">
                Resend verification email?
              </button>
            )}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-300 rounded-md text-sm break-words">
            {successMessage}
          </div>
        )}

        {!successMessage && ( 
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 sr-only">Name</label><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className={inputClass} required disabled={isLoading} autoComplete="name"/></div>
              )}
              <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={inputClass} required disabled={isLoading} autoComplete={authMode === 'signup' ? 'new-email' : 'email'}/></div>
              <div><label htmlFor="password" className="block text-sm font-medium text-gray-700 sr-only">Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inputClass} required disabled={isLoading} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}/></div>
              {authMode === 'signup' && (
                <div><label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 sr-only">Confirm Password</label><input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className={inputClass} required disabled={isLoading} autoComplete="new-password"/></div>
              )}
              <button type="submit" className={`${buttonClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300`} disabled={isLoading}>
                {isLoading && authMode === 'login' ? 'Logging in...' : isLoading && authMode === 'signup' ? 'Signing up...' : authMode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>

             {authMode === 'login' && (
                <div className="mt-3 text-right">
                    <button
                        onClick={handleForgotPasswordClick}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
                    >
                        Forgot Password?
                    </button>
                </div>
            )}


            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div><span className="flex-shrink mx-4 text-gray-500 text-sm">Or</span><div className="flex-grow border-t border-gray-300"></div>
            </div>
            <div className="space-y-3">
              <div ref={googleButtonDivRef} className="flex justify-center [&>iframe]:!w-full [&>div]:!w-full"></div>
              {VITE_GOOGLE_CLIENT_ID && isOpen && !googleButtonDivRef.current?.hasChildNodes() && !isLoading && (<p className="text-xs text-center text-gray-500">Loading Google Sign-In...</p>)}
              {!VITE_GOOGLE_CLIENT_ID && isOpen && (<p className="text-xs text-center text-red-500">Google Sign-In is currently unavailable (client ID missing).</p>)}
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => { 
              setAuthMode(authMode === 'login' ? 'signup' : 'login'); 
              setError(null); 
              setSuccessMessage(null);
              setShowResendVerificationLink(false);
            }}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
          >
            {successMessage ? (authMode === 'signup' ? 'Proceed to Login?' : 'Back to form') : (authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
