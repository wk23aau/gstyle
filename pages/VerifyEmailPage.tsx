import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmailToken } from '../services/authService';
import { DefaultLoadingSpinner } from '../constants';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmailToken(token)
        .then((response) => {
          setStatus('success');
          setMessage(response.message);
        })
        .catch((err) => {
          setStatus('error');
          setMessage(err.message || 'An unknown error occurred during email verification.');
        });
    } else {
      setStatus('error');
      setMessage('Verification token not found in URL.');
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <DefaultLoadingSpinner className="animate-spin h-12 w-12 text-blue-500" />
            <p className="mt-3 text-lg text-gray-700">Verifying your email...</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-2xl font-semibold text-gray-800">Email Verified!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <p className="mt-4">
              You can now close this page or <Link to="/" className="text-blue-600 hover:underline">return to the homepage</Link> to log in.
            </p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-2xl font-semibold text-gray-800">Verification Failed</h2>
            <p className="mt-2 text-red-600">{message}</p>
            <p className="mt-4">
              If the link has expired, you can try to{' '}
              <Link to="/request-verification" className="text-blue-600 hover:underline">
                request a new verification email
              </Link>.
            </p>
            <p className="mt-2">
                Or <Link to="/" className="text-blue-600 hover:underline">return to the homepage</Link>.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmailPage;