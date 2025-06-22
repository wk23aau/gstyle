
import React from 'react';
import type { LanguageEntry } from '../../../types'; // Updated import

interface LanguagesSectionProps {
  languages: LanguageEntry[];
  handleLanguageChange: (index: number, field: keyof LanguageEntry, value: string) => void;
  addLanguage: () => void;
  removeLanguage: (id: string) => void;
}

const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  languages, handleLanguageChange, addLanguage, removeLanguage
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
  );
};

export default LanguagesSection;
