
import React from 'react';

interface SkillsSummarySectionProps {
  skillsSummary: string;
  setSkillsSummary: (value: string) => void;
}

const SkillsSummarySection: React.FC<SkillsSummarySectionProps> = ({
  skillsSummary, setSkillsSummary
}) => {
  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";
  const sectionClass = "bg-white shadow rounded-lg p-6";
  const sectionTitleClass = "text-xl font-semibold text-gray-700 mb-6 border-b pb-2";

  return (
    <section className={sectionClass}>
      <h2 className={sectionTitleClass}>Skills &amp; Other Information</h2>
      <div>
        <label htmlFor="dashboard-skills" className={labelClass}>
          General Skills Summary / Certifications (if not covered above)
        </label>
        <textarea
          id="dashboard-skills"
          value={skillsSummary}
          onChange={(e) => setSkillsSummary(e.target.value)}
          className={`${inputClass} h-32`}
          rows={5}
          placeholder="List your key skills, programming languages, tools, certifications, awards, etc."
        />
      </div>
    </section>
  );
};

export default SkillsSummarySection;
