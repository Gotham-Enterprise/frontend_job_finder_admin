import React, { useState, useRef, useEffect } from 'react';
import Label from '@/components/form/Label';
import RichTextEditor from '@/components/form/input/RichTextEditor';
import { ChevronDownIcon } from '@/icons';
import { jobsAdminApi, AITonesProps, AI_TONES, AIJobDescriptionPayload, JobCreationPayload } from '@/services/api/jobsAdmin';

interface JobDescriptionStepProps {
  description: string;
  onUpdateDescription: (value: string) => void;
  jobTitle?: string;
  occupationId?: number;
  specialtyId?: number;
  workType?: string;
  workSetting?: string;
  locationCountry?: string;
  locationState?: string;
  locationCity?: string;
  locationZipCode?: string;
  locationAddress?: string;
  workFacility?: string;
  salaryCurrency?: string;
  salaryRangeStart?: number;
  salaryRangeEnd?: number;
  salaryType?: string;
  shiftType?: string;
  languages?: string[];
  companySize?: string;
}

const JobDescriptionStep: React.FC<JobDescriptionStepProps> = ({
  description,
  onUpdateDescription,
  jobTitle = '',
  occupationId,
  specialtyId,
  workType,
  workSetting,
  locationCountry,
  locationState = '',
  locationCity,
  locationZipCode = '',
  locationAddress,
  workFacility,
  salaryCurrency,
  salaryRangeStart,
  salaryRangeEnd,
  salaryType,
  shiftType,
  languages,
  companySize
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [selectedTone, setSelectedTone] = useState<AITonesProps>('formal');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [replaceContent, setReplaceContent] = useState(true); 
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutSide = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowToneDropdown(false);
      }
    };

    document.addEventListener('mousedown', clickOutSide);
    return () => {
      document.removeEventListener('mousedown', clickOutSide);
    };
  }, []);

 
  const generateAIDescription = async (tone: AITonesProps = selectedTone) => {
   
    const hasJobTitle = jobTitle && jobTitle.trim() !== '';
    const hasOccupationId = occupationId && occupationId > 0;
    const hasSpecialtyId = !specialtyId || specialtyId === 0 ? true : specialtyId > 0;
    const hasLocationState = locationState && locationState.trim() !== '';
    const hasLocationZipCode = locationZipCode && locationZipCode.trim() !== '';
    const hasLocationCountry = locationCountry && locationCountry.trim() !== '';
    
    if (!hasJobTitle || !hasOccupationId || !hasLocationState || !hasLocationZipCode || !hasLocationCountry) {
      const missingFieldsList = [];
      if (!hasJobTitle) missingFieldsList.push('Job Title');
      if (!hasOccupationId) missingFieldsList.push('Occupation');
      if (!hasLocationState) missingFieldsList.push('Location State');
      if (!hasLocationZipCode) missingFieldsList.push('Location Zip Code');
      if (!hasLocationCountry) missingFieldsList.push('Location Country');
      
      setMissingFields(missingFieldsList);
      setShowValidationModal(true);
      return;
    }

    setIsGenerating(true);
    setShowToneDropdown(false);    try {
      const payload: AIJobDescriptionPayload = {
        tone,
        jobTitle: jobTitle.trim(),
        occupationId: occupationId || 0,
        specialtyId: specialtyId || 0,
        workType,
        workSetting,
        locationCountry,
        locationState: locationState.trim(),
        locationCity,
        locationZipCode: locationZipCode.trim(),
        locationAddress,
        workFacility,
        salaryCurrency,
        salaryRangeStart,
        salaryRangeEnd,
        salaryType,
        shiftType,
        languages: languages?.map(lang => {
          const id = typeof lang === 'string' ? parseInt(lang) : lang;
          return isNaN(id) ? 0 : id;
        }).filter(id => id > 0),
        companySize      };      
        
        const response = await jobsAdminApi.generateAIJobDescription(payload);
      
      const formatJobDescription = (data: {
        overview: string;
        responsibilities: string[];
        requirements: string[];
        benefits: string[];
      }) => {
        let formattedDescription = '';
        
       
        const cleanText = (text: string) => {
          if (!text) return '';
          return text.replace(/\[object Object\]/g, '[field data]');
        };
        
 
        if (data.overview) {
          formattedDescription += `<h3 style="color: #374151; font-weight: 600; margin-bottom: 8px;">Job Overview</h3>\n<p style="margin-bottom: 16px; line-height: 1.6;">${cleanText(data.overview)}</p>\n\n`;
        }
        
      
        if (data.responsibilities && data.responsibilities.length > 0) {
          formattedDescription += `<h3 style="color: #374151; font-weight: 600; margin-bottom: 8px;">Key Responsibilities</h3>\n<ul style="margin-bottom: 16px; padding-left: 20px;">\n`;
          data.responsibilities.forEach(responsibility => {
            formattedDescription += `<li style="margin-bottom: 4px; line-height: 1.5;">${cleanText(responsibility)}</li>\n`;
          });
          formattedDescription += `</ul>\n\n`;
        }
        
       
        if (data.requirements && data.requirements.length > 0) {
          formattedDescription += `<h3 style="color: #374151; font-weight: 600; margin-bottom: 8px;">Requirements</h3>\n<ul style="margin-bottom: 16px; padding-left: 20px;">\n`;
          data.requirements.forEach(requirement => {
            formattedDescription += `<li style="margin-bottom: 4px; line-height: 1.5;">${cleanText(requirement)}</li>\n`;
          });
          formattedDescription += `</ul>\n\n`;
        }
        
  
        if (data.benefits && data.benefits.length > 0) {
          formattedDescription += `<h3 style="color: #374151; font-weight: 600; margin-bottom: 8px;">Benefits</h3>\n<ul style="margin-bottom: 16px; padding-left: 20px;">\n`;
          data.benefits.forEach(benefit => {
            formattedDescription += `<li style="margin-bottom: 4px; line-height: 1.5;">${cleanText(benefit)}</li>\n`;
          });
          formattedDescription += `</ul>\n`;
        }
        
        return formattedDescription;      };
  
      const formattedContent = formatJobDescription(response.data);
      const newDescription = replaceContent ? formattedContent : (description ? `${description}\n\n${formattedContent}` : formattedContent);
      
      onUpdateDescription(newDescription);
    } catch (error) {
      
    } finally {
      setIsGenerating(false);
    }
  };


  const aiGenerate = () => {
    generateAIDescription(); 
  };

  const toneSelect = (tone: AITonesProps) => {
    setSelectedTone(tone);
    generateAIDescription(tone);
  };


  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Job Description       
           </h2>
          <div className="flex items-center gap-2">
      
          <button
            onClick={aiGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
           <svg stroke="currentColor" fill="#fff" strokeWidth="0" viewBox="0 0 256 256" className="text-primary text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M246,152a6,6,0,0,1-6,6H222v18a6,6,0,0,1-12,0V158H192a6,6,0,0,1,0-12h18V128a6,6,0,0,1,12,0v18h18A6,6,0,0,1,246,152ZM56,70H74V88a6,6,0,0,0,12,0V70h18a6,6,0,0,0,0-12H86V40a6,6,0,0,0-12,0V58H56a6,6,0,0,0,0,12ZM184,194H174V184a6,6,0,0,0-12,0v10H152a6,6,0,0,0,0,12h10v10a6,6,0,0,0,12,0V206h10a6,6,0,0,0,0-12ZM217.9,78.59,78.58,217.9a14,14,0,0,1-19.8,0L38.09,197.21a14,14,0,0,1,0-19.8L177.41,38.1a14,14,0,0,1,19.8,0L217.9,58.79A14,14,0,0,1,217.9,78.59ZM167.51,112,144,88.49,46.58,185.9a2,2,0,0,0,0,2.83l20.69,20.68a2,2,0,0,0,2.82,0h0Zm41.9-44.73L188.73,46.59a2,2,0,0,0-2.83,0L152.48,80,176,103.52,209.41,70.1A2,2,0,0,0,209.41,67.27Z"></path></svg>
            {isGenerating ? 'Generating...' : 'AI Generate'}
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowToneDropdown(!showToneDropdown)}
              disabled={isGenerating}
              className="inline-flex items-center justify-center px-2 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              title={`Current tone: ${selectedTone}`}
            >
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            
            {showToneDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Choose Tone
                  </div>
                  {AI_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => toneSelect(tone.id)}
                      disabled={isGenerating}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedTone === tone.id 
                          ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>        
      <div className="space-y-4">
        <Label>Describe the position, requirements, and benefits</Label>
        <RichTextEditor
          content={description}
          onChange={onUpdateDescription}
          placeholder="Write a compelling job description that attracts the right candidates..."
          hideImageButton={true}
        />
      </div>

      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Missing Required Fields
              </h3>
              <button
                onClick={() => setShowValidationModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Please fill in the following fields before generating AI description:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {missingFields.map((field) => (
                  <li key={field} className="text-sm text-red-600 dark:text-red-400">
                    {field}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>  );
};

export const buildJobCreationPayload = (
  formData: {
    jobTitle: string;
    occupationId?: number;
    specialtyId?: number;
    workType?: string;
    workSetting?: string;
    locationCountry?: string;
    locationState: string;
    locationCity?: string;
    locationZipCode: string;
    locationAddress?: string;
    workFacility?: string;
    salaryCurrency?: string;
    salaryRangeStart?: number;
    salaryRangeEnd?: number;
    salaryType?: string;
    shiftType?: string;
    languages?: string[];
    companySize?: string;
  },
  jobDescription: string,
  companyId: string,
  additionalData?: {
    autoRenew?: boolean;
    postingDate?: string;
    status?: string;
    questions?: any[];
    documents?: any[];
  }
): JobCreationPayload => {
  return {
    companyId,
    jobTitle: formData.jobTitle,
    occupationId: formData.occupationId || 0,
    specialtyId: formData.specialtyId || 0,
    locationCountry: formData.locationCountry || '',
    locationState: formData.locationState,
    locationCity: formData.locationCity || '',
    locationZipCode: formData.locationZipCode,
    locationAddress: formData.locationAddress || '',
    workType: formData.workType || '',
    workSetting: formData.workSetting || '',
    workFacility: formData.workFacility || '',
    salaryCurrency: formData.salaryCurrency || 'USD',
    salaryRangeStart: formData.salaryRangeStart || 0,
    salaryRangeEnd: formData.salaryRangeEnd || 0,
    salaryType: formData.salaryType || '',
    autoRenew: additionalData?.autoRenew || false,
    shiftType: formData.shiftType || '',
    languages: formData.languages?.map(lang => {
      const id = typeof lang === 'string' ? parseInt(lang) : lang;
      return isNaN(id) ? 0 : id;
    }).filter(id => id > 0) || [],
    companySize: formData.companySize || '',
    postingDate: additionalData?.postingDate || 'today',
    status: additionalData?.status || 'Skip & Publish',
    jobDescription,
    questions: additionalData?.questions || [],
    documents: additionalData?.documents || []
  };
};

export default JobDescriptionStep;
