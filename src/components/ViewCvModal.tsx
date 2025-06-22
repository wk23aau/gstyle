import React from 'react';
import { CloseIcon } from '../constants';

interface ViewCvModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvContent: string | null;
  cvQuery?: string | null;
}

const ViewCvModal: React.FC<ViewCvModalProps> = ({ isOpen, onClose, cvContent, cvQuery }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100] transition-opacity duration-300" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="cv-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-95 opacity-0 animate-modalFadeInScaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200">
          <h2 id="cv-modal-title" className="text-lg sm:text-xl font-semibold text-gray-800">
            Saved CV {cvQuery && `- Query: "${cvQuery.substring(0,50)}${cvQuery.length > 50 ? '...' : ''}"`}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" 
            aria-label="Close CV viewer"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
          {cvContent ? (
            <pre className="whitespace-pre-wrap break-words text-gray-700 text-sm leading-relaxed font-sans">
              {cvContent}
            </pre>
          ) : (
            <p className="text-gray-500 text-center py-10">CV content not available or could not be loaded.</p>
          )}
        </div>

        <footer className="p-4 border-t border-gray-200 text-right">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Close
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ViewCvModal;