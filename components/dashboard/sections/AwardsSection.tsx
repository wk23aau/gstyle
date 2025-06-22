
import React from 'react';
import type { AwardEntry } from '../../../types'; // Updated import

interface AwardsSectionProps {
  awards: AwardEntry[];
  handleAwardChange: (index: number, field: keyof AwardEntry, value: string) => void;
  addAward: () => void;
  removeAward: (id: string) => void;
}

const AwardsSection: React.FC<AwardsSectionProps> = ({
  awards, handleAwardChange, addAward, removeAward
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
      <h2 className={sectionTitleClass}>Awards & Recognitions</h2>
      {awards.map((award, index) => (
        <div key={award.id} className={itemWrapperClass}>
          <button type="button" onClick={() => removeAward(award.id)} className={removeButtonClass} aria-label="Remove Award">X</button>
          <h3 className={subSectionTitleClass}>Award #{index + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`award-name-${award.id}`} className={labelClass}>Award Name</label>
              <input type="text" id={`award-name-${award.id}`} value={award.awardName || ''} onChange={(e) => handleAwardChange(index, 'awardName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`award-issuer-${award.id}`} className={labelClass}>Issuer</label>
              <input type="text" id={`award-issuer-${award.id}`} value={award.issuer || ''} onChange={(e) => handleAwardChange(index, 'issuer', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`award-date-${award.id}`} className={labelClass}>Date Received</label>
              <input type="month" id={`award-date-${award.id}`} value={award.date || ''} onChange={(e) => handleAwardChange(index, 'date', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor={`award-desc-${award.id}`} className={labelClass}>Description (Optional)</label>
            <textarea id={`award-desc-${award.id}`} value={award.description || ''} onChange={(e) => handleAwardChange(index, 'description', e.target.value)} className={`${inputClass} h-20`} rows={2}></textarea>
          </div>
        </div>
      ))}
      <button type="button" onClick={addAward} className={addButtonClass}>+ Add Award</button>
    </section>
  );
};

export default AwardsSection;
