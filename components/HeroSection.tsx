
import React, { useState, useCallback, useEffect } from 'react';
import { generateCVContent } from '../services/geminiService'; 
import { DefaultLoadingSpinner, GEMINI_CALL_COST, DEFAULT_CREDITS_UNREGISTERED, DEFAULT_CREDITS_REGISTERED } from '../constants';
import type { User } from '../types';
import CVRenderer from './cv/CVRenderer'; // Import the new CVRenderer

interface HeroSectionProps {
  currentUser: User | null;
  updateUserCredits: (newCredits: number) => void; // Callback to update App state
  onOpenAuthModal?: () => void; // Optional callback to open auth modal
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const HeroSection: React.FC<HeroSectionProps> = ({ currentUser, updateUserCredits, onOpenAuthModal }) => {
  const [jobInfo, setJobInfo] = useState<string>('');
  const [cvResult, setCvResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);

  // Unregistered user credit state
  const [unregisteredCredits, setUnregisteredCredits] = useState<number>(DEFAULT_CREDITS_UNREGISTERED);
  const [canUnregisteredGenerate, setCanUnregisteredGenerate] = useState<boolean>(true);

  useEffect(() => {
    if (!currentUser) { // Only manage localStorage for unregistered users
      const storedCreditsData = localStorage.getItem('unregisteredUserCredits');
      const today = getTodayDateString();
      if (storedCreditsData) {
        try {
          const parsed = JSON.parse(storedCreditsData);
          if (parsed.lastResetDate === today) {
            setUnregisteredCredits(parsed.count);
            setCanUnregisteredGenerate(parsed.count >= GEMINI_CALL_COST);
          } else { // Reset for new day
            localStorage.setItem('unregisteredUserCredits', JSON.stringify({ count: DEFAULT_CREDITS_UNREGISTERED, lastResetDate: today }));
            setUnregisteredCredits(DEFAULT_CREDITS_UNREGISTERED);
            setCanUnregisteredGenerate(true);
          }
        } catch (e) {
          localStorage.setItem('unregisteredUserCredits', JSON.stringify({ count: DEFAULT_CREDITS_UNREGISTERED, lastResetDate: today }));
        }
      } else {
        localStorage.setItem('unregisteredUserCredits', JSON.stringify({ count: DEFAULT_CREDITS_UNREGISTERED, lastResetDate: today }));
      }
    }
  }, [currentUser]);


  useEffect(() => {
    if (error) setShowError(true); else setShowError(false);
  }, [error]);

  useEffect(() => {
    if (cvResult) setShowResult(true); else setShowResult(false);
  }, [cvResult]);


  const handleCreateCV = useCallback(async () => {
    if (!jobInfo.trim()) {
      setError('Please enter a job title or description.');
      setCvResult('');
      setShowResult(false);
      setSaveSuccessMessage(null);
      return;
    }

    // Credit Check
    if (currentUser) {
        if (currentUser.credits_available === undefined || currentUser.credits_available < GEMINI_CALL_COST) {
            setError(`Insufficient credits. You have ${currentUser.credits_available || 0} credits remaining. Daily credits reset automatically.`);
            setSaveSuccessMessage(null);
            return;
        }
    } else { // Unregistered user
        if (unregisteredCredits < GEMINI_CALL_COST) {
            setError(`You have used all your ${DEFAULT_CREDITS_UNREGISTERED} free CV generations for today. Please sign up for more or try again tomorrow.`);
            setCanUnregisteredGenerate(false);
            setSaveSuccessMessage(null);
            return;
        }
    }

    setIsLoading(true);
    setError(null);
    setSaveSuccessMessage(null);
    setCvResult('');
    setShowResult(false);

    try {
      const result = await generateCVContent(jobInfo, currentUser?.id); 
      setCvResult(result);

      // Deduct credits on success
      if (currentUser && currentUser.id) {
        const newCredits = (currentUser.credits_available || 0) - GEMINI_CALL_COST;
        updateUserCredits(newCredits < 0 ? 0 : newCredits); // Update App state
        setSaveSuccessMessage("CV outline generated and automatically saved to your dashboard!");
      } else {
        const newCount = unregisteredCredits - GEMINI_CALL_COST;
        setUnregisteredCredits(newCount);
        localStorage.setItem('unregisteredUserCredits', JSON.stringify({ count: newCount, lastResetDate: getTodayDateString() }));
        setCanUnregisteredGenerate(newCount >= GEMINI_CALL_COST);
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); 
      } else {
        setError('An unknown error occurred while trying to generate the CV.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [jobInfo, currentUser, unregisteredCredits, updateUserCredits]);

  const dismissError = () => {
    setError(null);
  };

  const dismissSuccessMessage = () => {
    setSaveSuccessMessage(null);
  }
  
  const getCreditMessage = () => {
    if (currentUser) {
      const credits = currentUser.credits_available;
      if (typeof credits === 'number') {
        return `Welcome, ${currentUser.name}! You have ${credits}/${DEFAULT_CREDITS_REGISTERED} CV generation credits remaining today.`;
      }
      return `Welcome, ${currentUser.name}! Checking your credits...`;
    } else { // Unregistered user
      const registerButton = onOpenAuthModal ? (
        <button onClick={onOpenAuthModal} className="text-blue-600 hover:text-blue-700 underline font-semibold focus:outline-none">
          {canUnregisteredGenerate ? "Register" : "Sign up"}
        </button>
      ) : (
        "Register/Sign up"
      );

      if (!canUnregisteredGenerate) {
        return (
          <>
            You've used all {DEFAULT_CREDITS_UNREGISTERED} free CV generations for today. {registerButton} for {DEFAULT_CREDITS_REGISTERED} daily credits!
          </>
        );
      }
      return (
        <>
          You have {unregisteredCredits}/{DEFAULT_CREDITS_UNREGISTERED} free CV generations left today. {registerButton} to upgrade to {DEFAULT_CREDITS_REGISTERED} daily credits!
        </>
      );
    }
  };

  const canGenerate = currentUser ? (currentUser.credits_available !== undefined && currentUser.credits_available >= GEMINI_CALL_COST) : canUnregisteredGenerate;


  return (
    <div className="text-center py-8 sm:py-12 md:py-16">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
        Craft Your Perfect CV with AI Precision
      </h1>
      <p className="text-md sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto px-2">
        Enter a job title or description, and let our AI build a tailored resume outline in minutes.
      </p>

      <div className="max-w-lg sm:max-w-xl mx-auto mb-4 text-sm text-blue-700 p-3 bg-blue-50 rounded-md border border-blue-200">
        {getCreditMessage()}
      </div>

      <div className="max-w-lg sm:max-w-xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
        <textarea
          value={jobInfo}
          onChange={(e) => setJobInfo(e.target.value)}
          placeholder="Paste job description or enter job title here (e.g., 'Software Engineer at Google'...)"
          className="w-full h-36 sm:h-40 p-3 bg-white text-gray-800 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500 resize-none text-sm sm:text-base"
          disabled={isLoading || !canGenerate}
          aria-label="Job title or description input"
        />
        <div className="relative group mt-4 sm:mt-6">
            <button
            onClick={handleCreateCV}
            disabled={isLoading || !jobInfo.trim() || !canGenerate}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded text-base sm:text-lg flex items-center justify-center transition-all duration-150 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-live="polite"
            >
            {isLoading ? (
                <>
                <DefaultLoadingSpinner />
                Generating...
                </>
            ) : (
                'Create My AI CV'
            )}
            </button>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                Cost: {GEMINI_CALL_COST} credits per generation
            </span>
        </div>
      </div>

      {showError && error && (
        <div 
          className={`mt-6 sm:mt-8 max-w-lg sm:max-w-xl mx-auto bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md relative transition-opacity duration-300 ease-in-out ${showError ? 'opacity-100' : 'opacity-0'}`} 
          role="alert"
        >
          <strong className="font-bold">Oops! </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={dismissError}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-500 hover:text-red-700 focus:outline-none transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </button>
        </div>
      )}

      {saveSuccessMessage && (
        <div 
          className="mt-6 sm:mt-8 max-w-lg sm:max-w-xl mx-auto bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-md relative transition-opacity duration-300 ease-in-out opacity-100" 
          role="status"
        >
          <span className="block sm:inline">{saveSuccessMessage}</span>
          <button
            onClick={dismissSuccessMessage}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-500 hover:text-green-700 focus:outline-none transition-colors"
            aria-label="Dismiss success message"
          >
            <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </button>
        </div>
      )}

      {showResult && cvResult && (
        <div className={`mt-8 sm:mt-10 mx-auto text-left transition-opacity duration-500 ease-in-out ${showResult ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 px-2 sm:px-0 text-center">Generated CV Outline:</h2>
          <CVRenderer 
            cvText={cvResult} 
            userName={currentUser?.name}
            userEmail={currentUser?.email}
            userPhone={currentUser?.phoneNumber}
            userLinkedIn={currentUser?.linkedinUrl}
            profileImageUrl={currentUser?.profilePhotoUrl}
          />
        </div>
      )}
    </div>
  );
};

export default HeroSection;