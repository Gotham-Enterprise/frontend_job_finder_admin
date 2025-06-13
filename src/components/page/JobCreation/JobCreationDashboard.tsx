"use client";
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { JobCreationForm, JobCreationRequest } from '@/services/types/jobCreation';
import { jobCreationApi } from '@/services/api/jobCreation';
import { showToast } from '@/services/utils/toast';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Checkbox from '@/components/form/input/Checkbox';
import CompanySearch from './CompanySearch';
import StepProgress from './StepProgress';
import StepForm from './StepForm';
import JobPostingTips from './JobPostingTips';

interface FormData {
  title: string;
  occupationId: string;
  specialtyId: string;
  country: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  workType: string;
  workSetting: string;
  shiftType: string;
  timezone: string;
  language: string;
  clinicSize: string;
  workFacility: string;
  currency: string;
  salaryFrom: number;
  salaryTo: number;
  salaryType: string;
  postingDate: string;
  autoRenew: boolean;
}

interface Company {
  id: string;
  companyName: string;
  state: string;
  sizeOfCompany: number;
}

const JobCreationDashboard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedOccupation, setSelectedOccupation] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  const [formData, setFormData] = useState<FormData>({
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
    language: '',
    clinicSize: '',
    workFacility: '',
    currency: 'USD',
    salaryFrom: 0,
    salaryTo: 0,
    salaryType: 'yearly',
    postingDate: 'today',
    autoRenew: false,
  });


  const { data: occupationsData, isLoading: isLoadingOccupations } = useQuery({
    queryKey: ['occupations-with-specialties'],
    queryFn: () => jobCreationApi.getOccupationsWithSpecialties(),
    staleTime: 1000 * 60 * 10,
  });

  const createJobMutation = useMutation({
    mutationFn: (jobData: JobCreationRequest) => jobCreationApi.createJob(jobData),
    onSuccess: (response) => {
      showToast.success('Job Created', `Job "${response.data.title}" created successfully!`);
      resetForm();
    },
    onError: (error: Error) => {
      showToast.error('Job Creation Failed', `Failed to create job: ${error.message}`);
    },
  });

  useEffect(() => {
    if (formData.occupationId) {
      setSelectedOccupation(Number(formData.occupationId));
      setFormData(prev => ({ ...prev, specialtyId: '' }));
    }
  }, [formData.occupationId]);

  const selectedOccupationData = occupationsData?.data?.find(
    occ => occ.id === selectedOccupation
  );

  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCurrentStep(1); 
  };

  const handleSkipCompany = () => {
    setSelectedCompany(null);
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
       
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
        // Compensation validation
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
        // Description validation
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

  const publishedJob = () => {
    if (!validateCurrentStep()) {
      return;
    }

    const jobData: JobCreationRequest = {
      title: formData.title,
      occupationId: Number(formData.occupationId),
      specialtyId: formData.specialtyId ? Number(formData.specialtyId) : undefined,
      country: formData.country,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      workType: formData.workType as any,
      workSetting: formData.workSetting as any,
      shiftType: formData.shiftType,
      timezone: formData.timezone,
      language: formData.language,
      clinicSize: formData.clinicSize,
      workFacility: formData.workFacility,
      currency: formData.currency,
      salaryFrom: formData.salaryFrom,
      salaryTo: formData.salaryTo,
      salaryType: formData.salaryType as any,
      description: description,
      postingDate: formData.postingDate as any,
    };

    createJobMutation.mutate(jobData);
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
      language: '',
      clinicSize: '',
      workFacility: '',
      currency: 'USD',
      salaryFrom: 0,
      salaryTo: 0,
      salaryType: 'yearly',
      postingDate: 'today',
      autoRenew: false,
    });    setDescription('');
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
    { value: 'this-month', label: 'This Month' },
  ];  // Company Search Step (before stepper)
  if (!selectedCompany && currentStep === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Job Posting
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Let&apos;s start by finding your company to ensure accurate job posting details.
            </p>
          </div>
          
          <CompanySearch 
            onCompanySelect={handleCompanySelect}
            onSkip={handleSkipCompany}
          />
        </div>
      </div>
    );
  }  // Review Step
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Review Job Posting
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review all details before publishing your job posting.
            </p>
          </div>

          <StepProgress currentStep={currentStep} steps={steps} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Company Info */}
              {selectedCompany && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>                  <div className="flex items-center gap-3">
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

              {/* Job Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Summary</h3>
                <div className="space-y-3">
                  <div><span className="font-medium">Title:</span> {formData.title}</div>
                  <div><span className="font-medium">Location:</span> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}</div>
                  <div><span className="font-medium">Work Type:</span> {formData.workType}</div>
                  <div><span className="font-medium">Work Setting:</span> {formData.workSetting}</div>
                  <div><span className="font-medium">Salary:</span> {formData.currency} {formData.salaryFrom.toLocaleString()} - {formData.salaryTo.toLocaleString()} ({formData.salaryType})</div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  Previous
                </Button>
                <div className="space-x-4">
                  <Button variant="outline" onClick={() => showToast.success('Draft Saved', 'Job posting saved as draft')}>
                    Save Draft
                  </Button>
                  <Button onClick={publishedJob} disabled={createJobMutation.isPending}>
                    {createJobMutation.isPending ? 'Publishing...' : 'Publish Job'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Posting Options */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Publishing Options</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Posting Date</Label>
                      <Select
                        options={postingDateOptions}
                        onChange={(value: string) => updateFormField('postingDate', value)}
                        defaultValue={formData.postingDate}
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Checkbox
                        id="auto-renew"
                        checked={formData.autoRenew}
                        onChange={(checked) => updateFormField('autoRenew', checked)}
                        label="Auto renew job publishing on new subscription period"
                      />
                    </div>
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
  // Steps 2-6: Form Steps
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
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

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handlePrevStep}
                disabled={currentStep <= 1}
              >
                Previous
              </Button>
                <div className="space-x-4">
                {currentStep < 3 ? (
                  <Button onClick={handleNextStep}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleNextStep}>
                    Review & Publish
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Company Info */}
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

              {/* Quick Actions */}
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
};

export default JobCreationDashboard;
