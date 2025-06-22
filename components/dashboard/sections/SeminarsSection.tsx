
import React from 'react';
import type { SeminarEntry } from '../../../types'; // Updated import

interface SeminarsSectionProps {
  seminars: SeminarEntry[];
  handleSeminarChange: (index: number, field: keyof SeminarEntry, value: string) => void;
  addSeminar: () => void;
  removeSeminar: (id: string) => void;
}

const SeminarsSection: React.FC<SeminarsSectionProps> = ({
  seminars, handleSeminarChange, addSeminar, removeSeminar
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
      <h2 className={sectionTitleClass}>Seminars & Conferences</h2>
      {seminars.map((sem, index) => (
        <div key={sem.id} className={itemWrapperClass}>
          <button type="button" onClick={() => removeSeminar(sem.id)} className={removeButtonClass} aria-label="Remove Seminar">X</button>
          <h3 className={subSectionTitleClass}>Seminar/Conference #{index + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`sem-name-${sem.id}`} className={labelClass}>Name</label>
              <input type="text" id={`sem-name-${sem.id}`} value={sem.seminarName || ''} onChange={(e) => handleSeminarChange(index, 'seminarName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`sem-role-${sem.id}`} className={labelClass}>Role</label>
              <select id={`sem-role-${sem.id}`} value={sem.role || ''} onChange={(e) => handleSeminarChange(index, 'role', e.target.value as SeminarEntry['role'])} className={inputClass}>
                <option value="">Select role</option>
                <option value="Attendee">Attendee</option>
                <option value="Speaker">Speaker</option>
                <option value="Organizer">Organizer</option>
              </select>
            </div>
            <div>
              <label htmlFor={`sem-date-${sem.id}`} className={labelClass}>Date</label>
              <input type="month" id={`sem-date-${sem.id}`} value={sem.date || ''} onChange={(e) => handleSeminarChange(index, 'date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`sem-location-${sem.id}`} className={labelClass}>Location (Optional)</label>
              <input type="text" id={`sem-location-${sem.id}`} value={sem.location || ''} onChange={(e) => handleSeminarChange(index, 'location', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor={`sem-desc-${sem.id}`} className={labelClass}>Description (Optional)</label>
            <textarea id={`sem-desc-${sem.id}`} value={sem.description || ''} onChange={(e) => handleSeminarChange(index, 'description', e.target.value)} className={`${inputClass} h-20`} rows={2}></textarea>
          </div>
        </div>
      ))}
      <button type="button" onClick={addSeminar} className={addButtonClass}>+ Add Seminar/Conference</button>
    </section>
  );
};

export default SeminarsSection;
