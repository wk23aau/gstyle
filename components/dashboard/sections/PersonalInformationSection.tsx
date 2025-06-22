
import React from 'react';
import type { AddressInfo } from '../../../types'; // Updated import

interface PersonalInformationSectionProps {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (value: string) => void;
  headline: string;
  setHeadline: (value: string) => void;
  address: AddressInfo;
  handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dateOfBirth: string;
  setDateOfBirth: (value: string) => void;
  profilePhotoUrl: string;
  setProfilePhotoUrl: (value: string) => void;
  currentUserGoogleId?: string;
}

const PersonalInformationSection: React.FC<PersonalInformationSectionProps> = ({
  name, setName, email, setEmail, phoneNumber, setPhoneNumber,
  linkedinUrl, setLinkedinUrl, headline, setHeadline, address, handleAddressChange,
  dateOfBirth, setDateOfBirth, profilePhotoUrl, setProfilePhotoUrl, currentUserGoogleId
}) => {
  
  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";
  const sectionClass = "bg-white shadow rounded-lg p-6";
  const sectionTitleClass = "text-xl font-semibold text-gray-700 mb-6 border-b pb-2";
  const subSectionTitleClass = "text-lg font-medium text-gray-700 mb-3";

  return (
    <section className={sectionClass}>
      <h2 className={sectionTitleClass}>Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="dashboard-name" className={labelClass}>Full Name</label>
          <input type="text" id="dashboard-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoComplete="name"/>
        </div>
        <div>
          <label htmlFor="dashboard-email" className={labelClass}>Email Address</label>
          <input type="email" id="dashboard-email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} ${currentUserGoogleId ? 'bg-gray-100 cursor-not-allowed' : ''}`} autoComplete="email" readOnly={!!currentUserGoogleId} disabled={!!currentUserGoogleId} aria-describedby={currentUserGoogleId ? "email-readonly-description" : undefined} />
          {currentUserGoogleId && (<p id="email-readonly-description" className="mt-1 text-xs text-gray-500">Email is managed by your Google account.</p>)}
        </div>
        <div>
          <label htmlFor="dashboard-phone" className={labelClass}>Phone Number</label>
          <input type="tel" id="dashboard-phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputClass} autoComplete="tel"/>
        </div>
        <div>
          <label htmlFor="dashboard-linkedin" className={labelClass}>LinkedIn Profile URL</label>
          <input type="url" id="dashboard-linkedin" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/yourprofile" autoComplete="url"/>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="dashboard-headline" className={labelClass}>Professional Headline</label>
          <input type="text" id="dashboard-headline" value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputClass} placeholder="e.g., Senior Software Engineer | AI Enthusiast"/>
        </div>
        <div>
          <label htmlFor="dashboard-dob" className={labelClass}>Date of Birth</label>
          <input type="date" id="dashboard-dob" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="dashboard-photo-url" className={labelClass}>Profile Photo URL</label>
          <input type="url" id="dashboard-photo-url" value={profilePhotoUrl} onChange={(e) => setProfilePhotoUrl(e.target.value)} className={inputClass} placeholder="https://example.com/your-photo.jpg" autoComplete="photo"/>
        </div>
        <div className="md:col-span-2"><h3 className={subSectionTitleClass}>Address</h3></div>
        <div>
          <label htmlFor="dashboard-street" className={labelClass}>Street</label>
          <input type="text" name="street" id="dashboard-street" value={address.street || ''} onChange={handleAddressChange} className={inputClass} autoComplete="street-address"/>
        </div>
        <div>
          <label htmlFor="dashboard-city" className={labelClass}>City</label>
          <input type="text" name="city" id="dashboard-city" value={address.city || ''} onChange={handleAddressChange} className={inputClass} autoComplete="address-level2"/>
        </div>
        <div>
          <label htmlFor="dashboard-country" className={labelClass}>Country</label>
          <input type="text" name="country" id="dashboard-country" value={address.country || ''} onChange={handleAddressChange} className={inputClass} autoComplete="country-name"/>
        </div>
        <div>
          <label htmlFor="dashboard-postalCode" className={labelClass}>Postal Code</label>
          <input type="text" name="postalCode" id="dashboard-postalCode" value={address.postalCode || ''} onChange={handleAddressChange} className={inputClass} autoComplete="postal-code"/>
        </div>
      </div>
    </section>
  );
};

export default PersonalInformationSection;