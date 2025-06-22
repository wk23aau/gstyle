
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import DataSharingGdprPage from './pages/DataSharingGdprPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import RequestVerificationPage from './pages/RequestVerificationPage';
import RequestPasswordResetPage from './pages/RequestPasswordResetPage';
import ResetPasswordPage from './pages/ResetPasswordPage';


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
  hasLocalPassword?: boolean; // Added to indicate if a password hash exists
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
}

// For signup response where user is not yet logged in
export interface SignupResponse {
    message: string;
    email?: string; // Optionally return email for UI messages
}


const Layout: React.FC<{
  isLoggedIn: boolean;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}> = ({ isLoggedIn, currentUser, onOpenAuthModal, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onOpenAuthModal={onOpenAuthModal}
        onLogout={onLogout}
      />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');

    if (storedUser && storedIsLoggedIn === 'true') {
      try {
        let parsedUser: User = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.name) {
          parsedUser.address = parsedUser.address || {};
          parsedUser.workExperiences = parsedUser.workExperiences || [];
          parsedUser.educations = parsedUser.educations || [];
          parsedUser.languages = parsedUser.languages || [];
          parsedUser.awards = parsedUser.awards || [];
          parsedUser.publications = parsedUser.publications || [];
          parsedUser.seminars = parsedUser.seminars || [];
          parsedUser.hobbies = parsedUser.hobbies || [];
          parsedUser.is_email_verified = parsedUser.is_email_verified || false; 
          parsedUser.hasLocalPassword = parsedUser.hasLocalPassword || false; // Initialize hasLocalPassword
          
          setCurrentUser(parsedUser);
          setIsLoggedIn(true);
          console.log("Session restored from localStorage:", parsedUser);
        } else {
          console.warn("Invalid user data in localStorage. Clearing session.");
          localStorage.removeItem('currentUser');
          localStorage.removeItem('isLoggedIn');  
        }
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
      }
    }
  }, []);


  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleLoginSuccess = useCallback((userData: User) => {
    console.log("Login success with user data (including role, verification status, and local password flag):", userData);
    const enrichedUserData: User = {
      ...userData,
      address: userData.address || {},
      workExperiences: userData.workExperiences || [],
      educations: userData.educations || [],
      languages: userData.languages || [],
      awards: userData.awards || [],
      publications: userData.publications || [],
      seminars: userData.seminars || [],
      hobbies: userData.hobbies || [],
      is_email_verified: userData.is_email_verified || false,
      hasLocalPassword: userData.hasLocalPassword || false, // Initialize hasLocalPassword
    };
    setIsLoggedIn(true);
    setCurrentUser(enrichedUserData); 
    setIsAuthModalOpen(false);

    try {
      localStorage.setItem('currentUser', JSON.stringify(enrichedUserData));
      localStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
      console.error("Failed to save session to localStorage:", error);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route 
          element={
            <Layout 
              isLoggedIn={isLoggedIn} 
              currentUser={currentUser} 
              onOpenAuthModal={openAuthModal}
              onLogout={handleLogout} 
            />
          }
        >
          <Route path="/" element={<HeroSection />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                {currentUser?.role === 'admin' ? (
                  <AdminDashboardPage currentUser={currentUser} />
                ) : (
                  <UserDashboardPage currentUser={currentUser} />
                )}
              </ProtectedRoute>
            } 
          />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/gdpr-consent" element={<DataSharingGdprPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/request-verification" element={<RequestVerificationPage />} />
          <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          onAuthSuccess={handleLoginSuccess}
        />
      )}
    </HashRouter>
  );
};

export default App;