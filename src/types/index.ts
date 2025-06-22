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

export interface SavedCv {
  id: number;
  user_id?: number; // Optional on frontend if not always sent from all backend responses
  job_info_query: string;
  generated_cv_text: string;
  cv_title: string;
  tags: string[] | null; // Tags will be an array of strings
  created_at: string; // ISO date string
  updated_at?: string; // ISO date string, optional on frontend lists
}

// Types for CVRenderer component
export interface ContactInfo {
  name?: string; 
  phone?: string;
  email?: string;
  linkedin?: string;
  website?: string; 
  location?: string; 
  title?: string; // Job title or tagline
}

export interface ExperienceEntryCv { 
  title?: string;
  company?: string; 
  location?: string; 
  dates?: string;
  descriptions?: string[]; 
  placeholder?: string; // For AI instructional text
}

export interface EducationEntryCv {
  degree?: string;
  institution?: string;
  location?: string; 
  dates?: string;
  fieldOfStudy?: string; 
  descriptions?: string[]; 
  placeholder?: string; // For AI instructional text
}

export interface SkillSubSection {
  title: string;
  skills: string[];
}

export interface ParsedSection {
  id: string; // e.g., 'contact-information'
  title: string; // Raw title like "**1. Contact Information:**"
  cleanedTitle: string; // Cleaned title like "Contact Information"
  rawContent: string;
  contactInfo?: ContactInfo; 
  paragraph?: string; 
  listItems?: string[]; 
  items?: (ExperienceEntryCv | EducationEntryCv)[]; // For Experience, Education, Projects
  subSections?: SkillSubSection[]; // For categorized skills
}

// Props for the CVRenderer component itself
export interface CVRendererProps {
  cvText: string;
  userName?: string; // From currentUser
  userEmail?: string; // From currentUser
  userPhone?: string; // From currentUser
  userLinkedIn?: string; // From currentUser
  profileImageUrl?: string; // From currentUser
}