import React, { useState, useEffect, FormEvent } from 'react';
import type { User, AddressInfo, WorkExperience, EducationEntry, LanguageEntry, AwardEntry, PublicationEntry, SeminarEntry, HobbyEntry } from '../types'; 
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_CREDITS_REGISTERED } from '../constants';


import PersonalInformationSection from '../components/dashboard/sections/PersonalInformationSection';
import PasswordManagementSection from '../components/dashboard/sections/PasswordManagementSection';
import WorkExperienceSection from '../components/dashboard/sections/WorkExperienceSection';
import EducationSection from '../components/dashboard/sections/EducationSection';
import LanguagesSection from '../components/dashboard/sections/LanguagesSection';
import AwardsSection from '../components/dashboard/sections/AwardsSection';
import PublicationsSection from '../components/dashboard/sections/PublicationsSection';
import SeminarsSection from '../components/dashboard/sections/SeminarsSection';
import HobbiesSection from '../components/dashboard/sections/HobbiesSection';
import SkillsSummarySection from '../components/dashboard/sections/SkillsSummarySection';
import AccountDangerZone from '../components/dashboard/sections/AccountDangerZone';
import SavedCVsSection from '../components/dashboard/sections/SavedCVsSection'; // New Import

interface UserDashboardPageProps {
  currentUser: User | null;
}

const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ currentUser }) => {
  // Personal Info State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [address, setAddress] = useState<AddressInfo>({ street: '', city: '', country: '', postalCode: '' });
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  
  // Dynamic Array State
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [educations, setEducations] = useState<EducationEntry[]>([]);
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);
  const [awards, setAwards] = useState<AwardEntry[]>([]);
  const [publications, setPublications] = useState<PublicationEntry[]>([]);
  const [seminars, setSeminars] = useState<SeminarEntry[]>([]);
  const [hobbies, setHobbies] = useState<HobbyEntry[]>([]);
  
  const [skillsSummary, setSkillsSummary] = useState('');
  
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhoneNumber(currentUser.phoneNumber || '');
      setLinkedinUrl(currentUser.linkedinUrl || '');
      setHeadline(currentUser.headline || '');
      setAddress(currentUser.address || { street: '', city: '', country: '', postalCode: '' });
      setDateOfBirth(currentUser.dateOfBirth || '');
      setProfilePhotoUrl(currentUser.profilePhotoUrl || '');
      setSkillsSummary(currentUser.skillsSummary || '');
      setWorkExperiences(currentUser.workExperiences || []);
      setEducations(currentUser.educations || []);
      setLanguages(currentUser.languages || []);
      setAwards(currentUser.awards || []);
      setPublications(currentUser.publications || []);
      setSeminars(currentUser.seminars || []);
      setHobbies(currentUser.hobbies || []);
    }
  }, [currentUser]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleArrayItemChange = <T extends { id: string }>(
    items: T[], 
    setItems: React.Dispatch<React.SetStateAction<T[]>>, 
    index: number, 
    field: keyof T, 
    value: any // Can be string or boolean depending on the field
  ) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        const newItem = { ...item, [field]: value };
        // If 'isPresent' or 'isCurrent' is set to true, clear the 'endDate'
        if ((field === 'isPresent' || field === 'isCurrent') && value === true) {
            // Assert newItem to the specific types that have 'endDate'
            const updatableItem = newItem as WorkExperience | EducationEntry;
            if (updatableItem.endDate !== undefined) {
                updatableItem.endDate = '';
            }
        }
        return newItem;
      }
      return item;
    });
    setItems(updatedItems as T[]); // Assuming newItem is compatible with T
  };
  
  const addArrayItem = <T extends { id: string }>(
    setItems: React.Dispatch<React.SetStateAction<T[]>>, 
    newItemFactory: () => Omit<T, 'id'>
  ) => {
    setItems(prevItems => [...prevItems, { id: uuidv4(), ...newItemFactory() } as T]);
  };

  const removeArrayItem = <T extends { id: string }>(
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>, 
    idToRemove: string
  ) => {
    setItems(items.filter(item => item.id !== idToRemove));
  };


  const addWorkExperience = () => addArrayItem<WorkExperience>(setWorkExperiences, () => ({ company: '', title: '', startDate: '', endDate: '', description: '', isPresent: false }));
  const handleWorkExperienceChange = (index: number, field: keyof WorkExperience, value: string | boolean) => handleArrayItemChange(workExperiences, setWorkExperiences, index, field, value);
  const removeWorkExperience = (id: string) => removeArrayItem(workExperiences, setWorkExperiences, id);

  const addEducationEntry = () => addArrayItem<EducationEntry>(setEducations, () => ({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '', isCurrent: false }));
  const handleEducationChange = (index: number, field: keyof EducationEntry, value: string | boolean) => handleArrayItemChange(educations, setEducations, index, field, value);
  const removeEducationEntry = (id: string) => removeArrayItem(educations, setEducations, id);
  
  const addLanguage = () => addArrayItem<LanguageEntry>(setLanguages, () => ({ languageName: '', proficiency: '' }));
  const handleLanguageChange = (index: number, field: keyof LanguageEntry, value: string) => handleArrayItemChange(languages, setLanguages, index, field, value);
  const removeLanguage = (id: string) => removeArrayItem(languages, setLanguages, id);

  const addAward = () => addArrayItem<AwardEntry>(setAwards, () => ({ awardName: '', issuer: '', date: '', description: '' }));
  const handleAwardChange = (index: number, field: keyof AwardEntry, value: string) => handleArrayItemChange(awards, setAwards, index, field, value);
  const removeAward = (id: string) => removeArrayItem(awards, setAwards, id);

  const addPublication = () => addArrayItem<PublicationEntry>(setPublications, () => ({ title: '', journalOrPlatform: '', date: '', url: '', description: '' }));
  const handlePublicationChange = (index: number, field: keyof PublicationEntry, value: string) => handleArrayItemChange(publications, setPublications, index, field, value);
  const removePublication = (id: string) => removeArrayItem(publications, setPublications, id);

  const addSeminar = () => addArrayItem<SeminarEntry>(setSeminars, () => ({ seminarName: '', role: '', date: '', location: '', description: '' }));
  const handleSeminarChange = (index: number, field: keyof SeminarEntry, value: string) => handleArrayItemChange(seminars, setSeminars, index, field, value);
  const removeSeminar = (id: string) => removeArrayItem(seminars, setSeminars, id);

  const addHobby = () => addArrayItem<HobbyEntry>(setHobbies, () => ({ hobbyName: '' }));
  const handleHobbyChange = (index: number, field: keyof HobbyEntry, value: string) => handleArrayItemChange(hobbies, setHobbies, index, field, value);
  const removeHobby = (id: string) => removeArrayItem(hobbies, setHobbies, id);


  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfileData = {
      name, email, phoneNumber, linkedinUrl, headline, address, dateOfBirth,
      profilePhotoUrl, skillsSummary, workExperiences, educations, languages,
      awards, publications, seminars, hobbies,
    };
    console.log('Update profile with:', updatedProfileData);
    alert('Profile update functionality is UI-only. Check console for data.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Delete account for user:', currentUser?.id);
      alert('Account deletion functionality is not yet implemented.');
    }
  };
  
  const sectionClass = "bg-white shadow rounded-lg p-6";
  const primaryButtonClass = "px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400";

  if (!currentUser) {
    return (
        <div className="text-center py-10">
            <h1 className="text-2xl font-semibold text-gray-700">Loading user data or not logged in...</h1>
        </div>
    );
  }
  
  return (
    <div className="space-y-8 mb-10">
      <header className={`${sectionClass} !pb-4`}>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                Welcome, {currentUser.name || 'User'}!
                </h1>
                <p className="text-gray-600 mt-1">Manage your profile and CVs here. Fill out your profile thoroughly for better CV generation.</p>
            </div>
            { typeof currentUser.credits_available === 'number' && (
                <div className="text-right">
                    <p className="text-sm text-gray-500">Daily CV Credits:</p>
                    <p className="text-lg font-semibold text-blue-600">
                        {currentUser.credits_available} / {DEFAULT_CREDITS_REGISTERED}
                    </p>
                </div>
            )}
        </div>
      </header>

      {/* Saved CVs Section */}
      <SavedCVsSection />

      <form onSubmit={handleProfileUpdate} className="space-y-8">
        <PersonalInformationSection
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail} 
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          linkedinUrl={linkedinUrl}
          setLinkedinUrl={setLinkedinUrl}
          headline={headline}
          setHeadline={setHeadline}
          address={address}
          handleAddressChange={handleAddressChange}
          dateOfBirth={dateOfBirth}
          setDateOfBirth={setDateOfBirth}
          profilePhotoUrl={profilePhotoUrl}
          setProfilePhotoUrl={setProfilePhotoUrl}
          currentUserGoogleId={currentUser.google_id}
        />
        <div className="pt-4 flex justify-end">
          <button type="submit" className={primaryButtonClass}>
            Save All Profile Changes (UI Only)
          </button>
        </div>
      </form> 

      <PasswordManagementSection currentUser={currentUser} />

      <div className="space-y-8">
        <WorkExperienceSection
            workExperiences={workExperiences}
            handleWorkExperienceChange={handleWorkExperienceChange}
            addWorkExperience={addWorkExperience}
            removeWorkExperience={removeWorkExperience}
        />
        <EducationSection
            educations={educations}
            handleEducationChange={handleEducationChange}
            addEducationEntry={addEducationEntry}
            removeEducationEntry={removeEducationEntry}
        />
        <LanguagesSection
            languages={languages}
            handleLanguageChange={handleLanguageChange}
            addLanguage={addLanguage}
            removeLanguage={removeLanguage}
        />
        <AwardsSection
            awards={awards}
            handleAwardChange={handleAwardChange}
            addAward={addAward}
            removeAward={removeAward}
        />
        <PublicationsSection
            publications={publications}
            handlePublicationChange={handlePublicationChange}
            addPublication={addPublication}
            removePublication={removePublication}
        />
        <SeminarsSection
            seminars={seminars}
            handleSeminarChange={handleSeminarChange}
            addSeminar={addSeminar}
            removeSeminar={removeSeminar}
        />
        <HobbiesSection
            hobbies={hobbies}
            handleHobbyChange={handleHobbyChange}
            addHobby={addHobby}
            removeHobby={removeHobby}
        />
        <SkillsSummarySection
            skillsSummary={skillsSummary}
            setSkillsSummary={setSkillsSummary}
        />
      </div>

      <AccountDangerZone handleDeleteAccount={handleDeleteAccount} />
    </div>
  );
};

export default UserDashboardPage;