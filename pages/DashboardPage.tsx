
import React, { useState } from 'react';
import type { User } from '../App'; // Assuming User interface is in App.tsx

interface DashboardPageProps {
  currentUser: User | null;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser }) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for profile update logic
    console.log('Update profile with:', { name, email });
    alert('Profile update functionality is not yet implemented.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Placeholder for account deletion logic
      console.log('Delete account for user:', currentUser?.id);
      alert('Account deletion functionality is not yet implemented.');
    }
  };

  if (!currentUser) {
    // This should ideally not happen if ProtectedRoute is working correctly,
    // but as a fallback:
    return (
        <div className="text-center py-10">
            <h1 className="text-2xl font-semibold text-gray-700">Loading user data or not logged in...</h1>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {currentUser.name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">Manage your profile and CVs here.</p>
      </header>

      {/* Personal Information / Edit Profile Section */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Edit Profile</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label htmlFor="dashboard-name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="dashboard-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="dashboard-email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="dashboard-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              autoComplete="email"
              readOnly={!!currentUser.google_id} // Make email read-only if signed in with Google
              disabled={!!currentUser.google_id}
              aria-describedby={currentUser.google_id ? "email-readonly-description" : undefined}
            />
            {currentUser.google_id && (
                <p id="email-readonly-description" className="mt-1 text-xs text-gray-500">Email is managed by your Google account.</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Save Changes (UI Only)
          </button>
        </form>
      </section>

      {/* My Saved CVs Section (Placeholder) */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">My Saved CVs</h2>
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md">
          <p className="text-gray-500">You have no saved CVs yet.</p>
          <p className="text-gray-500 mt-1">Generated CVs will appear here.</p>
          {/* In the future, list CVs or link to generate new one */}
        </div>
      </section>

      {/* Account Settings Section */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Account Settings</h2>
        <div>
          <h3 className="text-md font-medium text-gray-700">Delete Account</h3>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Delete My Account (UI Only)
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;