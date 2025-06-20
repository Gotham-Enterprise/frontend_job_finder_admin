"use client";
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { jobCreationApi } from '@/services/api/jobCreation';
import { jobsAdminApi, JobCreationPayload } from '@/services/api/jobsAdmin';
import { employerApi } from '@/services/api/employer';
import { useEmployerDetails } from '@/services/hooks/useEmployers';
import { QUESTION_TYPES, QUESTION_SUBTYPES, QUESTION_SUBTYPE_VALUES } from '@/services/types/jobQuestions';
import { showToast } from '@/services/utils/toast';
import { useWorkTypes } from '@/services/hooks/useWorkTypes';
import { useWorkSettings } from '@/services/hooks/useWorkSettings';
import { useWorkFacilities } from '@/services/hooks/useWorkFacilities';
import { useShiftTypes } from '@/services/hooks/useShiftTypes';
import { useClinicSizes } from '@/services/hooks/useClinicSizes';
import Button from '@/components/ui/button/Button';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import CompanySearch from './CompanySearch';
import StepProgress from './StepProgress';
import StepForm from './StepForm';
import JobPostingTips from './JobPostingTips';
import { FormData } from '@/services/types/stepForm';

interface Company {
  id: string;
  companyName: string;
  state: string;
  sizeOfCompany: number;
}

const JobCreationDashboard: React.FC = () => {
  const searchParams = useSearchParams();
  const employerId = searchParams.get('id');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedOccupation, setSelectedOccupation] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const { 
    data: employerDetailsResponse, 
    isLoading: isLoadingEmployer, 
    error: employerError 
  } = useEmployerDetails(employerId || '');const [formData, setFormData] = useState<FormData>({
    title: '',
    occupationId: '',
    specialtyId: '',
    country: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    workType: 'full-time',
    workSetting: 'onsite',
    shiftType: '',
    timezone: '',
    language: [],
    clinicSize: '',
    workFacility: '',
    currency: 'USD',
    salaryFrom: 0,
    salaryTo: 0,
    salaryType: 'yearly',
    postingDate: 'today',
    autoRenew: false,
    questions: [],
    documents: []
  });

  const { data: occupationsData, isLoading: isLoadingOccupations } = useQuery({
    queryKey: ['occupations-with-specialties'],
    queryFn: () => jobCreationApi.getOccupationsWithSpecialties(),
    staleTime: 1000 * 60 * 10,
  });

  const { data: workTypesData } = useWorkTypes();
  const { data: workSettingsData } = useWorkSettings();
  const { data: workFacilitiesData } = useWorkFacilities();
  const { data: shiftTypesData } = useShiftTypes();
  const { data: clinicSizesData } = useClinicSizes();const createJobMutation = useMutation({
    mutationFn: ({ companyId, payload }: { companyId: string; payload: JobCreationPayload }) => 
      jobsAdminApi.createJob(companyId, payload),
    onMutate: () => {
      setIsPublishing(true);
    },
    onSuccess: (response) => {
      setIsPublishing(false);
      if (response.success) {
        showToast.success('Job Created', `Job published successfully!`);
        resetForm();
      } else {
        showToast.error('Job Creation Failed', response.message || 'Failed to create job');
      }
    },
    onError: (error: Error) => {
      setIsPublishing(false);
      showToast.error('Job Creation Failed', `Failed to create job: ${error.message}`);
    },
  });
  useEffect(() => {
    if (formData.occupationId) {
      setSelectedOccupation(Number(formData.occupationId));
      setFormData(prev => ({ ...prev, specialtyId: '' }));
    }
  }, [formData.occupationId]);  
  useEffect(() => {
    if (employerDetailsResponse?.success && employerDetailsResponse.data && employerId && !selectedCompany) {
      const employer = employerDetailsResponse.data;
      const company: Company = {
        id: employer.id,
        companyName: employer.companyName,
        state: employer.state,
        sizeOfCompany: employer.employeeCount
      };
      
      setSelectedCompany(company);
      setCurrentStep(1); 
      showToast.success('Company Selected', `Pre-selected ${employer.companyName} for job creation`);
    } else if (employerError && employerId) {
      console.error('Error fetching employer:', employerError);
      showToast.error('Error', 'Failed to load employer details. Please search manually.');
      setCurrentStep(0);
    }
  }, [employerDetailsResponse, employerError, employerId, selectedCompany]);

  useEffect(() => {
    if (employerId && isLoadingEmployer) {
      const timeoutId = setTimeout(() => {
        if (isLoadingEmployer && !selectedCompany) {
          showToast.error('Timeout', 'Loading took too long. Please search manually.');
          setCurrentStep(0); 
        }
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [employerId, isLoadingEmployer, selectedCompany]);

  const selectedOccupationData = occupationsData?.data?.find(
    occ => occ.id === selectedOccupation
  );
  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const getWorkTypeName = (id: string): string => {
    if (!workTypesData?.success || !id) return '';
    const workType = workTypesData.data.find(wt => wt.id.toString() === id);
    return workType?.name || '';
  };

  const getWorkSettingName = (id: string): string => {
    if (!workSettingsData?.success || !id) return '';
    const workSetting = workSettingsData.data.find(ws => ws.id.toString() === id);
    return workSetting?.name || '';
  };

  const getWorkFacilityName = (id: string): string => {
    if (!workFacilitiesData?.success || !id) return '';
    const workFacility = workFacilitiesData.data.find(wf => wf.id.toString() === id);
    return workFacility?.name || '';
  };

  const getShiftTypeName = (id: string): string => {
    if (!shiftTypesData?.success || !id) return '';
    const shiftType = shiftTypesData.data.find(st => st.id.toString() === id);
    return shiftType?.name || '';
  };

  const getClinicSizeName = (id: string): string => {
    if (!clinicSizesData?.success || !id) return '';
    const clinicSize = clinicSizesData.data.find(cs => cs.id.toString() === id);
    return clinicSize?.name || '';
  };

  // Alternative mapping functions that use direct values as fallback
  const getWorkTypeNameSafe = (id: string): string => {
    const name = getWorkTypeName(id);
    if (name) return name;
    
    // Fallback to common work type mappings
    const fallbackMap: { [key: string]: string } = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'temporary': 'Temporary',
      'per-diem': 'Per Diem'
    };
    return fallbackMap[id.toLowerCase()] || id;
  };

  const getWorkSettingNameSafe = (id: string): string => {
    const name = getWorkSettingName(id);
    if (name) return name;
    
    // Fallback to common work setting mappings
    const fallbackMap: { [key: string]: string } = {
      'onsite': 'On-site',
      'remote': 'Remote',
      'hybrid': 'Hybrid'
    };
    return fallbackMap[id.toLowerCase()] || id;
  };

  const getWorkFacilityNameSafe = (id: string): string => {
    const name = getWorkFacilityName(id);
    if (name) return name;
    
    // Fallback to common facility mappings
    const fallbackMap: { [key: string]: string } = {
      'hospital': 'Hospital',
      'clinic': 'Clinic',
      'corporate': 'Corporate',
      'private-practice': 'Private Practice'
    };
    return fallbackMap[id.toLowerCase()] || id;
  };

  const getShiftTypeNameSafe = (id: string): string => {
    const name = getShiftTypeName(id);
    if (name) return name;
    
    // Fallback to common shift type mappings
    const fallbackMap: { [key: string]: string } = {
      'day': 'Day',
      'night': 'Night',
      'evening': 'Evening',
      'morning': 'Morning',
      'rotating': 'Rotating'
    };
    return fallbackMap[id.toLowerCase()] || id;
  };

  const getClinicSizeNameSafe = (id: string): string => {
    const name = getClinicSizeName(id);
    if (name) return name;
    
    // Fallback to common company size mappings
    const fallbackMap: { [key: string]: string } = {
      'solo-practice': 'Solo Practice',
      '2-10': '2-10',
      '11-50': '11-50',
      '51-100': '51-100',
      '101-500': '101-500',
      '500+': '500+'
    };
    return fallbackMap[id.toLowerCase()] || id;
  };
  
  const companySelect = (company: Company) => {
    setSelectedCompany(company);
    setCurrentStep(1); 
  };

  const initCancel = () => {
    setSelectedCompany(null);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        // Basic info validation
        if (!formData.title.trim()) {
          showToast.error('Validation Error', 'Job title is required');
          return false;
        }
        if (!formData.occupationId) {
          showToast.error('Validation Error', 'Occupation is required');
          return false;
        }
        
        // Location validation
        if (!formData.country) {
          showToast.error('Validation Error', 'Country is required');
          return false;
        }
        if (!formData.address.trim()) {
          showToast.error('Validation Error', 'Address is required');
          return false;
        }
        if (!formData.city.trim()) {
          showToast.error('Validation Error', 'City is required');
          return false;
        }
        if (!formData.state.trim()) {
          showToast.error('Validation Error', 'State is required');
          return false;
        }
        if (!formData.zipCode.trim()) {
          showToast.error('Validation Error', 'Zip code is required');
          return false;
        }

        // Work details validation
        if (!formData.workType) {
          showToast.error('Validation Error', 'Work type is required');
          return false;
        }
        if (!formData.workSetting) {
          showToast.error('Validation Error', 'Work setting is required');
          return false;
        }
        if (!formData.workFacility) {
          showToast.error('Validation Error', 'Work facility is required');
          return false;
        }
        if (!formData.shiftType.trim()) {
          showToast.error('Validation Error', 'Shift type is required');
          return false;
        }
        if (!formData.clinicSize.trim()) {
          showToast.error('Validation Error', 'Company size is required');
          return false;
        }

        // Salary validation
        if (formData.salaryFrom <= 0) {
          showToast.error('Validation Error', 'Minimum salary must be greater than 0');
          return false;
        }
        if (formData.salaryTo <= 0) {
          showToast.error('Validation Error', 'Maximum salary must be greater than 0');
          return false;
        }
        if (formData.salaryFrom >= formData.salaryTo) {
          showToast.error('Validation Error', 'Maximum salary must be greater than minimum salary');
          return false;
        }
        break;
      case 2:
        // Job description validation
        if (!description.trim()) {
          showToast.error('Validation Error', 'Job description is required');
          return false;
        }
        break;
      case 3:
        // Manage step validation
        if (!formData.postingDate) {
          showToast.error('Validation Error', 'Please select when to post this job');
          return false;
        }
        break;
    }
    return true;
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.title.trim() &&
          formData.occupationId &&
          formData.country &&
          formData.address.trim() &&
          formData.city.trim() &&
          formData.state.trim() &&
          formData.zipCode.trim() &&
          formData.workType &&
          formData.workSetting &&
          formData.workFacility &&
          formData.shiftType.trim() &&
          formData.clinicSize.trim() &&
          formData.salaryFrom > 0 &&
          formData.salaryTo > 0 &&
          formData.salaryFrom < formData.salaryTo
        );
      case 2:
        return !!description.trim();
      case 3:
        return !!formData.postingDate;
      default:
        return true;
    }
  };  const publishedJob = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (!selectedCompany?.id) {
      showToast.error('Error', 'No company selected');
      return;
    }

    // Validate that we have the necessary option data loaded for mapping
    if (!workTypesData?.success || !workSettingsData?.success || 
        !workFacilitiesData?.success || !shiftTypesData?.success || 
        !clinicSizesData?.success) {
      showToast.error('Error', 'Option data is still loading. Please wait a moment and try again.');
      return;
    }    // Validate that we can map all the selected values
    const workTypeName = getWorkTypeNameSafe(formData.workType);
    const workSettingName = getWorkSettingNameSafe(formData.workSetting);
    const workFacilityName = getWorkFacilityNameSafe(formData.workFacility);
    const shiftTypeName = getShiftTypeNameSafe(formData.shiftType);
    const companySize = getClinicSizeNameSafe(formData.clinicSize);

    // Debug logging to identify which fields are failing
    console.log('Form data validation debug:', {
      workType: formData.workType,
      workSetting: formData.workSetting,
      workFacility: formData.workFacility,
      shiftType: formData.shiftType,
      clinicSize: formData.clinicSize,
      workTypeName,
      workSettingName,
      workFacilityName,
      shiftTypeName,
      companySize
    });
    
    console.log('Available options debug:', {
      workTypes: workTypesData?.data?.map(wt => ({ id: wt.id, name: wt.name })),
      workSettings: workSettingsData?.data?.map(ws => ({ id: ws.id, name: ws.name })),
      workFacilities: workFacilitiesData?.data?.map(wf => ({ id: wf.id, name: wf.name })),
      shiftTypes: shiftTypesData?.data?.map(st => ({ id: st.id, name: st.name })),
      clinicSizes: clinicSizesData?.data?.map(cs => ({ id: cs.id, name: cs.name }))
    });    if (!workTypeName || !workSettingName || !workFacilityName || !shiftTypeName || !companySize) {
      const missingFields = [];
      if (!workTypeName) missingFields.push('Work Type');
      if (!workSettingName) missingFields.push('Work Setting');
      if (!workFacilityName) missingFields.push('Work Facility');
      if (!shiftTypeName) missingFields.push('Shift Type');
      if (!companySize) missingFields.push('Company Size');
      
      showToast.error('Error', `Invalid values for: ${missingFields.join(', ')}. Please review your selections.`);
      return;
    }const payload: JobCreationPayload = {
      companyId: selectedCompany.id,
      jobTitle: formData.title,
      occupationId: Number(formData.occupationId) || 0,
      specialtyId: Number(formData.specialtyId) || 0,
      locationCountry: formData.country || 'USA',
      locationState: formData.state,
      locationCity: formData.city,
      locationZipCode: formData.zipCode,
      locationAddress: formData.address,      workType: getWorkTypeNameSafe(formData.workType),
      workSetting: getWorkSettingNameSafe(formData.workSetting),
      workFacility: getWorkFacilityNameSafe(formData.workFacility),
      salaryCurrency: formData.currency,
      salaryRangeStart: formData.salaryFrom,
      salaryRangeEnd: formData.salaryTo,
      salaryType: formData.salaryType,
      autoRenew: formData.autoRenew,
      shiftType: getShiftTypeNameSafe(formData.shiftType),
   
      languages: Array.isArray(formData.language) 
        ? formData.language.map(lang => {
            const id = typeof lang === 'string' ? parseInt(lang) : lang;
            return isNaN(id) ? 0 : id;
          }).filter(id => id > 0)
        : [],
      companySize: getClinicSizeNameSafe(formData.clinicSize),
      postingDate: formData.postingDate,
      status: 'Skip & Publish',
      jobDescription: description,
      questions: formData.questions 
        ? formData.questions
            .filter(q => q.isActive)
            .map(question => {
            
              let questionTypeId: number;
              let questionSubTypeId: number;
              let questionSubTypeValueId: number | undefined;

              switch (question.type) {
                case 'choice':
                  questionTypeId = QUESTION_TYPES.CHOICE;
                  questionSubTypeId = question.allowMultiple 
                    ? QUESTION_SUBTYPES.MULTIPLE_ANSWER 
                    : QUESTION_SUBTYPES.SINGLE_ANSWER;
                  break;
                case 'text':
                  questionTypeId = QUESTION_TYPES.TEXT;
                  questionSubTypeId = question.allowMultiple 
                    ? QUESTION_SUBTYPES.LONG_ANSWER 
                    : QUESTION_SUBTYPES.SHORT_ANSWER;
                
                  questionSubTypeValueId = question.questionSubTypeValueId || QUESTION_SUBTYPE_VALUES.PLAIN_TEXT;
                  break;
                case 'date':
                  questionTypeId = QUESTION_TYPES.DATE;
                  questionSubTypeId = QUESTION_SUBTYPES.DATE_PICKER;
                  break;
                case 'file':
                  questionTypeId = QUESTION_TYPES.FILE;
                  questionSubTypeId = QUESTION_SUBTYPES.UPLOAD_FILE;
                  break;
                case 'rating':
                  questionTypeId = QUESTION_TYPES.RATING;
                  questionSubTypeId = QUESTION_SUBTYPES.RATING;
                  break;
                default:
                  questionTypeId = QUESTION_TYPES.TEXT;
                  questionSubTypeId = QUESTION_SUBTYPES.SHORT_ANSWER;
                  questionSubTypeValueId = QUESTION_SUBTYPE_VALUES.PLAIN_TEXT;
              }

              return {
                questionText: question.question,
                questionTypeId,
                questionSubTypeId,
                questionSubTypeValueId,
                required: question.required,
                isActive: question.isActive,
                isDefault: question.isDefault,
                options: question.type === 'choice' ? question.options?.filter(opt => opt.trim() !== '') : undefined
              };
            })
        : [],
  
      documents: formData.documents 
        ? formData.documents.map(doc => ({
            documentName: doc.documentName,
            documentType: doc.documentType,
            documentDescription: doc.documentDescription
          }))
        : []
    };

    createJobMutation.mutate({ 
      companyId: selectedCompany.id, 
      payload 
    });
  };
  const resetForm = () => {
    setFormData({
      title: '',
      occupationId: '',
      specialtyId: '',
      country: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      workType: 'full-time',
      workSetting: 'onsite',      
      shiftType: '',
      timezone: '',
      language: [],
      clinicSize: '',
      workFacility: '',
      currency: 'USD',
      salaryFrom: 0,
      salaryTo: 0,
      salaryType: 'yearly',
      postingDate: 'today',
      autoRenew: false,
      questions: [],
      documents: []
    });    
    
    setDescription('');
    setSelectedOccupation(null);
    setSelectedCompany(null);
    setCurrentStep(0);
  };const steps = [
    { id: 1, title: 'Job Details', description: 'Basic info, location, work details & compensation' },
    { id: 2, title: 'Description', description: 'Job description and requirements' },
    { id: 3, title: 'Manage', description: 'Posting schedule and auto-renewal settings' },
    { id: 4, title: 'Review', description: 'Final review and publish' },
  ];

  const occupationOptions = [
    { value: '', label: 'Select Occupation' },
    ...(occupationsData?.data?.map(occ => ({
      value: occ.id.toString(),
      label: occ.name
    })) || [])
  ];

  const specialtyOptions = [
    { value: '', label: 'Select Specialty' },
    ...(selectedOccupationData?.specialty?.map(spec => ({
      value: spec.id.toString(),
      label: spec.name
    })) || [])
  ];

  const postingDateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },  ];

  const jobDetailsFields = [
    { label: 'Job Title', value: formData.title },
    { 
      label: 'Occupation', 
      value: occupationOptions.find(opt => opt.value === formData.occupationId)?.label || formData.occupationId 
    },
    { 
      label: 'Specialty', 
      value: specialtyOptions.find(opt => opt.value === formData.specialtyId)?.label || formData.specialtyId || 'Not specified' 
    },
    { label: 'Country', value: formData.country },
    { label: 'Address', value: formData.address },
    { label: 'City', value: formData.city },
    { label: 'State', value: formData.state },
    { label: 'Zip Code', value: formData.zipCode },
    { label: 'Work Type', value: formData.workType },
    { label: 'Work Setting', value: formData.workSetting },
    { label: 'Work Facility', value: formData.workFacility },
    { label: 'Shift Type', value: formData.shiftType },
    { 
      label: 'Languages', 
      value: Array.isArray(formData.language) ? formData.language.join(', ') : formData.language || 'Not specified' 
    },
    { label: 'Company Size', value: formData.clinicSize },
    { 
      label: 'Salary', 
      value: `${formData.currency} ${formData.salaryFrom.toLocaleString()} - ${formData.salaryTo.toLocaleString()} (${formData.salaryType})`,
      fullWidth: true 
    }
  ];

  if (!selectedCompany && currentStep === 0 && !employerId && !isLoadingEmployer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Job Posting
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Let&apos;s start by finding your company to ensure accurate job posting details.
            </p>
          </div>
            <CompanySearch 
            onCompanySelect={companySelect}
          />
        </div>
      </div>
    );
  }    if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Final Review and Publish
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review all details from Step 1 to 3 before publishing your job posting.
            </p>
          </div>

          <StepProgress currentStep={currentStep} steps={steps} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
             
              {selectedCompany && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {selectedCompany.companyName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{selectedCompany.companyName}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedCompany.state} • Size: {selectedCompany.sizeOfCompany}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Job Details Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  Job Details
                </h3>                  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {jobDetailsFields.map((field, index) => (
                    <div key={index} className={field.fullWidth ? "md:col-span-2" : ""}>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{field.label}:</span>{" "}
                      <span className="text-gray-900 dark:text-white">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Job Description */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  Job Description
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {description ? (
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No job description provided</p>
                  )}
                </div>
              </div>

              {/* Step 3: Questions and Documents */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  Questions and Documents
                </h3>
                
                {/* Questions Section */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Application Questions ({formData.questions?.filter(q => q.isActive).length || 0})</h4>
                  {formData.questions && formData.questions.filter(q => q.isActive).length > 0 ? (
                    <div className="space-y-3">
                      {formData.questions.filter(q => q.isActive).map((question, index) => (
                        <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{question.question}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded">
                                  {question.type}
                                </span>
                                {question.required && (
                                  <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded">
                                    Required
                                  </span>
                                )}
                                {question.isDefault && (
                                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              {question.options && question.options.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Options:</p>
                                  <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside ml-2">
                                    {question.options.map((option, optIndex) => (
                                      <li key={optIndex}>{option}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No active questions added</p>
                  )}
                </div>

                {/* Documents Section */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Required Documents ({formData.documents?.length || 0})</h4>
                  {formData.documents && formData.documents.length > 0 ? (
                    <div className="space-y-3">
                      {formData.documents.map((document, index) => (
                        <div key={document.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{document.documentName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
                                  {document.documentType}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{document.documentDescription}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No documents added</p>
                  )}
                </div>
              </div>

              {/* Publishing Options */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Publishing Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium text-gray-700 dark:text-gray-300">Posting Date:</span> <span className="text-gray-900 dark:text-white">{formData.postingDate}</span></div>
                  <div><span className="font-medium text-gray-700 dark:text-gray-300">Auto Renew:</span> <span className="text-gray-900 dark:text-white">{formData.autoRenew ? 'Yes' : 'No'}</span></div>
                </div>
              </div>
              
              <div className="flex justify-between">
               <div className="flex gap-3">
               <Button variant="outline" onClick={initCancel}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
               </div>
                <div className="space-x-4">                
                    <Button variant="outline" onClick={() => showToast.success('Draft Saved', 'Job posting saved as draft')}>
                    Save Draft
                  </Button>                  
                  <Button 
                    onClick={publishedJob} 
                    disabled={createJobMutation.isPending}
                  >
                    {createJobMutation.isPending ? 'Publishing...' : 'Publish Job'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => showToast.success('Draft Saved', 'Job posting saved as draft')}
                    >
                      Save Draft
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={resetForm}
                    >
                      Reset Form
                    </Button>
                  </div>
                </div>

                <JobPostingTips />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Job Posting
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.description}
          </p>
        </div>

        <StepProgress currentStep={currentStep} steps={steps} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <StepForm
              step={currentStep}
              formData={formData}
              description={description}
              onUpdateField={updateFormField}
              onUpdateDescription={setDescription}
              occupationOptions={occupationOptions}
              specialtyOptions={specialtyOptions}
              isLoadingOccupations={isLoadingOccupations}
              selectedOccupation={selectedOccupation}
            />           
            <div className="flex justify-between mt-8">
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={initCancel}
                >
                  Cancel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep <= 1}
                >
                  Previous
                </Button>
              </div>
                <div className="space-x-4">
                {currentStep < 3 ? (
                  <Button 
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                  >
                    Review & Publish
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
            
              {selectedCompany && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selected Company</h3>                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                        {selectedCompany.companyName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{selectedCompany.companyName}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{selectedCompany.state}</p>
                    </div>
                  </div>
                </div>
              )}

           
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => showToast.success('Draft Saved', 'Job posting saved as draft')}
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={resetForm}
                  >
                    Reset Form
                  </Button>
                </div>
              </div>              
              <JobPostingTips />
            </div>
          </div>
        </div>      </div>
    
      {/* Custom loading overlay for employer loading with skip option */}
      {isLoadingEmployer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Loading Employer Details
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please wait while we load the selected employer information...
            </p>            
           
          </div>
        </div>
      )}
    
      <FullScreenSpinner 
        isVisible={isPublishing} 
        message="Publishing job posting..." 
      />
    </div>
  );
};

export default JobCreationDashboard;
