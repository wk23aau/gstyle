
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../../types'; // Updated import
import { changePassword } from '../../../services/authService';
import { LoadingSpinner } from '../../../constants';

interface PasswordManagementSectionProps {
  currentUser: User;
}

const PasswordManagementSection: React.FC<PasswordManagementSectionProps> = ({ currentUser }) => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);

  const handleChangePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordChangeError("All password fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("New passwords do not match.");
      return;
    }
    if (!currentUser || !currentUser.id) {
        setPasswordChangeError("User not identified. Please re-login.");
        return;
    }
    
    if (!currentUser.hasLocalPassword) { // This check relies on parent component determining canChangePassword correctly
        setPasswordChangeError("Password change is not available. If you signed up with Google, use 'Forgot Password?' to set a password first.");
        return;
    }

    setPasswordChangeLoading(true);
    try {
      // currentUser.id should be number or string, authService expects string | number
      const userId = currentUser.id; 
      const response = await changePassword(userId, currentPassword, newPassword);
      setPasswordChangeSuccess(response.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordChangeError(err.message || "Failed to change password. Please try again.");
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";
  const sectionClass = "bg-white shadow rounded-lg p-6";
  const sectionTitleClass = "text-xl font-semibold text-gray-700 mb-6 border-b pb-2";
  const primaryButtonClass = "px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400";
  const secondaryButtonClass = "px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors text-sm";
  
  const canChangePassword = currentUser.hasLocalPassword || (!currentUser.google_id && !!currentUser.is_email_verified);

  return (
    <section className={sectionClass}>
      <h2 className={sectionTitleClass}>
        {canChangePassword ? 'Change Password' : 'Password Management'}
      </h2>
      {canChangePassword ? (
        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="current-password" className={labelClass}>Current Password</label>
            <input type="password" id="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} autoComplete="current-password" required aria-required="true" />
          </div>
          <div>
            <label htmlFor="new-password" className={labelClass}>New Password</label>
            <input type="password" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} autoComplete="new-password" required aria-required="true" aria-describedby="new-password-desc"/>
            <p id="new-password-desc" className="text-xs text-gray-500 mt-1">Must be at least 6 characters long.</p>
          </div>
          <div>
            <label htmlFor="confirm-new-password" className={labelClass}>Confirm New Password</label>
            <input type="password" id="confirm-new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={inputClass} autoComplete="new-password" required aria-required="true" />
          </div>

          {passwordChangeError && <div className="p-3 bg-red-50 text-red-700 border border-red-300 rounded-md text-sm break-words">{passwordChangeError}</div>}
          {passwordChangeSuccess && <div className="p-3 bg-green-50 text-green-700 border border-green-300 rounded-md text-sm break-words">{passwordChangeSuccess}</div>}

          <div className="pt-2">
            <button type="submit" className={`${primaryButtonClass} w-full sm:w-auto flex items-center justify-center`} disabled={passwordChangeLoading}>
              {passwordChangeLoading && LoadingSpinner}
              {passwordChangeLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      ) : currentUser.google_id ? (
        <>
          <p className="text-gray-600 mb-3">Password management is handled through your Google account. You can change your password via Google's services. If you wish to set a local password for this site, please use the "Forgot Password?" option.</p>
          <button 
            onClick={() => navigate('/request-password-reset')} 
            className={secondaryButtonClass}
          >
            Set/Reset Password via Email
          </button>
        </>
      ) : (
        <p className="text-gray-600">Password management options will appear here once your email is verified or if you set a password.</p>
      )}
    </section>
  );
};

export default PasswordManagementSection;
