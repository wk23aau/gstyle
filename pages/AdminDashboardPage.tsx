
import React from 'react';
import type { User } from '../App'; // Assuming User interface is in App.tsx

interface AdminDashboardPageProps {
  currentUser: User | null;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ currentUser }) => {
  if (!currentUser) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold text-gray-700">Loading admin data or not authorized...</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Welcome, {currentUser.name || 'Admin'}! ({currentUser.email})</p>
      </header>

      {/* User Management Section (Placeholder) */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">User Management</h2>
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md">
          <p className="text-gray-500">User list and management tools will appear here.</p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            View All Users (UI Only)
          </button>
        </div>
      </section>

      {/* Site Analytics Section (Placeholder) */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Site Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-700">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600">1,234</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-700">CVs Generated</h3>
                <p className="text-3xl font-bold text-green-600">5,678</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-700">Active Sessions</h3>
                <p className="text-3xl font-bold text-yellow-600">150</p>
            </div>
        </div>
         <p className="text-xs text-gray-400 mt-2 text-center">(Placeholder data)</p>
      </section>

      {/* Content Moderation/Settings Section (Placeholder) */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">System Settings</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Maintenance Mode</span>
            <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">
                Toggle (UI Only)
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">API Key Configuration</span>
             <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">
                Manage Keys (UI Only)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;