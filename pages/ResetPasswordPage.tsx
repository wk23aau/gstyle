
import React, { useState, FormEvent, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { LoadingSpinner } from '../constants';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('Password reset token not found or invalid. Please request a new one.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await resetPassword(token, newPassword);
      setMessage(response.message);
      // Optionally redirect to login after a delay or on button click
      setTimeout(() => navigate('/'), 3000); // Redirect to home (which might open login modal)
    } catch (err) {
        // @ts-ignore
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) { // If token is still null but no error set yet (e.g. on initial load)
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-xl text-center">
                <p className="text-gray-700">Loading reset token...</p>
            </div>
        </div>
    );
  }


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>
        {!message && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="token" value={token || ''} />
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="new-password" className="sr-only">New Password</label>
                <input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="New Password (min. 6 characters)"
                  disabled={isLoading || !!error || !token}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">Confirm New Password</label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm New Password"
                  disabled={isLoading || !!error || !token}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-300 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !!error || !token || !!message}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300"
              >
                {isLoading && LoadingSpinner}
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
        {message && (
          <div className="p-3 bg-green-50 text-green-700 border border-green-300 rounded-md text-sm text-center">
            {message}
            <p className="mt-2">
              You will be redirected to the homepage shortly.
              Or <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
                click here to login
              </Link>.
            </p>
          </div>
        )}
         {error && !message && ( // Show link to request new token if there was an error and no success
            <div className="text-sm text-center mt-4">
                <Link to="/request-password-reset" className="font-medium text-blue-600 hover:text-blue-500">
                    Request a new password reset link
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;