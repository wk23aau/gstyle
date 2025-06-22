
import React from 'react';
import type { WorkExperience } from '../../../types'; // Updated import

interface WorkExperienceSectionProps {
  workExperiences: WorkExperience[];
  handleWorkExperienceChange: (index: number, field: keyof WorkExperience, value: string | boolean) => void;
  addWorkExperience: () => void;
  removeWorkExperience: (id: string) => void;
}

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  workExperiences, handleWorkExperienceChange, addWorkExperience, removeWorkExperience
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
      <h2 className={sectionTitleClass}>Work Experience</h2>
      {workExperiences.map((exp, index) => (
        <div key={exp.id} className={itemWrapperClass}>
          <button type="button" onClick={() => removeWorkExperience(exp.id)} className={removeButtonClass} aria-label="Remove Experience">X</button>
          <h3 className={subSectionTitleClass}>Experience #{index + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`work-company-${exp.id}`} className={labelClass}>Company Name</label>
              <input type="text" id={`work-company-${exp.id}`} value={exp.company || ''} onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`work-title-${exp.id}`} className={labelClass}>Job Title</label>
              <input type="text" id={`work-title-${exp.id}`} value={exp.title || ''} onChange={(e) => handleWorkExperienceChange(index, 'title', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`work-start-${exp.id}`} className={labelClass}>Start Date</label>
              <input type="month" id={`work-start-${exp.id}`} value={exp.startDate || ''} onChange={(e) => handleWorkExperienceChange(index, 'startDate', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`work-end-${exp.id}`} className={labelClass}>End Date</label>
              <input type="month" id={`work-end-${exp.id}`} value={exp.endDate || ''} onChange={(e) => handleWorkExperienceChange(index, 'endDate', e.target.value)} className={inputClass} disabled={exp.isPresent} />
              <div className="mt-1">
                <input type="checkbox" id={`work-present-${exp.id}`} checked={exp.isPresent || false} onChange={(e) => handleWorkExperienceChange(index, 'isPresent', e.target.checked)} className="mr-2 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"/>
                <label htmlFor={`work-present-${exp.id}`} className="text-sm text-gray-600">I currently work here</label>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor={`work-desc-${exp.id}`} className={labelClass}>Responsibilities/Description</label>
            <textarea id={`work-desc-${exp.id}`} value={exp.description || ''} onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)} className={`${inputClass} h-24`} rows={3}></textarea>
          </div>
        </div>
      ))}
      <button type="button" onClick={addWorkExperience} className={addButtonClass}>+ Add Work Experience</button>
    </section>
  );
};

export default WorkExperienceSection;
