
import React, { useState, FormEvent, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { requestResendVerificationEmail } from '../services/authService';
import { LoadingSpinner } from '../constants';

const RequestVerificationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    if (!email.includes('@')) {
        setError("Please enter a valid email address.");
        setIsLoading(false);
        return;
    }
    try {
      const response = await requestResendVerificationEmail(email);
      setMessage(response.message);
    } catch (err) { // @ts-ignore
      setError(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Resend Verification Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address to receive a new verification link.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-300 rounded-md text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 bg-green-50 text-green-700 border border-green-300 rounded-md text-sm">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300"
            >
              {isLoading && LoadingSpinner}
              {isLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
            Back to Home
          </Link>
           {!message && ( // Only show login link if no success message yet
             <>
                <span className="mx-2 text-gray-400">|</span>
                <button onClick={() => navigate('/')} className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none">
                 Attempt Login
                </button>
            </>
           )}
        </div>
      </div>
    </div>
  );
};

export default RequestVerificationPage;