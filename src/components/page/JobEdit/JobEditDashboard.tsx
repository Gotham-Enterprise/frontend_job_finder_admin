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

  // Fetch job data for editing
  const { 
    data: jobResponse, 
    isLoading: isLoadingJob, 
    error: jobError 
  } = useQuery({
    queryKey: ['job-edit', jobId],
    queryFn: () => jobsAdminApi.getJobForEdit(jobId!),
    enabled: !!jobId,
  });

  // Fetch occupations data
  const { data: occupationsData, isLoading: isLoadingOccupations } = useQuery({
    queryKey: ['occupations-with-specialties'],
    queryFn: () => jobCreationApi.getOccupationsWithSpecialties(),
    staleTime: 1000 * 60 * 10,
  });

  // Update job mutation
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

  // Load job data when available
  useEffect(() => {
    if (jobResponse?.success && jobResponse.data) {
      const job = jobResponse.data;
      
      // Set company information
      setSelectedCompany({
        id: job.companyId,
        companyName: job.companyName,
        state: '', // Will be filled from location
        sizeOfCompany: 0,
      });

      // Parse location (assuming format: "City, State")
      const locationParts = job.location.split(', ');
      const city = locationParts[0] || '';
      const state = locationParts[1] || '';

      // Find occupation ID by name
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

      // Set form data based on the API response structure
      setFormData({
        title: job.title || '',
        occupationId: occupationId,
        specialtyId: '',
        country: 'US',
        address: '',
        city: city,
        state: state,
        zipCode: '',
        workType: job.workType || 'full-time',
        workSetting: job.workSetting || 'onsite',
        shiftType: '',
        timezone: '',
        language: [],
        clinicSize: '',
        workFacility: job.workFacility || '',
        currency: job.salaryCurrency || 'USD',
        salaryFrom: job.salaryRangeStart || 0,
        salaryTo: job.salaryRangeEnd || 0,
        salaryType: job.salaryType || 'yearly',
        postingDate: 'today',
        autoRenew: false,
        questions: [],
        documents: [],
      });

      // Set description from jobDescription (strip HTML if needed)
      const plainDescription = job.jobDescription?.replace(/<[^>]*>/g, '') || '';
      setDescription(plainDescription);
      setIsLoading(false);
    } else if (jobResponse && !jobResponse.success) {
      setIsLoading(false);
      showToast.error('Error', 'Failed to load job data');
    }
  }, [jobResponse, occupationsData]);

  const handleUpdateJob = async () => {
    if (!selectedCompany?.id) {
      showToast.error('Error', 'Company information is required');
      return;
    }

    // Create payload similar to job creation
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
      workType: formData.workType,
      workSetting: formData.workSetting,
      workFacility: formData.workFacility,
      salaryCurrency: formData.currency,
      salaryRangeStart: formData.salaryFrom,
      salaryRangeEnd: formData.salaryTo,
      salaryType: formData.salaryType,
      autoRenew: formData.autoRenew,
      shiftType: formData.shiftType,
      languages: [],
      companySize: formData.clinicSize,
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

  // Memoized options for dropdowns
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

  const handleFieldUpdate = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update selected occupation when occupationId changes
    if (field === 'occupationId' && value) {
      setSelectedOccupation(parseInt(value));
      // Reset specialty when occupation changes
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
                onUpdateField={handleFieldUpdate}
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
                      onClick={handleUpdateJob}
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
