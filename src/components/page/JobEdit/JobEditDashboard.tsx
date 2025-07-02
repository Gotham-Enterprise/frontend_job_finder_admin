"use client";
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { jobCreationApi } from '@/services/api/jobCreation';
import { jobsAdminApi } from '@/services/api/jobsAdmin';
import { showToast } from '@/services/utils/toast';
import { useWorkTypes } from '@/services/hooks/useWorkTypes';
import { useWorkSettings } from '@/services/hooks/useWorkSettings';
import { useWorkFacilities } from '@/services/hooks/useWorkFacilities';
import { useShiftTypes } from '@/services/hooks/useShiftTypes';
import { useClinicSizes } from '@/services/hooks/useClinicSizes';
import { useLanguages } from '@/services/hooks/useLanguages';
import Button from '@/components/ui/button/Button';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import StepProgress from '../JobCreation/StepProgress';
import StepForm from '../JobCreation/StepForm';
import JobPostingTips from '../JobCreation/JobPostingTips';
import { FormData } from '@/services/types/stepForm';

interface Company {
  id: string;
  companyName: string;
  state: string;
  sizeOfCompany: number;
}

interface Language {
  id: number;
  name: string;
}

interface Question {
  id: string;
  question: string;
}

interface JobEditData {
  success: boolean;
  data: {
    id: string;
    isApplied: boolean;
    isSaved: boolean;
    companyId: string;
    title: string;
    occupation: string;
    location: string;
    isSalaryVisible: boolean;
    salaryRangeStart: number;
    salaryRangeEnd: number;
    salaryType: string;
    salaryCurrency: string;
    workSetting: string;
    workType: string;
    datePosted: string;
    applicantCount: number;
    workFacility: string;
    jobDescription: string;
    applicationId: string;
    companyName: string;
    companyLogo: string;
    specialtyId?: number;
    specialty?: string;
    address?: string;
    locationCity?: string;
    locationState?: string;
    locationCountry?: string;
    locationZipCode?: string;
    languages?: Language[];
    shiftType?: string;
    companySize?: string;
    questions?: Question[];
    documents?: any[];
  };
}

const JobEditDashboard: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('id');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedOccupation, setSelectedOccupation] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    occupationId: '',
    specialtyId: '',
    country: 'US',
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

  const { 
    data: jobResponse, 
    isLoading: isLoadingJob, 
    error: jobError 
  } = useQuery({
    queryKey: ['job-edit', jobId],
    queryFn: () => jobsAdminApi.getJobForEdit(jobId!),
    enabled: !!jobId,
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
  const { data: clinicSizesData } = useClinicSizes();
  const { data: languagesData } = useLanguages();


  const updateJobMutation = useMutation({
    mutationFn: ({ companyId, payload }: { companyId: string; payload: any }) =>
      jobsAdminApi.updateJob(companyId, jobId!, payload),
    onMutate: () => {
      setIsUpdating(true);
    },
    onSuccess: (response) => {
      setIsUpdating(false);
      if (response.success) {
        showToast.success('Job Updated', 'Job updated successfully!');
        router.push('/admin/jobs');
      } else {
        showToast.error('Update Failed', response.message || 'Failed to update job');
      }
    },
    onError: (error: any) => {
      setIsUpdating(false);
      console.error('Update job error:', error);
      showToast.error('Update Failed', error.message || 'Failed to update job');
    },
  });


  useEffect(() => {
    if (jobResponse?.success && jobResponse.data) {
      const job = jobResponse.data;
      

      setSelectedCompany({
        id: job.companyId,
        companyName: job.companyName,
        state: job.locationState || '',
        sizeOfCompany: 0,
      });
      let occupationId = '';
      if (occupationsData?.success && occupationsData.data) {
        const foundOccupation = occupationsData.data.find(
          occ => occ.name.toLowerCase() === job.occupation.toLowerCase()
        );
        if (foundOccupation) {
          occupationId = foundOccupation.id.toString();
          setSelectedOccupation(foundOccupation.id);
        }
      }

     
      const mappedLanguages = job.languages?.map((lang: Language) => lang.id.toString()) || [];

      const findWorkTypeId = (workTypeName: string): string => {
        if (!workTypesData?.success || !workTypeName) return '';
        const workType = workTypesData.data.find(wt => 
          wt.name.toLowerCase() === workTypeName.toLowerCase() ||
          wt.name.toLowerCase().replace(/[-\s]/g, '') === workTypeName.toLowerCase().replace(/[-\s]/g, '')
        );
        return workType?.id.toString() || '';
      };

      const findWorkSettingId = (workSettingName: string): string => {
        if (!workSettingsData?.success || !workSettingName) return '';
        const workSetting = workSettingsData.data.find(ws => 
          ws.name.toLowerCase().replace(/[-\s]/g, '') === workSettingName.toLowerCase().replace(/[-\s]/g, '')
        );
        return workSetting?.id.toString() || '';
      };

      const findWorkFacilityId = (workFacilityName: string): string => {
        if (!workFacilitiesData?.success || !workFacilityName) return '';
        const workFacility = workFacilitiesData.data.find(wf => 
          wf.name.toLowerCase() === workFacilityName.toLowerCase()
        );
        return workFacility?.id.toString() || '';
      };

      const findShiftTypeId = (shiftTypeName: string): string => {
        if (!shiftTypesData?.success || !shiftTypeName) return '';
        const shiftType = shiftTypesData.data.find(st => 
          st.name.toLowerCase() === shiftTypeName.toLowerCase()
        );
        return shiftType?.id.toString() || '';
      };

      const findClinicSizeId = (clinicSizeName: string): string => {
        if (!clinicSizesData?.success || !clinicSizeName) return '';
        const clinicSize = clinicSizesData.data.find(cs => 
          cs.name.toLowerCase() === clinicSizeName.toLowerCase()
        );
        return clinicSize?.id.toString() || '';
      };

 
      const formDataToSet = {
        title: job.title || '',
        occupationId: occupationId,
        specialtyId: job.specialtyId?.toString() || '',
        country: job.locationCountry === 'USA' || job.locationCountry === 'United States' ? 'US' : job.locationCountry || 'US',
        address: job.address || '',
        city: job.locationCity || '',
        state: job.locationState || '',
        zipCode: job.locationZipCode || '',
        workType: findWorkTypeId(job.workType),
        workSetting: findWorkSettingId(job.workSetting),
        shiftType: findShiftTypeId(job.shiftType),
        timezone: '',
        language: mappedLanguages,
        clinicSize: findClinicSizeId(job.companySize),
        workFacility: findWorkFacilityId(job.workFacility),
        currency: job.salaryCurrency || 'USD',
        salaryFrom: job.salaryRangeStart || 0,
        salaryTo: job.salaryRangeEnd || 0,
        salaryType: job.salaryType || 'yearly',
        postingDate: 'today',
        autoRenew: false,
        questions: job.questions || [],
        documents: job.documents || [],
      };
      
      setFormData(formDataToSet);

      setDescription(job.jobDescription || '');
      setIsLoading(false);
    } else if (jobResponse && !jobResponse.success) {
      setIsLoading(false);
      showToast.error('Error', 'Failed to load job data');
    }
  }, [jobResponse, occupationsData, workTypesData, workSettingsData, workFacilitiesData, shiftTypesData, clinicSizesData]);

  const updateJob = async () => {
    if (!selectedCompany?.id) {
      showToast.error('Error', 'Company information is required');
      return;
    }

    const languageIds = formData.language.map(id => parseInt(id)) || [];

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

    const payload = {
      companyId: selectedCompany.id,
      jobTitle: formData.title,
      occupationId: parseInt(formData.occupationId) || 1,
      specialtyId: formData.specialtyId ? parseInt(formData.specialtyId) : undefined,
      locationCountry: formData.country,
      locationState: formData.state,
      locationCity: formData.city,
      locationZipCode: formData.zipCode,
      locationAddress: formData.address,
      workType: getWorkTypeName(formData.workType),
      workSetting: getWorkSettingName(formData.workSetting),
      workFacility: getWorkFacilityName(formData.workFacility),
      salaryCurrency: formData.currency,
      salaryRangeStart: formData.salaryFrom,
      salaryRangeEnd: formData.salaryTo,
      salaryType: formData.salaryType,
      autoRenew: formData.autoRenew,
      shiftType: getShiftTypeName(formData.shiftType),
      languages: languageIds,
      companySize: getClinicSizeName(formData.clinicSize),
      postingDate: formData.postingDate,
      status: 'active',
      jobDescription: description,
      questions: formData.questions || [],
      documents: formData.documents || [],
    };

    updateJobMutation.mutate({ 
      companyId: selectedCompany.id, 
      payload 
    });
  };

  const occupationOptions = React.useMemo(() => {
    if (!occupationsData?.success || !occupationsData.data) return [];
    return occupationsData.data.map(occupation => ({
      value: occupation.id.toString(),
      label: occupation.name
    }));
  }, [occupationsData]);

  const specialtyOptions = React.useMemo(() => {
    if (!selectedOccupation || !occupationsData?.success || !occupationsData.data) return [];
    const selectedOcc = occupationsData.data.find(occ => occ.id === selectedOccupation);
    return selectedOcc?.specialty?.map(spec => ({
      value: spec.id.toString(),
      label: spec.name
    })) || [];
  }, [selectedOccupation, occupationsData]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'occupationId' && value) {
      setSelectedOccupation(parseInt(value));
      setFormData(prev => ({ ...prev, specialtyId: '' }));
    }
  };

  if (!jobId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Job ID Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please provide a valid job ID to edit.
          </p>
          <Button onClick={() => router.push('/admin/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingJob || isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading job data..." />;
  }

  if (jobError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Job</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {jobError.message || 'Failed to load job data'}
          </p>
          <Button onClick={() => router.push('/admin/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Edit Job Post
              </h1>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin/jobs')}
              >
                Back to Jobs
              </Button>
            </div>
            {selectedCompany && (
              <p className="text-gray-600 dark:text-gray-400">
                Editing job for: <span className="font-medium">{selectedCompany.companyName}</span>
              </p>
            )}
          </div>

          {/* Step Progress */}
          <div className="mb-8">
            <StepProgress 
              currentStep={currentStep} 
              steps={[
                { id: 1, title: 'Basic Info', description: 'Job title and location' },
                { id: 2, title: 'Description', description: 'Job description' },
                { id: 3, title: 'Review', description: 'Review and update' }
              ]}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Step Form */}
            <div className="lg:col-span-3">
              <StepForm
                step={currentStep}
                formData={formData}
                description={description}
                onUpdateField={updateField}
                onUpdateDescription={setDescription}
                occupationOptions={occupationOptions}
                specialtyOptions={specialtyOptions}
                isLoadingOccupations={isLoadingOccupations}
                selectedOccupation={selectedOccupation}
              />
              
              {/* Navigation & Action Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {currentStep > 1 && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setCurrentStep(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {currentStep < 3 ? (
                    <Button 
                      variant="default"
                      onClick={() => setCurrentStep(prev => prev + 1)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button 
                      variant="default"
                      onClick={updateJob}
                      disabled={isUpdating || !formData.title}
                    >
                      {isUpdating ? 'Updating...' : 'Update Job Post'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tips Sidebar */}
            <div className="lg:col-span-1">
              <JobPostingTips />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      <FullScreenSpinner 
        isVisible={isUpdating} 
        message="Updating job posting..." 
      />
    </div>
  );
};

export default JobEditDashboard;
