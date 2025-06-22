
import React from 'react';
import type { PublicationEntry } from '../../../types'; // Updated import

interface PublicationsSectionProps {
  publications: PublicationEntry[];
  handlePublicationChange: (index: number, field: keyof PublicationEntry, value: string) => void;
  addPublication: () => void;
  removePublication: (id: string) => void;
}

const PublicationsSection: React.FC<PublicationsSectionProps> = ({
  publications, handlePublicationChange, addPublication, removePublication
}) => {
  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";
  const sectionClass = "bg-white shadow rounded-lg p-6";
  const sectionTitleClass = "text-xl font-semibold text-gray-700 mb-6 border-b pb-2";
  const subSectionTitleClass = "text-lg font-medium text-gray-700 mb-3";
  const itemWrapperClass = "mb-6 p-4 border border-gray-200 rounded-md space-y-3 relative";
  const removeButtonClass = "absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 hover:bg-red-100 p-1 rounded-full";
  const addButtonClass = "mt-2 px-4 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors text-sm";

  return (
    <section className={sectionClass}>
      <h2 className={sectionTitleClass}>Publications</h2>
      {publications.map((pub, index) => (
        <div key={pub.id} className={itemWrapperClass}>
          <button type="button" onClick={() => removePublication(pub.id)} className={removeButtonClass} aria-label="Remove Publication">X</button>
          <h3 className={subSectionTitleClass}>Publication #{index + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`pub-title-${pub.id}`} className={labelClass}>Title</label>
              <input type="text" id={`pub-title-${pub.id}`} value={pub.title || ''} onChange={(e) => handlePublicationChange(index, 'title', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`pub-platform-${pub.id}`} className={labelClass}>Journal/Platform</label>
              <input type="text" id={`pub-platform-${pub.id}`} value={pub.journalOrPlatform || ''} onChange={(e) => handlePublicationChange(index, 'journalOrPlatform', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`pub-date-${pub.id}`} className={labelClass}>Publication Date</label>
              <input type="month" id={`pub-date-${pub.id}`} value={pub.date || ''} onChange={(e) => handlePublicationChange(index, 'date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`pub-url-${pub.id}`} className={labelClass}>URL (Optional)</label>
              <input type="url" id={`pub-url-${pub.id}`} value={pub.url || ''} onChange={(e) => handlePublicationChange(index, 'url', e.target.value)} className={inputClass} placeholder="https://example.com/publication"/>
            </div>
          </div>
          <div>
            <label htmlFor={`pub-desc-${pub.id}`} className={labelClass}>Description (Optional)</label>
            <textarea id={`pub-desc-${pub.id}`} value={pub.description || ''} onChange={(e) => handlePublicationChange(index, 'description', e.target.value)} className={`${inputClass} h-20`} rows={2}></textarea>
          </div>
        </div>
      ))}
      <button type="button" onClick={addPublication} className={addButtonClass}>+ Add Publication</button>
    </section>
  );
};

export default PublicationsSection;
