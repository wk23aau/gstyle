
import React, { useState, useEffect } from 'react';
import type { User, AddressInfo, WorkExperience, EducationEntry, LanguageEntry, AwardEntry, PublicationEntry, SeminarEntry, HobbyEntry } from '../App'; 
import { v4 as uuidv4 } from 'uuid';

interface UserDashboardPageProps {
  currentUser: User | null;
}

const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ currentUser }) => {
  // Personal Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [address, setAddress] = useState<AddressInfo>({ street: '', city: '', country: '', postalCode: '' });
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [skillsSummary, setSkillsSummary] = useState('');

  // Work Experience
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  // Education
  const [educations, setEducations] = useState<EducationEntry[]>([]);
  // New Profile Fields
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);
  const [awards, setAwards] = useState<AwardEntry[]>([]);
  const [publications, setPublications] = useState<PublicationEntry[]>([]);
  const [seminars, setSeminars] = useState<SeminarEntry[]>([]);
  const [hobbies, setHobbies] = useState<HobbyEntry[]>([]);
  
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

  // Generic handler for changing array item fields
  const handleArrayItemChange = <T extends { id: string }>(
    items: T[], 
    setItems: React.Dispatch<React.SetStateAction<T[]>>, 
    index: number, 
    field: keyof T, 
    value: any
  ) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(updatedItems);
  };
  
  // Generic handler for adding an item to an array
  const addArrayItem = <T extends { id: string }>(
    setItems: React.Dispatch<React.SetStateAction<T[]>>, 
    newItem: Omit<T, 'id'>
  ) => {
    // @ts-ignore
    setItems(prevItems => [...prevItems, { id: uuidv4(), ...newItem }]);
  };

  // Generic handler for removing an item from an array
  const removeArrayItem = <T extends { id: string }>(
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>, 
    idToRemove: string
  ) => {
    setItems(items.filter(item => item.id !== idToRemove));
  };


  // Work Experience Handlers
  const addWorkExperience = () => addArrayItem<WorkExperience>(setWorkExperiences, { company: '', title: '', startDate: '', endDate: '', description: '', isPresent: false });
  const handleWorkExperienceChange = (index: number, field: keyof WorkExperience, value: string | boolean) => {
    const updatedExperiences = [...workExperiences];
    const experienceToUpdate = updatedExperiences[index];
    // @ts-ignore
    experienceToUpdate[field] = value;
    if (field === 'isPresent' && value) experienceToUpdate.endDate = '';
    setWorkExperiences(updatedExperiences);
  };
  const removeWorkExperience = (id: string) => removeArrayItem(workExperiences, setWorkExperiences, id);

  // Education Handlers
  const addEducationEntry = () => addArrayItem<EducationEntry>(setEducations, { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '', isCurrent: false });
  const handleEducationChange = (index: number, field: keyof EducationEntry, value: string | boolean) => {
    const updatedEducations = [...educations];
    const educationToUpdate = updatedEducations[index];
     // @ts-ignore
    educationToUpdate[field] = value;
    if (field === 'isCurrent' && value) educationToUpdate.endDate = '';
    setEducations(updatedEducations);
  };
  const removeEducationEntry = (id: string) => removeArrayItem(educations, setEducations, id);
  
  // Language Handlers
  const addLanguage = () => addArrayItem<LanguageEntry>(setLanguages, { languageName: '', proficiency: '' });
  const handleLanguageChange = (index: number, field: keyof LanguageEntry, value: string) => handleArrayItemChange(languages, setLanguages, index, field, value);
  const removeLanguage = (id: string) => removeArrayItem(languages, setLanguages, id);

  // Award Handlers
  const addAward = () => addArrayItem<AwardEntry>(setAwards, { awardName: '', issuer: '', date: '', description: '' });
  const handleAwardChange = (index: number, field: keyof AwardEntry, value: string) => handleArrayItemChange(awards, setAwards, index, field, value);
  const removeAward = (id: string) => removeArrayItem(awards, setAwards, id);

  // Publication Handlers
  const addPublication = () => addArrayItem<PublicationEntry>(setPublications, { title: '', journalOrPlatform: '', date: '', url: '', description: '' });
  const handlePublicationChange = (index: number, field: keyof PublicationEntry, value: string) => handleArrayItemChange(publications, setPublications, index, field, value);
  const removePublication = (id: string) => removeArrayItem(publications, setPublications, id);

  // Seminar Handlers
  const addSeminar = () => addArrayItem<SeminarEntry>(setSeminars, { seminarName: '', role: '', date: '', location: '', description: '' });
  const handleSeminarChange = (index: number, field: keyof SeminarEntry, value: string) => handleArrayItemChange(seminars, setSeminars, index, field, value);
  const removeSeminar = (id: string) => removeArrayItem(seminars, setSeminars, id);

  // Hobby Handlers
  const addHobby = () => addArrayItem<HobbyEntry>(setHobbies, { hobbyName: '' });
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
  
  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";
  const sectionClass = "bg-white shadow rounded-lg p-6";
  const sectionTitleClass = "text-xl font-semibold text-gray-700 mb-6 border-b pb-2";
  const subSectionTitleClass = "text-lg font-medium text-gray-700 mb-3";
  const itemWrapperClass = "mb-6 p-4 border border-gray-200 rounded-md space-y-3 relative";
  const removeButtonClass = "absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 hover:bg-red-100 p-1 rounded-full";
  const addButtonClass = "mt-2 px-4 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors text-sm";


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
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {currentUser.name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">Manage your profile and CVs here. Fill out your profile thoroughly for better CV generation.</p>
      </header>

      <form onSubmit={handleProfileUpdate} className="space-y-8">
        {/* Personal Information Section (Existing - no changes needed here) */}
        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label htmlFor="dashboard-name" className={labelClass}>Full Name</label><input type="text" id="dashboard-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoComplete="name"/></div>
            <div><label htmlFor="dashboard-email" className={labelClass}>Email Address</label><input type="email" id="dashboard-email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} ${currentUser.google_id ? 'bg-gray-100 cursor-not-allowed' : ''}`} autoComplete="email" readOnly={!!currentUser.google_id} disabled={!!currentUser.google_id} aria-describedby={currentUser.google_id ? "email-readonly-description" : undefined} />{currentUser.google_id && (<p id="email-readonly-description" className="mt-1 text-xs text-gray-500">Email is managed by your Google account.</p>)}</div>
            <div><label htmlFor="dashboard-phone" className={labelClass}>Phone Number</label><input type="tel" id="dashboard-phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputClass} autoComplete="tel"/></div>
            <div><label htmlFor="dashboard-linkedin" className={labelClass}>LinkedIn Profile URL</label><input type="url" id="dashboard-linkedin" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/yourprofile" autoComplete="url"/></div>
            <div className="md:col-span-2"><label htmlFor="dashboard-headline" className={labelClass}>Professional Headline</label><input type="text" id="dashboard-headline" value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputClass} placeholder="e.g., Senior Software Engineer | AI Enthusiast"/></div>
            <div><label htmlFor="dashboard-dob" className={labelClass}>Date of Birth</label><input type="date" id="dashboard-dob" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} /></div>
            <div><label htmlFor="dashboard-photo-url" className={labelClass}>Profile Photo URL</label><input type="url" id="dashboard-photo-url" value={profilePhotoUrl} onChange={(e) => setProfilePhotoUrl(e.target.value)} className={inputClass} placeholder="https://example.com/your-photo.jpg" autoComplete="photo"/></div>
            <div className="md:col-span-2"><h3 className={subSectionTitleClass}>Address</h3></div>
            <div><label htmlFor="dashboard-street" className={labelClass}>Street</label><input type="text" name="street" id="dashboard-street" value={address.street || ''} onChange={handleAddressChange} className={inputClass} autoComplete="street-address"/></div>
            <div><label htmlFor="dashboard-city" className={labelClass}>City</label><input type="text" name="city" id="dashboard-city" value={address.city || ''} onChange={handleAddressChange} className={inputClass} autoComplete="address-level2"/></div>
            <div><label htmlFor="dashboard-country" className={labelClass}>Country</label><input type="text" name="country" id="dashboard-country" value={address.country || ''} onChange={handleAddressChange} className={inputClass} autoComplete="country-name"/></div>
            <div><label htmlFor="dashboard-postalCode" className={labelClass}>Postal Code</label><input type="text" name="postalCode" id="dashboard-postalCode" value={address.postalCode || ''} onChange={handleAddressChange} className={inputClass} autoComplete="postal-code"/></div>
          </div>
        </section>

        {/* Work Experience Section (Existing - changed remove to use id) */}
        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Work Experience</h2>
          {workExperiences.map((exp, index) => (
            <div key={exp.id} className={itemWrapperClass}>
              <button type="button" onClick={() => removeWorkExperience(exp.id)} className={removeButtonClass} aria-label="Remove Experience">X</button>
              <h3 className={subSectionTitleClass}>Experience #{index + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor={`work-company-${exp.id}`} className={labelClass}>Company Name</label><input type="text" id={`work-company-${exp.id}`} value={exp.company || ''} onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)} className={inputClass} /></div>
                <div><label htmlFor={`work-title-${exp.id}`} className={labelClass}>Job Title</label><input type="text" id={`work-title-${exp.id}`} value={exp.title || ''} onChange={(e) => handleWorkExperienceChange(index, 'title', e.target.value)} className={inputClass} /></div>
                <div><label htmlFor={`work-start-${exp.id}`} className={labelClass}>Start Date</label><input type="month" id={`work-start-${exp.id}`} value={exp.startDate || ''} onChange={(e) => handleWorkExperienceChange(index, 'startDate', e.target.value)} className={inputClass} /></div>
                <div><label htmlFor={`work-end-${exp.id}`} className={labelClass}>End Date</label><input type="month" id={`work-end-${exp.id}`} value={exp.endDate || ''} onChange={(e) => handleWorkExperienceChange(index, 'endDate', e.target.value)} className={inputClass} disabled={exp.isPresent} /><div className="mt-1"><input type="checkbox" id={`work-present-${exp.id}`} checked={exp.isPresent || false} onChange={(e) => handleWorkExperienceChange(index, 'isPresent', e.target.checked)} className="mr-2 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"/><label htmlFor={`work-present-${exp.id}`} className="text-sm text-gray-600">I currently work here</label></div></div>
              </div>
              <div><label htmlFor={`work-desc-${exp.id}`} className={labelClass}>Responsibilities/Description</label><textarea id={`work-desc-${exp.id}`} value={exp.description || ''} onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)} className={`${inputClass} h-24`} rows={3}></textarea></div>
            </div>
          ))}
          <button type="button" onClick={addWorkExperience} className={addButtonClass}>+ Add Work Experience</button>
        </section>

        {/* Education Section (Existing - changed remove to use id) */}
        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Education</h2>
          {educations.map((edu, index) => (
            <div key={edu.id} className={itemWrapperClass}>
               <button type="button" onClick={() => removeEducationEntry(edu.id)} className={removeButtonClass} aria-label="Remove Education">X</button>
              <h3 className={subSectionTitleClass}>Education #{index + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor={`edu-institution-${edu.id}`} className={labelClass}>Institution Name</label><input type="text" id={`edu-institution-${edu.id}`} value={edu.institution || ''} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} className={inputClass} /></div>
                <div><label htmlFor={`edu-degree-${edu.id}`} className={labelClass}>Degree/Certificate</label><input type="text" id={`edu-degree-${edu.id}`} value={edu.degree || ''} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} className={inputClass} /></div>
                <div><label htmlFor={`edu-field-${edu.id}`} className={labelClass}>Field of Study</label><input type="text" id={`edu-field-${edu.id}`} value={edu.fieldOfStudy || ''} onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)} className={inputClass} /></div>
                <div><label htmlFor={`edu-start-${edu.id}`} className={labelClass}>Start Date</label><input type="month" id={`edu-start-${edu.id}`} value={edu.startDate || ''} onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)} className={inputClass} /></div>
                <div><label htmlFor={`edu-end-${edu.id}`} className={labelClass}>End Date/Expected</label><input type="month" id={`edu-end-${edu.id}`} value={edu.endDate || ''} onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)} className={inputClass} disabled={edu.isCurrent} /><div className="mt-1"><input type="checkbox" id={`edu-current-${edu.id}`} checked={edu.isCurrent || false} onChange={(e) => handleEducationChange(index, 'isCurrent', e.target.checked)} className="mr-2 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"/><label htmlFor={`edu-current-${edu.id}`} className="text-sm text-gray-600">I currently study here</label></div></div>
              </div>
              <div><label htmlFor={`edu-desc-${edu.id}`} className={labelClass}>Description/Achievements</label><textarea id={`edu-desc-${edu.id}`} value={edu.description || ''} onChange={(e) => handleEducationChange(index, 'description', e.target.value)} className={`${inputClass} h-24`} rows={3}></textarea></div>
            </div>
          ))}
          <button type="button" onClick={addEducationEntry} className={addButtonClass}>+ Add Education</button>
        </section>

        {/* Languages Section - New */}
        <section className={sectionClass}>
            <h2 className={sectionTitleClass}>Languages</h2>
            {languages.map((lang, index) => (
                <div key={lang.id} className={itemWrapperClass}>
                    <button type="button" onClick={() => removeLanguage(lang.id)} className={removeButtonClass} aria-label="Remove Language">X</button>
                    <h3 className={subSectionTitleClass}>Language #{index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={`lang-name-${lang.id}`} className={labelClass}>Language</label>
                            <input type="text" id={`lang-name-${lang.id}`} value={lang.languageName || ''} onChange={(e) => handleLanguageChange(index, 'languageName', e.target.value)} className={inputClass} placeholder="e.g., English, Spanish" />
                        </div>
                        <div>
                            <label htmlFor={`lang-proficiency-${lang.id}`} className={labelClass}>Proficiency</label>
                            <select id={`lang-proficiency-${lang.id}`} value={lang.proficiency || ''} onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value as LanguageEntry['proficiency'])} className={inputClass}>
                                <option value="">Select proficiency</option>
                                <option value="Basic">Basic</option>
                                <option value="Conversational">Conversational</option>
                                <option value="Fluent">Fluent</option>
                                <option value="Native">Native</option>
                            </select>
                        </div>
                    </div>
                </div>
            ))}
            <button type="button" onClick={addLanguage} className={addButtonClass}>+ Add Language</button>
        </section>

        {/* Awards & Recognitions Section - New */}
        <section className={sectionClass}>
            <h2 className={sectionTitleClass}>Awards & Recognitions</h2>
            {awards.map((award, index) => (
                <div key={award.id} className={itemWrapperClass}>
                    <button type="button" onClick={() => removeAward(award.id)} className={removeButtonClass} aria-label="Remove Award">X</button>
                    <h3 className={subSectionTitleClass}>Award #{index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor={`award-name-${award.id}`} className={labelClass}>Award Name</label><input type="text" id={`award-name-${award.id}`} value={award.awardName || ''} onChange={(e) => handleAwardChange(index, 'awardName', e.target.value)} className={inputClass} /></div>
                        <div><label htmlFor={`award-issuer-${award.id}`} className={labelClass}>Issuer</label><input type="text" id={`award-issuer-${award.id}`} value={award.issuer || ''} onChange={(e) => handleAwardChange(index, 'issuer', e.target.value)} className={inputClass} /></div>
                        <div><label htmlFor={`award-date-${award.id}`} className={labelClass}>Date Received</label><input type="month" id={`award-date-${award.id}`} value={award.date || ''} onChange={(e) => handleAwardChange(index, 'date', e.target.value)} className={inputClass} /></div>
                    </div>
                    <div><label htmlFor={`award-desc-${award.id}`} className={labelClass}>Description (Optional)</label><textarea id={`award-desc-${award.id}`} value={award.description || ''} onChange={(e) => handleAwardChange(index, 'description', e.target.value)} className={`${inputClass} h-20`} rows={2}></textarea></div>
                </div>
            ))}
            <button type="button" onClick={addAward} className={addButtonClass}>+ Add Award</button>
        </section>

        {/* Publications Section - New */}
        <section className={sectionClass}>
            <h2 className={sectionTitleClass}>Publications</h2>
            {publications.map((pub, index) => (
                <div key={pub.id} className={itemWrapperClass}>
                    <button type="button" onClick={() => removePublication(pub.id)} className={removeButtonClass} aria-label="Remove Publication">X</button>
                    <h3 className={subSectionTitleClass}>Publication #{index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor={`pub-title-${pub.id}`} className={labelClass}>Title</label><input type="text" id={`pub-title-${pub.id}`} value={pub.title || ''} onChange={(e) => handlePublicationChange(index, 'title', e.target.value)} className={inputClass} /></div>
                        <div><label htmlFor={`pub-platform-${pub.id}`} className={labelClass}>Journal/Platform</label><input type="text" id={`pub-platform-${pub.id}`} value={pub.journalOrPlatform || ''} onChange={(e) => handlePublicationChange(index, 'journalOrPlatform', e.target.value)} className={inputClass} /></div>
                        <div><label htmlFor={`pub-date-${pub.id}`} className={labelClass}>Publication Date</label><input type="month" id={`pub-date-${pub.id}`} value={pub.date || ''} onChange={(e) => handlePublicationChange(index, 'date', e.target.value)} className={inputClass} /></div>
                        <div><label htmlFor={`pub-url-${pub.id}`} className={labelClass}>URL (Optional)</label><input type="url" id={`pub-url-${pub.id}`} value={pub.url || ''} onChange={(e) => handlePublicationChange(index, 'url', e.target.value)} className={inputClass} placeholder="https://example.com/publication"/></div>
                    </div>
                    <div><label htmlFor={`pub-desc-${pub.id}`} className={labelClass}>Description (Optional)</label><textarea id={`pub-desc-${pub.id}`} value={pub.description || ''} onChange={(e) => handlePublicationChange(index, 'description', e.target.value)} className={`${inputClass} h-20`} rows={2}></textarea></div>
                </div>
            ))}
            <button type="button" onClick={addPublication} className={addButtonClass}>+ Add Publication</button>
        </section>

        {/* Seminars & Conferences Section - New */}
        <section className={sectionClass}>
            <h2 className={sectionTitleClass}>Seminars & Conferences</h2>
            {seminars.map((sem, index) => (
                <div key={sem.id} className={itemWrapperClass}>
                    <button type="button" onClick={() => removeSeminar(sem.id)} className={removeButtonClass} aria-label="Remove Seminar">X</button>
                    <h3 className={subSectionTitleClass}>Seminar/Conference #{index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor={`sem-name-${sem.id}`} className={labelClass}>Name</label><input type="text" id={`sem-name-${sem.id}`} value={sem.seminarName || ''} onChange={(e) => handleSeminarChange(index, 'seminarName', e.target.value)} className={inputClass} /></div>
                        <div>
                            <label htmlFor={`sem-role-${sem.id}`} className={labelClass}>Role</label>
                            <select id={`sem-role-${sem.id}`} value={sem.role || ''} onChange={(e) => handleSeminarChange(index, 'role', e.target.value as SeminarEntry['role'])} className={inputClass}>
                                <option value="">Select role</option>
                                <option value="Attendee">Attendee</option>
                                <option value="Speaker">Speaker</option>
                                <option value="Organizer">Organizer</option>
                            </select>
                        </div>
                        <div><label htmlFor={`sem-date-${sem.id}`} className={labelClass}>Date</label><input type="month" id={`sem-date-${sem.id}`} value={sem.date || ''} onChange={(e) => handleSeminarChange(index, 'date', e.target.value)} className={inputClass} /></div>
                        <div><label htmlFor={`sem-location-${sem.id}`} className={labelClass}>Location (Optional)</label><input type="text" id={`sem-location-${sem.id}`} value={sem.location || ''} onChange={(e) => handleSeminarChange(index, 'location', e.target.value)} className={inputClass} /></div>
                    </div>
                    <div><label htmlFor={`sem-desc-${sem.id}`} className={labelClass}>Description (Optional)</label><textarea id={`sem-desc-${sem.id}`} value={sem.description || ''} onChange={(e) => handleSeminarChange(index, 'description', e.target.value)} className={`${inputClass} h-20`} rows={2}></textarea></div>
                </div>
            ))}
            <button type="button" onClick={addSeminar} className={addButtonClass}>+ Add Seminar/Conference</button>
        </section>

        {/* Hobbies & Interests Section - New */}
        <section className={sectionClass}>
            <h2 className={sectionTitleClass}>Hobbies & Interests</h2>
            {hobbies.map((hobby, index) => (
                <div key={hobby.id} className={`${itemWrapperClass} !p-3`}>
                     <button type="button" onClick={() => removeHobby(hobby.id)} className={removeButtonClass} aria-label="Remove Hobby">X</button>
                    <div className="flex items-center">
                        <label htmlFor={`hobby-name-${hobby.id}`} className={`${labelClass} mr-2 sr-only`}>Hobby #{index + 1}</label>
                        <input type="text" id={`hobby-name-${hobby.id}`} value={hobby.hobbyName || ''} onChange={(e) => handleHobbyChange(index, 'hobbyName', e.target.value)} className={`${inputClass} !mt-0`} placeholder="e.g., Reading, Hiking" />
                    </div>
                </div>
            ))}
            <button type="button" onClick={addHobby} className={addButtonClass}>+ Add Hobby/Interest</button>
        </section>
        
        {/* Skills Summary Section (Existing - no changes) */}
        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Skills &amp; Other Information</h2>
          <div>
            <label htmlFor="dashboard-skills" className={labelClass}>
              General Skills Summary / Certifications (if not covered above)
            </label>
            <textarea
              id="dashboard-skills"
              value={skillsSummary}
              onChange={(e) => setSkillsSummary(e.target.value)}
              className={`${inputClass} h-32`}
              rows={5}
              placeholder="List your key skills, programming languages, tools, certifications, awards, etc."
            />
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Save All Profile Changes (UI Only)
          </button>
        </div>
      </form>

      {/* Account Settings Section (Existing - no changes) */}
      <section className={`${sectionClass} mt-12 border-t-2 border-red-200`}>
        <h2 className="text-xl font-semibold text-red-600 mb-4">Account Danger Zone</h2>
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

export default UserDashboardPage;
