
import React from 'react';

interface AccountDangerZoneProps {
  handleDeleteAccount: () => void;
}

const AccountDangerZone: React.FC<AccountDangerZoneProps> = ({ handleDeleteAccount }) => {
  const sectionClass = "bg-white shadow rounded-lg p-6";

  return (
    <section className={`${sectionClass} mt-12 border-t-2 border-red-200`}>
      <h2 className="text-xl font-semibold text-red-600 mb-4">Account Danger Zone</h2>
      <div>
        <h3 className="text-md font-medium text-gray-700">Delete Account</h3>
        <p className="text-sm text-gray-500 mt-1 mb-3">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          type="button" // Ensure it's not submitting any form if wrapped
          className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Delete My Account (UI Only)
        </button>
      </div>
    </section>
  );
};

export default AccountDangerZone;
