
import React from 'react';
import type { HobbyEntry } from '../../../types'; // Updated import

interface HobbiesSectionProps {
  hobbies: HobbyEntry[];
  handleHobbyChange: (index: number, field: keyof HobbyEntry, value: string) => void;
  addHobby: () => void;
  removeHobby: (id: string) => void;
}

const HobbiesSection: React.FC<HobbiesSectionProps> = ({
  hobbies, handleHobbyChange, addHobby, removeHobby
}) => {
  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";
  const sectionClass = "bg-white shadow rounded-lg p-6";
  const sectionTitleClass = "text-xl font-semibold text-gray-700 mb-6 border-b pb-2";
  // const subSectionTitleClass = "text-lg font-medium text-gray-700 mb-3"; // Not used for simple list
  const itemWrapperClass = "mb-3 p-3 border border-gray-200 rounded-md space-y-3 relative";
  const removeButtonClass = "absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 hover:bg-red-100 p-1 rounded-full";
  const addButtonClass = "mt-2 px-4 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors text-sm";

  return (
    <section className={sectionClass}>
      <h2 className={sectionTitleClass}>Hobbies & Interests</h2>
      {hobbies.map((hobby, index) => (
        <div key={hobby.id} className={`${itemWrapperClass} !p-3`}>
          <button type="button" onClick={() => removeHobby(hobby.id)} className={removeButtonClass} aria-label="Remove Hobby">X</button>
          <div className="flex items-center">
            <label htmlFor={`hobby-name-${hobby.id}`} className={`${labelClass} mr-2 sr-only`}>Hobby #{index + 1}</label>
            <input type="text" id={`hobby-name-${hobby.id}`} value={hobby.hobbyName || ''} onChange={(e) => handleHobbyChange(index, 'hobbyName', e.target.value)} className={`${inputClass} !mt-0`} placeholder="e.g., Reading, Hiking" />
          </div>
        </div>
      ))}
      <button type="button" onClick={addHobby} className={addButtonClass}>+ Add Hobby/Interest</button>
    </section>
  );
};

export default HobbiesSection;
