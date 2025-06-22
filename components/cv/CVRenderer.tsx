import React, { useState, useEffect } from 'react';
import type { ParsedSection, ContactInfo, ExperienceEntryCv, EducationEntryCv, CVRendererProps, SkillSubSection } from '../../src/types';
import { UserProfileIcon, PhoneIcon, EmailIcon, LinkedInIcon, WebsiteIcon, LocationIcon, ChevronLeftIcon, ChevronRightIcon } from '../../constants';

// Helper function to render text with **bold** markdown
const renderFormattedText = (text: string): React.ReactNode => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g); // Split by bold tags
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
    }
    return part;
  });
};


// Helper function to clean section titles
const cleanTitle = (title: string): string => {
  return title.replace(/^\s*\d+\.\s*/, '').replace(/\*\*/g, '').replace(/:$/, '').trim();
};

const parseCvTextToSections = (text: string, externalContact?: Partial<ContactInfo>): ParsedSection[] => {
  const sections: ParsedSection[] = [];
  if (!text || !text.trim()) return sections;

  const lines = text.split('\n');
  let currentRawTitle: string | null = null;
  let currentSectionContent: string[] = [];
  
  let cvMainDocumentTitle: string | null = null;
  if (lines.length > 0 && lines[0].match(/^\s*\*\*(.+?)\*\*\s*$/) && !lines[0].match(/^\s*\d+\.\s*\*\*(Contact Information|Summary|Objective|Skills|Experience|Education|Projects)/i)) {
    cvMainDocumentTitle = lines[0].replace(/\*\*/g, '').trim();
  }


  const sectionHeadersRegex = /^\s*\d+\.\s*\*\*(Contact Information|Summary\/Objective|Personal Profile|Summary|Objective|Skills|Technical Skills|Software Skills|Work Experience|Experience|Education|Projects|Certifications\/Licenses|Certifications|Licenses|Awards\/Recognitions|Awards|Languages|Note)\b(?::)?\*\*\s*$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.trim().match(sectionHeadersRegex);

    if (headerMatch) {
      if (currentRawTitle) {
        sections.push({
          id: cleanTitle(currentRawTitle).toLowerCase().replace(/[\s/]+/g, '-'),
          title: currentRawTitle.trim(),
          cleanedTitle: cleanTitle(currentRawTitle),
          rawContent: currentSectionContent.join('\n'),
        });
      }
      currentRawTitle = headerMatch[0].trim();
      currentSectionContent = [];
    } else if (currentRawTitle) {
      currentSectionContent.push(line);
    }
  }

  if (currentRawTitle) {
    sections.push({
      id: cleanTitle(currentRawTitle).toLowerCase().replace(/[\s/]+/g, '-'),
      title: currentRawTitle.trim(),
      cleanedTitle: cleanTitle(currentRawTitle),
      rawContent: currentSectionContent.join('\n'),
    });
  }
  
  return sections.map(section => {
    const cleanedLowerTitle = section.cleanedTitle.toLowerCase();
    
    if (cleanedLowerTitle.includes('contact information')) {
      const contactItems = section.rawContent.split('\n')
        .map(item => item.replace(/^[\s*-]\s*/, '').trim())
        .filter(item => item);
      
      const contactInfo: ContactInfo = { 
        name: externalContact?.name || cvMainDocumentTitle || "Your Name",
        title: externalContact?.title || (cvMainDocumentTitle && cvMainDocumentTitle !== (externalContact?.name || "Your Name") ? cvMainDocumentTitle : "Professional Title")
      };

      contactItems.forEach(item => {
        const itemLower = item.toLowerCase();
        if (itemLower.includes('phone')) contactInfo.phone = item.replace(/phone(?: number)?:\s*/i, '').trim();
        else if (itemLower.includes('email')) contactInfo.email = item.replace(/email(?: address)?:\s*/i, '').trim();
        else if (itemLower.includes('linkedin')) contactInfo.linkedin = item.replace(/linkedin(?: profile url)?:\s*/i, '').trim();
        else if (itemLower.includes('portfolio') || itemLower.includes('website')) contactInfo.website = item.replace(/(?:portfolio|website)(?: url)?(?: \(if applicable\))?:\s*/i, '').trim();
        else if (itemLower.includes('location') || itemLower.includes('address')) contactInfo.location = item.replace(/(?:location|address)?:\s*/i, '').trim();
        else if (itemLower.startsWith('name:') && !contactInfo.name) contactInfo.name = item.substring('name:'.length).trim();
        else if (itemLower.startsWith('title:') && !contactInfo.title) contactInfo.title = item.substring('title:'.length).trim();
      });

      // Prioritize external props
      if (externalContact?.name) contactInfo.name = externalContact.name;
      if (externalContact?.email) contactInfo.email = externalContact.email;
      if (externalContact?.phone) contactInfo.phone = externalContact.phone;
      if (externalContact?.linkedin) contactInfo.linkedin = externalContact.linkedin;
      if (externalContact?.website) contactInfo.website = externalContact.website;
      if (externalContact?.location) contactInfo.location = externalContact.location;
      if (externalContact?.title) contactInfo.title = externalContact.title;
      
      return { ...section, contactInfo };
    }
    if (cleanedLowerTitle.includes('summary') || cleanedLowerTitle.includes('objective') || cleanedLowerTitle.includes('personal profile')) {
      return { ...section, paragraph: section.rawContent.replace(/^[\s*-]\s*/gm, '').trim() };
    }
     if (cleanedLowerTitle.includes('skills')) {
        const skillSubSections: SkillSubSection[] = [];
        let currentSkillCategoryTitle: string | null = null;
        let currentSkillsForCategory: string[] = [];
        const skillLines = section.rawContent.split('\n').map(l => l.trim()).filter(Boolean);

        for (const line of skillLines) {
            const subHeaderMatch = line.match(/^\s*\*\*(.+?):\*\*\s*$/i); // e.g., **Talent Acquisition & Recruitment:**
            if (subHeaderMatch) {
                if (currentSkillCategoryTitle) { // Push previous category's skills
                    skillSubSections.push({ title: currentSkillCategoryTitle, skills: currentSkillsForCategory });
                }
                currentSkillCategoryTitle = subHeaderMatch[1].trim();
                currentSkillsForCategory = [];
            } else if (line.startsWith('* ') || line.startsWith('- ')) { // It's a skill item
                const skill = line.substring(2).trim();
                if (skill) {
                    if (!currentSkillCategoryTitle) { // Skills listed before any sub-category
                        currentSkillCategoryTitle = "Key Skills"; // Default category title
                    }
                    currentSkillsForCategory.push(skill);
                }
            } else if (line && !currentSkillCategoryTitle) { // A line that is not a sub-header and no category started, treat as skill under default
                 currentSkillCategoryTitle = "Key Skills";
                 currentSkillsForCategory.push(line.trim());
            } else if (line && currentSkillCategoryTitle) { // A line that is not a sub-header but a category has started, treat as skill for current category
                 currentSkillsForCategory.push(line.trim());
            }
        }
        if (currentSkillCategoryTitle) { // Push the last category's skills
            skillSubSections.push({ title: currentSkillCategoryTitle, skills: currentSkillsForCategory });
        }
        
        if (skillSubSections.length > 0) return { ...section, subSections: skillSubSections };
        
        // Fallback for non-categorized skills (if regex for subheaders fails or structure is flat)
        const listItems = section.rawContent.split('\n')
            .map(item => item.replace(/^[\s*-]\s*/, '').trim())
            .filter(item => item);
        return { ...section, listItems };
    }

    if (cleanedLowerTitle.includes('experience') || cleanedLowerTitle.includes('projects')) {
      const items: ExperienceEntryCv[] = [];
      let currentItem: Partial<ExperienceEntryCv> = { descriptions: [] };
      const itemLines = section.rawContent.split('\n');
      let placeholderText = "";

      itemLines.forEach(line => {
        const trimmedLineOriginal = line.trim();
        const trimmedLine = trimmedLineOriginal.replace(/^[\s*-]\s*/, '');
        if (!trimmedLine) return;

        if (trimmedLine.toLowerCase().startsWith('job title:')) currentItem.title = trimmedLine.substring('job title:'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('project title:')) currentItem.title = trimmedLine.substring('project title:'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('company name, location:')) currentItem.company = trimmedLine.substring('company name, location:'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('company name:')) currentItem.company = trimmedLine.substring('company name:'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('location:')) currentItem.location = trimmedLine.substring('location:'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('dates of employment:')) currentItem.dates = trimmedLine.substring('dates of employment:'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('dates:')) currentItem.dates = trimmedLine.substring('dates:'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('key responsibilities and achievements')) {
             if (trimmedLine.length > 'key responsibilities and achievements:'.length) { // Content on same line
                currentItem.descriptions?.push(trimmedLine.substring('key responsibilities and achievements:'.length).replace(/^[\s*:-]\s*/, '').trim());
            }
            placeholderText = " (Detail achievements using action verbs; quantify results where possible)";
        } else if (trimmedLineOriginal.startsWith('*') || trimmedLineOriginal.startsWith('-') || currentItem.title) { // Assumed description if starts with bullet or title is set
            if (currentItem.descriptions && trimmedLine) currentItem.descriptions.push(trimmedLine);
        } else if (trimmedLine && !currentItem.title) { // If no title yet and not a specific field, assume it's the title
            currentItem.title = trimmedLine;
        }

        // Heuristic to start a new item: if a new Job Title or Project Title is encountered
        if ((trimmedLine.toLowerCase().startsWith('job title:') || trimmedLine.toLowerCase().startsWith('project title:')) && (currentItem.company || (currentItem.descriptions && currentItem.descriptions.length > 0) || currentItem.dates)) {
            if (currentItem.title || currentItem.company) { // Ensure there's something to push
                currentItem.placeholder = placeholderText;
                items.push({ ...currentItem } as ExperienceEntryCv);
            }
            currentItem = { descriptions: [], title: trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim() };
            placeholderText = "";
        }
      });
      if (currentItem.title || currentItem.company) {
        currentItem.placeholder = placeholderText;
        items.push({ ...currentItem } as ExperienceEntryCv);
      }
      return { ...section, items };
    }

    if (cleanedLowerTitle.includes('education')) {
      const items: EducationEntryCv[] = [];
      let currentItem: Partial<EducationEntryCv> = { descriptions: [] };
      const itemLines = section.rawContent.split('\n');
      let placeholderText = "";

      itemLines.forEach(line => {
        const trimmedLine = line.trim().replace(/^[\s*-]\s*/, '');
        if (!trimmedLine) return;

        if (trimmedLine.toLowerCase().startsWith('degree name:')) currentItem.degree = trimmedLine.substring('degree name:'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('major/field of study:')) currentItem.fieldOfStudy = trimmedLine.substring('major/field of study:'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('university name, location:')) currentItem.institution = trimmedLine.substring('university name, location:'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('university name:')) currentItem.institution = trimmedLine.substring('university name:'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('location:')) currentItem.location = trimmedLine.substring('location:'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('graduation date (or expected):')) currentItem.dates = trimmedLine.substring('graduation date (or expected):'.length).trim();
        else if (trimmedLine.toLowerCase().startsWith('graduation date:')) currentItem.dates = trimmedLine.substring('graduation date:'.length).trim();
        else {
            if(currentItem.descriptions && trimmedLine) currentItem.descriptions.push(trimmedLine);
        }
         // Heuristic to start a new item
        if (trimmedLine.toLowerCase().startsWith('degree name:') && (currentItem.institution || currentItem.dates || (currentItem.descriptions && currentItem.descriptions.length > 0))) {
            if (currentItem.degree || currentItem.institution) {
                 currentItem.placeholder = placeholderText;
                items.push({ ...currentItem } as EducationEntryCv);
            }
            currentItem = { descriptions: [], degree: trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim() };
            placeholderText = "";
        }
      });
       if (currentItem.degree || currentItem.institution) {
        currentItem.placeholder = placeholderText;
        items.push({ ...currentItem } as EducationEntryCv);
      }
      return { ...section, items };
    }
     if (cleanedLowerTitle.includes('note')) {
      return { ...section, paragraph: section.rawContent.trim() };
    }
    
    const listItems = section.rawContent.split('\n')
      .map(item => item.replace(/^[\s*-]\s*/, '').trim())
      .filter(item => item);
    return { ...section, listItems };
  });
};


const CVRenderer: React.FC<CVRendererProps> = ({ 
  cvText,
  userName: propUserName,
  userEmail: propUserEmail,
  userPhone: propUserPhone,
  userLinkedIn: propUserLinkedIn,
  profileImageUrl 
}) => {
  
  const initialContact: Partial<ContactInfo> = {
    name: propUserName,
    email: propUserEmail,
    phone: propUserPhone,
    linkedin: propUserLinkedIn,
  };
  
  const parsedSections = parseCvTextToSections(cvText, initialContact);
  
  const contactData = parsedSections.find(s => s.contactInfo)?.contactInfo || initialContact;
  const summarySection = parsedSections.find(s => s.cleanedTitle.toLowerCase().includes('summary') || s.cleanedTitle.toLowerCase().includes('objective') || s.cleanedTitle.toLowerCase().includes('personal profile'));
  
  const name = contactData?.name || "Your Name";
  const cvTitle = contactData?.title || (name === "Your Name" ? "CV Outline" : "Resume");
  const email = contactData?.email;
  const phone = contactData?.phone;
  const linkedIn = contactData?.linkedin;
  const website = contactData?.website;
  const location = contactData?.location;

  const mainContentSections = parsedSections.filter(s => 
    !s.cleanedTitle.toLowerCase().includes('contact information') && 
    !s.cleanedTitle.toLowerCase().includes('summary') &&
    !s.cleanedTitle.toLowerCase().includes('objective') &&
    !s.cleanedTitle.toLowerCase().includes('personal profile') &&
    s.cleanedTitle
  );

  // Background switcher state and logic
  const [backgroundStyles, setBackgroundStyles] = useState<string[]>([]);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const NUM_BACKGROUNDS_TO_GENERATE = 30;

  const generateHSLColor = (lMin = 75, lMax = 95, sMin = 40, sMax = 70): string => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * (sMax - sMin + 1)) + sMin;
    const l = Math.floor(Math.random() * (lMax - lMin + 1)) + lMin;
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const generateRandomGradient = (): string => {
    const type = Math.random() > 0.5 ? 'linear' : 'radial';
    const numColors = Math.random() > 0.4 ? (Math.random() > 0.6 ? 3 : 2) : 2; // Bias towards 2 colors
    const colors = Array.from({ length: numColors }, () => generateHSLColor());

    if (type === 'linear') {
      const angle = Math.floor(Math.random() * 360);
      return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
    } else {
      const shapes = ['circle', 'ellipse'];
      const positions = ['center', 'top left', 'top right', 'bottom left', 'bottom right', 'center top', 'center bottom'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const position = Math.random() > 0.3 ? `at ${positions[Math.floor(Math.random() * positions.length)]}` : '';
      return `radial-gradient(${shape} ${position}, ${colors.join(', ')})`;
    }
  };

  useEffect(() => {
    const styles: string[] = ["#FFFFFF"]; // Start with a plain white background as the first option
    for (let i = 0; i < NUM_BACKGROUNDS_TO_GENERATE -1; i++) {
      styles.push(generateRandomGradient());
    }
    setBackgroundStyles(styles);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleNextBackground = () => {
    setCurrentBackgroundIndex((prevIndex) => (prevIndex + 1) % backgroundStyles.length);
  };

  const handlePrevBackground = () => {
    setCurrentBackgroundIndex((prevIndex) => (prevIndex - 1 + backgroundStyles.length) % backgroundStyles.length);
  };


  const renderSectionContent = (section: ParsedSection) => {
    if (section.paragraph) {
      return <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{renderFormattedText(section.paragraph)}</p>;
    }
    if (section.listItems && section.listItems.length > 0) {
      return (
        <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-gray-700">
          {section.listItems.map((item, index) => <li key={index} className="break-words">{renderFormattedText(item)}</li>)}
        </ul>
      );
    }
    if (section.subSections && section.subSections.length > 0) {
        return (
            <div className="space-y-3">
                {section.subSections.map((sub, idx) => (
                    <div key={idx}>
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">{renderFormattedText(sub.title)}</h4>
                        <ul className="list-disc list-outside pl-5 space-y-0.5 text-xs text-gray-600">
                            {sub.skills.map((skill, skillIdx) => <li key={skillIdx} className="break-words">{renderFormattedText(skill)}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        );
    }
    if (section.items && section.items.length > 0) {
      const isExperience = section.cleanedTitle.toLowerCase().includes('experience') || section.cleanedTitle.toLowerCase().includes('projects');
      const isEducation = section.cleanedTitle.toLowerCase().includes('education');

      return (
          <div className="space-y-4">
            {(section.items).map((item, index) => (
              <div key={index} className="text-sm_"> {/* Removed text-sm from here to allow children to control size */}
                {(isExperience && (item as ExperienceEntryCv).title) && <h4 className="font-bold text-gray-900 text-sm">{renderFormattedText((item as ExperienceEntryCv).title!)}</h4>}
                {(isEducation && (item as EducationEntryCv).degree) && <h4 className="font-bold text-gray-900 text-sm">{renderFormattedText((item as EducationEntryCv).degree!)}</h4>}

                {(isExperience && (item as ExperienceEntryCv).company) && <p className="text-xs text-gray-700 font-medium">{renderFormattedText((item as ExperienceEntryCv).company!)}{ (item as ExperienceEntryCv).location && `, ${renderFormattedText((item as ExperienceEntryCv).location!)}`}</p>}
                {(isEducation && (item as EducationEntryCv).institution) && <p className="text-xs text-gray-700 font-medium">{renderFormattedText((item as EducationEntryCv).institution!)}{ (item as EducationEntryCv).location && `, ${renderFormattedText((item as EducationEntryCv).location!)}`}</p>}
                
                {(item as ExperienceEntryCv | EducationEntryCv).dates && <p className="text-xs text-gray-500 italic mb-1">{renderFormattedText((item as ExperienceEntryCv | EducationEntryCv).dates!)}</p>}
                {(isEducation && (item as EducationEntryCv).fieldOfStudy) && <p className="text-xs text-gray-500 mb-1">{renderFormattedText((item as EducationEntryCv).fieldOfStudy!)}</p>}
                
                {(item as ExperienceEntryCv | EducationEntryCv).descriptions && ((item as ExperienceEntryCv | EducationEntryCv).descriptions?.length ?? 0) > 0 && (
                  <ul className="list-disc list-outside pl-5 mt-1 space-y-0.5 text-xs text-gray-600">
                    {(item as ExperienceEntryCv | EducationEntryCv).descriptions!.map((desc, i) => <li key={i} className="break-words">{renderFormattedText(desc)}</li>)}
                  </ul>
                )}
                {(item as ExperienceEntryCv | EducationEntryCv).placeholder && <p className="text-xs text-gray-400 italic mt-1">{renderFormattedText((item as ExperienceEntryCv | EducationEntryCv).placeholder!)}</p>}
              </div>
            ))}
          </div>
        );
    }
    if (section.rawContent && !section.paragraph && !section.listItems?.length && !section.items?.length && !section.subSections?.length) {
      // For sections that didn't parse into a specific structure but have content (like "Note")
      return <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{renderFormattedText(section.rawContent)}</p>;
    }
    return <p className="text-sm text-gray-500 italic">Content for this section could not be structured. Raw: {section.rawContent.substring(0,100)}</p>;
  };
  
  const currentBgStyle = backgroundStyles.length > 0 ? backgroundStyles[currentBackgroundIndex] : "#FFFFFF";

  return (
    <div className="max-w-4xl mx-auto my-4">
      {backgroundStyles.length > 0 && (
        <div className="mb-2 p-2 bg-gray-100 rounded-md shadow flex items-center justify-between print:hidden">
          <button
            onClick={handlePrevBackground}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Previous Background"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-xs text-gray-700 font-medium">
            Style {currentBackgroundIndex + 1} of {backgroundStyles.length}
          </span>
          <button
            onClick={handleNextBackground}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Next Background"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      <div 
        style={{ 
          backgroundImage: currentBgStyle,
          transition: 'background-image 0.4s ease-in-out'
        }}
        className="p-2 sm:p-0 font-['Georgia',_serif] text-gray-800 shadow-lg rounded-md border border-gray-200 relative overflow-hidden print-container"
      >
        <div className="p-4 md:p-8 flex flex-col md:grid md:grid-cols-cvLayout gap-6">
          {/* Left Column / Sidebar */}
          <aside className="bg-slate-50 p-4 rounded-md print:bg-slate-50 flex flex-col items-center md:items-start print:shadow-none shadow-sm">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 border-2 border-slate-200 shadow-md mb-4 mx-auto md:mx-0">
                  {profileImageUrl ? (
                  <img src={profileImageUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                  <UserProfileIcon className="w-full h-full text-gray-400 p-4" />
                  )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center md:text-left font-['Roboto',_sans-serif]">{name}</h1>
              <p className="text-sm text-slate-600 mb-4 text-center md:text-left font-['Roboto',_sans-serif]">{cvTitle}</p>

              <div className="space-y-2.5 text-xs text-slate-700 w-full">
                  {phone && <div className="flex items-center"><PhoneIcon className="w-3.5 h-3.5 mr-2.5 text-slate-500 flex-shrink-0" /> <span className="break-all">{phone}</span></div>}
                  {email && <div className="flex items-center"><EmailIcon className="w-3.5 h-3.5 mr-2.5 text-slate-500 flex-shrink-0" /> <span className="break-all">{email}</span></div>}
                  {location && <div className="flex items-center"><LocationIcon className="w-3.5 h-3.5 mr-2.5 text-slate-500 flex-shrink-0" /> <span className="break-all">{location}</span></div>}
                  {linkedIn && <div className="flex items-center"><LinkedInIcon className="w-3.5 h-3.5 mr-2.5 text-slate-500 flex-shrink-0" /> <a href={linkedIn.startsWith('http') ? linkedIn : `https://${linkedIn}`} target="_blank" rel="noopener noreferrer" className="hover:underline break-all text-blue-600">{linkedIn.replace(/https?:\/\//, '')}</a></div>}
                  {website && <div className="flex items-center"><WebsiteIcon className="w-3.5 h-3.5 mr-2.5 text-slate-500 flex-shrink-0" /> <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="hover:underline break-all text-blue-600">{website.replace(/https?:\/\//, '')}</a></div>}
              </div>
              
              {summarySection && (
                  <section className="mt-6 pt-4 border-t border-slate-300 w-full">
                      <h3 className="text-sm font-semibold text-slate-700 mb-1 uppercase tracking-wider font-['Roboto',_sans-serif]">
                          {summarySection.cleanedTitle}
                      </h3>
                      {summarySection.paragraph && <p className="text-xs text-slate-600 leading-normal whitespace-pre-wrap">{renderFormattedText(summarySection.paragraph)}</p>}
                  </section>
              )}
          </aside>

          {/* Right Column / Main Content */}
          <main className="space-y-5 bg-white/80 backdrop-blur-sm p-4 rounded-md print:bg-transparent print:backdrop-blur-none print:p-0 print:shadow-none shadow-sm">
              {mainContentSections.map((section) => {
                if (!section.cleanedTitle || (!section.paragraph && !section.listItems?.length && !section.items?.length && !section.rawContent?.trim() && !section.subSections?.length)) {
                   return null; 
                }
                return (
                  <section key={section.id} aria-labelledby={section.id + '-heading'}>
                    <h3 id={section.id + '-heading'} className="text-base font-bold text-slate-700 mb-2 uppercase tracking-wider border-b-2 border-slate-200 pb-1 font-['Roboto',_sans-serif]">
                      {section.cleanedTitle}
                    </h3>
                    {renderSectionContent(section)}
                  </section>
                );
              })}
               {mainContentSections.length === 0 && !summarySection && cvText && parsedSections.length === 0 && (
                  <div className="whitespace-pre-wrap text-sm_ text-gray-700">{renderFormattedText(cvText)}</div>
              )}
          </main>
        </div>
        <style>{`
          .print-container { /* Ensure Tailwind's screen prefixes don't interfere with print */ }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Georgia', serif; }
            .print-container { background-image: none !important; box-shadow: none !important; border: none !important; margin: 0 !important; max-width: 100% !important; padding: 0 !important; }
            .print-container aside { background-color: #f8fafc !important; /* Tailwind slate-50 */ }
            .md\\:grid-cols-cvLayout { grid-template-columns: 1fr 2.5fr !important; }
            .font-\\[\\'Roboto\\',_sans-serif\\] { font-family: 'Roboto', sans-serif !important; }
            .font-\\[\\'Georgia\\',_serif\\] { font-family: 'Georgia', serif !important; }
            a { color: #2563eb !important; text-decoration: none !important; }
            .print\\:hidden { display: none !important; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CVRenderer;