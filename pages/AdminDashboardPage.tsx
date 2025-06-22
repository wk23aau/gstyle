import React, { useState, useEffect } from 'react';
import type { User } from '../App'; // Assuming User interface is in App.tsx

// Simple SVG Icons (UsersIcon, DocumentTextIcon, ClockIcon remain the same)
const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

// const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
//   </svg>
// );

const ExternalLinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);

const LiveDotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="50" cy="50" r="40" fill="currentColor"/>
  </svg>
);


interface AdminDashboardPageProps {
  currentUser: User | null;
}

interface RealtimeAnalyticsData {
  activeUsers: number;
  topPages: { name: string; users: number }[];
  message?: string;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ currentUser }) => {
  const [realtimeData, setRealtimeData] = useState<RealtimeAnalyticsData | null>(null);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [isLoadingRealtime, setIsLoadingRealtime] = useState<boolean>(true);

  const fetchRealtimeData = async () => {
    try {
      setRealtimeError(null);
      const response = await fetch('/api/analytics/realtime-data');
      const data: RealtimeAnalyticsData = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status} fetching real-time data`);
      }
      setRealtimeData(data);
    } catch (err) {
      if (err instanceof Error) {
        setRealtimeError(err.message);
      } else {
        setRealtimeError('An unknown error occurred while fetching real-time analytics.');
      }
      setRealtimeData({ activeUsers: 0, topPages: [] }); // Reset on error
    } finally {
      setIsLoadingRealtime(false);
    }
  };

  useEffect(() => {
    fetchRealtimeData(); // Initial fetch
    const intervalId = setInterval(fetchRealtimeData, 30000); // Fetch every 30 seconds
    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);


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

      {/* Analytics Section */}
      <section className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Website Analytics</h2>
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <ExternalLinkIcon className="w-5 h-5 mr-2" />
            Full Google Analytics Dashboard
          </a>
        </div>
        
        {/* Key Metrics Overview Section */}
        <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Key Metrics Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Users - Live */}
                <div className="bg-white p-5 rounded-lg shadow border-t-4 border-red-500">
                    <div className="flex items-center mb-3">
                        <LiveDotIcon className="w-5 h-5 text-red-500 mr-2 animate-pulse" />
                        <h4 className="text-lg font-semibold text-gray-700">Current Active Users</h4>
                    </div>
                    {isLoadingRealtime && <p className="text-4xl font-bold text-gray-800">Loading...</p>}
                    {!isLoadingRealtime && realtimeData && <p className="text-4xl font-bold text-gray-800">{realtimeData.activeUsers}</p>}
                    {!isLoadingRealtime && realtimeError && <p className="text-sm text-red-500 mt-1">Error loading</p>}
                     <p className="text-sm text-gray-500 mt-1">Live from Google Analytics</p>
                </div>
                
                {/* Total Users - Placeholder */}
                <div className="bg-white p-5 rounded-lg shadow border-t-4 border-blue-500">
                    <div className="flex items-center mb-3">
                        <UsersIcon className="w-8 h-8 text-blue-500 mr-3"/>
                        <h4 className="text-lg font-semibold text-gray-700">Total Users</h4>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">1,234</p>
                    <p className="text-sm text-gray-500 mt-1">Registered (Example)</p>
                </div>
                
                {/* CVs Generated - Placeholder */}
                <div className="bg-white p-5 rounded-lg shadow border-t-4 border-green-500">
                    <div className="flex items-center mb-3">
                        <DocumentTextIcon className="w-8 h-8 text-green-500 mr-3"/>
                        <h4 className="text-lg font-semibold text-gray-700">CVs Generated</h4>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">5,678</p>
                    <p className="text-sm text-gray-500 mt-1">Successfully created (Example)</p>
                </div>
            </div>
            {realtimeError && (
                 <p className="text-xs text-red-500 mt-4 text-center">
                    Real-time data error: {realtimeError}. Ensure GA_PROPERTY_ID and service account credentials are correctly set on the server.
                 </p>
            )}
            {!realtimeError && !isLoadingRealtime && realtimeData?.message && (
                 <p className="text-xs text-yellow-600 mt-4 text-center">
                    Note: {realtimeData.message}
                 </p>
            )}
        </div>

         {/* Top Active Pages - Live */}
        {!isLoadingRealtime && realtimeData && realtimeData.topPages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Top Active Pages Right Now</h3>
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
              <ul className="space-y-2">
                {realtimeData.topPages.map((page, index) => (
                  <li key={index} className="flex justify-between items-center text-sm text-gray-700">
                    <span>{page.name || 'Unknown/Direct'}</span>
                    <span className="font-semibold text-gray-900">{page.users} user(s)</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>


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