import React, { useState, useEffect, useCallback } from 'react';
import type { SavedCvSummary, SavedCvFull } from '../../../types';
import { getSavedCvs, deleteSavedCv, getFullSavedCv } from '../../../services/cvService';
import { LoadingSpinner } from '../../../constants';
import ViewCvModal from '../../ViewCvModal'; // Corrected import path

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.342.052.682.107 1.022.166m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);


const SavedCVsSection: React.FC = () => {
  const [savedCvs, setSavedCvs] = useState<SavedCvSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCvContent, setSelectedCvContent] = useState<string | null>(null);
  const [selectedCvQuery, setSelectedCvQuery] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null); // Store ID of CV being deleted

  const fetchCvs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cvs = await getSavedCvs();
      setSavedCvs(cvs);
    } catch (err) {
      setError((err as Error).message || 'Failed to load saved CVs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCvs();
  }, [fetchCvs]);

  const handleViewCv = async (cvId: number) => {
    try {
        setSelectedCvContent("Loading CV content..."); // Placeholder while loading
        setIsModalOpen(true);
        const fullCv = await getFullSavedCv(cvId);
        setSelectedCvContent(fullCv.generated_content);
        setSelectedCvQuery(fullCv.job_query);
    } catch (err) {
        setSelectedCvContent(`Error loading CV: ${(err as Error).message}`);
        setError((err as Error).message || 'Failed to load full CV content.');
    }
  };

  const handleDeleteCv = async (cvId: number) => {
    if (!window.confirm('Are you sure you want to delete this saved CV? This action cannot be undone.')) {
      return;
    }
    setIsDeleting(cvId);
    setError(null);
    try {
      await deleteSavedCv(cvId);
      setSavedCvs(prevCvs => prevCvs.filter(cv => cv.id !== cvId));
    } catch (err) {
      setError((err as Error).message || 'Failed to delete CV.');
    } finally {
      setIsDeleting(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCvContent(null);
    setSelectedCvQuery(null);
  };
  
  const sectionClass = "bg-white shadow rounded-lg p-6";
  const sectionTitleClass = "text-xl font-semibold text-gray-700 mb-6 border-b pb-2";

  return (
    <section className={sectionClass}>
      <h2 className={sectionTitleClass}>My Saved CVs</h2>
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          {LoadingSpinner} <span className="ml-2 text-gray-600">Loading your saved CVs...</span>
        </div>
      )}
      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-300 rounded-md text-sm">{error}</div>}
      
      {!isLoading && !error && savedCvs.length === 0 && (
        <p className="text-gray-500 text-center py-6">You haven't saved any CVs yet. Generated CVs will appear here.</p>
      )}

      {!isLoading && !error && savedCvs.length > 0 && (
        <div className="space-y-4">
          {savedCvs.map(cv => (
            <div key={cv.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Created: {new Date(cv.created_at).toLocaleDateString()}</p>
                <h3 className="text-md font-semibold text-gray-800 mt-1 break-words">
                  Query: <span className="font-normal">"{cv.job_query.substring(0, 100)}{cv.job_query.length > 100 ? '...' : ''}"</span>
                </h3>
                 {cv.generated_content_snippet && (
                     <p className="text-xs text-gray-500 mt-1 italic">
                        Preview: {cv.generated_content_snippet}...
                     </p>
                 )}
              </div>
              <div className="flex-shrink-0 flex space-x-2 mt-3 sm:mt-0">
                <button
                  onClick={() => handleViewCv(cv.id)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  title="View CV"
                  aria-label={`View CV for query ${cv.job_query.substring(0,30)}`}
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteCv(cv.id)}
                  disabled={isDeleting === cv.id}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
                  title="Delete CV"
                  aria-label={`Delete CV for query ${cv.job_query.substring(0,30)}`}
                >
                  {isDeleting === cv.id ? <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div> : <TrashIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ViewCvModal isOpen={isModalOpen} onClose={closeModal} cvContent={selectedCvContent} cvQuery={selectedCvQuery} />
    </section>
  );
};

export default SavedCVsSection;
