
import React from 'react';
import type { EducationEntry } from '../../../types'; // Updated import

interface EducationSectionProps {
  educations: EducationEntry[];
  handleEducationChange: (index: number, field: keyof EducationEntry, value: string | boolean) => void;
  addEducationEntry: () => void;
  removeEducationEntry: (id: string) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  educations, handleEducationChange, addEducationEntry, removeEducationEntry
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
      <h2 className={sectionTitleClass}>Education</h2>
      {educations.map((edu, index) => (
        <div key={edu.id} className={itemWrapperClass}>
          <button type="button" onClick={() => removeEducationEntry(edu.id)} className={removeButtonClass} aria-label="Remove Education">X</button>
          <h3 className={subSectionTitleClass}>Education #{index + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`edu-institution-${edu.id}`} className={labelClass}>Institution Name</label>
              <input type="text" id={`edu-institution-${edu.id}`} value={edu.institution || ''} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`edu-degree-${edu.id}`} className={labelClass}>Degree/Certificate</label>
              <input type="text" id={`edu-degree-${edu.id}`} value={edu.degree || ''} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`edu-field-${edu.id}`} className={labelClass}>Field of Study</label>
              <input type="text" id={`edu-field-${edu.id}`} value={edu.fieldOfStudy || ''} onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`edu-start-${edu.id}`} className={labelClass}>Start Date</label>
              <input type="month" id={`edu-start-${edu.id}`} value={edu.startDate || ''} onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`edu-end-${edu.id}`} className={labelClass}>End Date/Expected</label>
              <input type="month" id={`edu-end-${edu.id}`} value={edu.endDate || ''} onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)} className={inputClass} disabled={edu.isCurrent} />
              <div className="mt-1">
                <input type="checkbox" id={`edu-current-${edu.id}`} checked={edu.isCurrent || false} onChange={(e) => handleEducationChange(index, 'isCurrent', e.target.checked)} className="mr-2 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"/>
                <label htmlFor={`edu-current-${edu.id}`} className="text-sm text-gray-600">I currently study here</label>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor={`edu-desc-${edu.id}`} className={labelClass}>Description/Achievements</label>
            <textarea id={`edu-desc-${edu.id}`} value={edu.description || ''} onChange={(e) => handleEducationChange(index, 'description', e.target.value)} className={`${inputClass} h-24`} rows={3}></textarea>
          </div>
        </div>
      ))}
      <button type="button" onClick={addEducationEntry} className={addButtonClass}>+ Add Education</button>
    </section>
  );
};

export default EducationSection;
