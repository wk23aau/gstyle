
import React, { useState, useCallback, useEffect } from 'react';
// Now only generateCVContent (backend call) will be used by default.
// generateCVContentDirect is still in geminiService.ts but not used here.
import { generateCVContent } from '../services/geminiService'; 
import { LoadingSpinner } from '../constants';

const HeroSection: React.FC = () => {
  const [jobInfo, setJobInfo] = useState<string>('');
  const [cvResult, setCvResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [error]);

  useEffect(() => {
    if (cvResult) {
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  }, [cvResult]);


  const handleCreateCV = useCallback(async () => {
    if (!jobInfo.trim()) {
      setError('Please enter a job title or description.');
      setCvResult('');
      setShowResult(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setCvResult('');
    setShowResult(false);
    try {
      // Exclusively use the backend service call.
      const result = await generateCVContent(jobInfo); 
      setCvResult(result);
    } catch (err) {
      if (err instanceof Error) {
        // Error message now comes from the service (backend via fetch)
        setError(err.message); 
      } else {
        setError('An unknown error occurred while trying to generate the CV.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [jobInfo]);

  const dismissError = () => {
    setError(null);
  };

  return (
    <div className="text-center py-8 sm:py-12 md:py-16"> {/* Adjusted padding for responsiveness */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
        Craft Your Perfect CV with AI Precision
      </h1>
      <p className="text-md sm:text-lg text-gray-600 mb-8 sm:mb-10 max-w-xl sm:max-w-2xl mx-auto px-2"> {/* Responsive text size and padding */}
        Enter a job title or description, and let our AI build a tailored resume outline in minutes.
      </p>

      <div className="max-w-lg sm:max-w-xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md"> {/* Responsive padding and max-width */}
        <textarea
          value={jobInfo}
          onChange={(e) => setJobInfo(e.target.value)}
          placeholder="Paste job description or enter job title here (e.g., 'Software Engineer at Google'...)"
          className="w-full h-36 sm:h-40 p-3 bg-white text-gray-800 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500 resize-none text-sm sm:text-base" // Responsive text size
          disabled={isLoading}
          aria-label="Job title or description input"
        />
        <button
          onClick={handleCreateCV}
          disabled={isLoading || !jobInfo.trim()}
          className="mt-4 sm:mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded text-base sm:text-lg flex items-center justify-center transition-all duration-150 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" // Responsive padding and text
          aria-live="polite"
        >
          {isLoading ? (
            <>
              {LoadingSpinner}
              Generating...
            </>
          ) : (
            'Create My AI CV'
          )}
        </button>
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

      {showResult && cvResult && (
        <div className={`mt-8 sm:mt-10 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto text-left transition-opacity duration-500 ease-in-out ${showResult ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 px-2 sm:px-0">Generated CV Outline:</h2>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <pre className="whitespace-pre-wrap break-words text-gray-700 text-xs sm:text-sm leading-relaxed"> {/* Responsive text size */}
              {cvResult}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;