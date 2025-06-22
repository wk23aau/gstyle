
export interface AddressInfo {
  street?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface WorkExperience {
  id: string; 
  company?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  isPresent?: boolean;
  description?: string;
}

export interface EducationEntry {
  id: string; 
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface LanguageEntry {
  id: string;
  languageName?: string;
  proficiency?: 'Basic' | 'Conversational' | 'Fluent' | 'Native' | '';
}

export interface AwardEntry {
  id: string;
  awardName?: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface PublicationEntry {
  id: string;
  title?: string;
  journalOrPlatform?: string;
  date?: string;
  url?: string;
  description?: string;
}

export interface SeminarEntry {
  id: string;
  seminarName?: string;
  role?: 'Attendee' | 'Speaker' | 'Organizer' | '';
  date?: string;
  location?: string;
  description?: string;
}

export interface HobbyEntry {
  id: string;
  hobbyName?: string;
}

export interface User {
  id?: number | string; 
  name: string;
  email?: string;
  google_id?: string;
  role?: 'admin' | 'user';
  is_email_verified?: boolean; 
  hasLocalPassword?: boolean;
  phoneNumber?: string;
  linkedinUrl?: string;
  headline?: string;
  address?: AddressInfo;
  dateOfBirth?: string;
  profilePhotoUrl?: string;
  skillsSummary?: string;
  workExperiences?: WorkExperience[];
  educations?: EducationEntry[];
  languages?: LanguageEntry[];
  awards?: AwardEntry[];
  publications?: PublicationEntry[];
  seminars?: SeminarEntry[];
  hobbies?: HobbyEntry[];
  
  // New fields for credit system
  credits_available?: number;
  credits_last_reset_date?: string; // Expected as YYYY-MM-DD string from backend

}

export interface SignupResponse {
    message: string;
    email?: string; 
}
