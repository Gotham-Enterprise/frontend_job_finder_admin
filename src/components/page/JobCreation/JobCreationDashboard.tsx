"use client";
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { JobCreationForm, JobCreationRequest } from '@/services/types/jobCreation';
import { jobCreationApi } from '@/services/api/jobCreation';
import { showToast } from '@/services/utils/toast';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import RichTextEditor from '@/components/form/input/RichTextEditor';
import Radio from '@/components/form/input/Radio';
import Checkbox from '@/components/form/input/Checkbox';
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

const JobCreationDashboard: React.FC = () => {
  const [selectedOccupation, setSelectedOccupation] = useState<number | null>(null);
  const [description, setDescription] = useState('');  const [formData, setFormData] = useState<FormData>({
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

  // Fetch occupations with specialties
  const { data: occupationsData, isLoading: isLoadingOccupations } = useQuery({
    queryKey: ['occupations-with-specialties'],
    queryFn: () => jobCreationApi.getOccupationsWithSpecialties(),
    staleTime: 1000 * 60 * 10,
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: (jobData: JobCreationRequest) => jobCreationApi.createJob(jobData),
    onSuccess: (response) => {
      showToast.success('Job Created', `Job "${response.data.title}" created successfully!`);      // Reset form
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
      });
      setDescription('');
      setSelectedOccupation(null);
    },
    onError: (error: Error) => {
      showToast.error('Job Creation Failed', `Failed to create job: ${error.message}`);
    },
  });

  // Update selected occupation when occupation changes
  useEffect(() => {
    if (formData.occupationId) {
      setSelectedOccupation(Number(formData.occupationId));
      setFormData(prev => ({ ...prev, specialtyId: '' })); // Reset specialty when occupation changes
    }
  }, [formData.occupationId]);

  // Get specialties for selected occupation
  const selectedOccupationData = occupationsData?.data?.find(
    occ => occ.id === selectedOccupation
  );

  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleButtonClick = () => {
    const event = new Event('submit') as any;
    handleSubmit(event);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      showToast.error('Validation Error', 'Job title is required');
      return;
    }
    if (!formData.occupationId) {
      showToast.error('Validation Error', 'Occupation is required');
      return;
    }
    if (!formData.country) {
      showToast.error('Validation Error', 'Country is required');
      return;
    }
    if (!formData.address.trim()) {
      showToast.error('Validation Error', 'Address is required');
      return;
    }
    if (!formData.city.trim()) {
      showToast.error('Validation Error', 'City is required');
      return;
    }
    if (!formData.state.trim()) {
      showToast.error('Validation Error', 'State is required');
      return;
    }
    if (!formData.zipCode.trim()) {
      showToast.error('Validation Error', 'Zip code is required');
      return;
    }
    if (!description.trim()) {
      showToast.error('Validation Error', 'Job description is required');
      return;
    }
    if (formData.salaryFrom <= 0) {
      showToast.error('Validation Error', 'Minimum salary must be greater than 0');
      return;
    }
    if (formData.salaryTo <= 0) {
      showToast.error('Validation Error', 'Maximum salary must be greater than 0');
      return;
    }
    if (formData.salaryFrom >= formData.salaryTo) {
      showToast.error('Validation Error', 'Maximum salary must be greater than minimum salary');
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
    });
    setDescription('');
    setSelectedOccupation(null);
  };

  // Options for form selects
  const countryOptions = [
    { value: '', label: 'Select Country' },
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
  ];

  const workTypeOptions = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
  ];

  const workSettingOptions = [
    { value: 'onsite', label: 'Onsite' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const shiftTypeOptions = [
    { value: '', label: 'Select Shift Type' },
    { value: 'day', label: 'Day Shift' },
    { value: 'night', label: 'Night Shift' },
    { value: 'rotating', label: 'Rotating Shifts' },
    { value: 'flexible', label: 'Flexible Hours' },
  ];

  const languageOptions = [
    { value: '', label: 'Select Language' },
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'bilingual', label: 'Bilingual' },
  ];

  const clinicSizeOptions = [
    { value: '', label: 'Select Clinic Size' },
    { value: 'small', label: 'Small (1-50 employees)' },
    { value: 'medium', label: 'Medium (51-200 employees)' },
    { value: 'large', label: 'Large (201-1000 employees)' },
    { value: 'enterprise', label: 'Enterprise (1000+ employees)' },
  ];
  const workFacilityOptions = [
    // First column
    { value: 'hospital', label: 'Hospital' },
    { value: 'outpatient-office', label: 'Outpatient Office' },
    { value: 'community-health-clinic', label: 'Community Health Clinic' },
    { value: 'skilled-nursing-facility', label: 'Skilled Nursing Facility' },
    { value: 'surgical-center', label: 'Surgical Center' },
    { value: 'early-intervention-center', label: 'Early Intervention Center' },
    // Second column
    { value: 'home-care', label: 'Home Care' },
    { value: 'school', label: 'School' },
    { value: 'correctional-facility', label: 'Correctional Facility' },
    { value: 'assistive-living-facility', label: 'Assistive Living Facility' },
    { value: 'detox-center', label: 'Detox Center' },
    { value: 'corporate', label: 'Corporate' },
    // Third column
    { value: 'telehealth', label: 'Telehealth' },
    { value: 'hospice-center', label: 'Hospice Center' },
    { value: 'rehabilitation-center', label: 'Rehabilitation Center' },
    { value: 'diagnostic-imaging-center', label: 'Diagnostic Imaging Center' },
    { value: 'adult-day-care-center', label: 'Adult Day Care Center' },
    { value: 'concierge-medicine', label: 'Concierge Medicine/House Calls' },
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'CAD', label: 'CAD (C$)' },
    { value: 'EUR', label: 'EUR (€)' },
  ];

  const salaryTypeOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const postingDateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Job Posting
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Fill out the form below to create a comprehensive job posting for candidates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form - Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Basic Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <Label>Job Title *</Label>
                    <Input
                      placeholder="e.g. Senior Software Engineer"
                      defaultValue={formData.title}
                      onChange={(e) => updateFormField('title', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Occupation *</Label>
                      <Select
                        options={occupationOptions}
                        disabled={isLoadingOccupations}
                        onChange={(value: string) => updateFormField('occupationId', value)}
                        defaultValue={formData.occupationId}
                      />
                    </div>

                    <div>
                      <Label>Specialty</Label>
                      <Select
                        options={specialtyOptions}
                        disabled={!selectedOccupation}
                        onChange={(value: string) => updateFormField('specialtyId', value)}
                        defaultValue={formData.specialtyId}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Location Details
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <Label>Country *</Label>
                    <Select
                      options={countryOptions}
                      onChange={(value: string) => updateFormField('country', value)}
                      defaultValue={formData.country}
                    />
                  </div>

                  <div>
                    <Label>Address *</Label>
                    <Input
                      placeholder="Street address"
                      defaultValue={formData.address}
                      onChange={(e) => updateFormField('address', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>City *</Label>
                      <Input
                        placeholder="City"
                        defaultValue={formData.city}
                        onChange={(e) => updateFormField('city', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>State *</Label>
                      <Input
                        placeholder="State"
                        defaultValue={formData.state}
                        onChange={(e) => updateFormField('state', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Zip Code *</Label>
                      <Input
                        placeholder="12345"
                        defaultValue={formData.zipCode}
                        onChange={(e) => updateFormField('zipCode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Job Details
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Work Type *</Label>
                      <Select
                        options={workTypeOptions}
                        onChange={(value: string) => updateFormField('workType', value)}
                        defaultValue={formData.workType}
                      />
                    </div>

                    <div>
                      <Label>Work Setting *</Label>
                      <Select
                        options={workSettingOptions}
                        onChange={(value: string) => updateFormField('workSetting', value)}
                        defaultValue={formData.workSetting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Shift Type</Label>
                      <Select
                        options={shiftTypeOptions}
                        onChange={(value: string) => updateFormField('shiftType', value)}
                        defaultValue={formData.shiftType}
                      />
                    </div>

                    <div>
                      <Label>Timezone</Label>
                      <Input
                        type="text"
                        placeholder="e.g. EST, PST, UTC-5"
                        defaultValue={formData.timezone}
                        onChange={(e) => updateFormField('timezone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Language Requirements</Label>
                      <Select
                        options={languageOptions}
                        onChange={(value: string) => updateFormField('language', value)}
                        defaultValue={formData.language}
                      />
                    </div>

                    <div>
                      <Label>Clinic Size</Label>
                      <Select
                        options={clinicSizeOptions}
                        onChange={(value: string) => updateFormField('clinicSize', value)}
                        defaultValue={formData.clinicSize}
                      />
                    </div>
                  </div>                  <div>
                    <Label>Work Facility</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      {/* First Column */}
                      <div className="space-y-3">
                        {workFacilityOptions.slice(0, 6).map((option) => (
                          <Radio
                            key={option.value}
                            id={`facility-${option.value}`}
                            name="workFacility"
                            value={option.value}
                            checked={formData.workFacility === option.value}
                            onChange={(value) => updateFormField('workFacility', value)}
                            label={option.label}
                          />
                        ))}
                      </div>
                      
                      {/* Second Column */}
                      <div className="space-y-3">
                        {workFacilityOptions.slice(6, 12).map((option) => (
                          <Radio
                            key={option.value}
                            id={`facility-${option.value}`}
                            name="workFacility"
                            value={option.value}
                            checked={formData.workFacility === option.value}
                            onChange={(value) => updateFormField('workFacility', value)}
                            label={option.label}
                          />
                        ))}
                      </div>
                      
                      {/* Third Column */}
                      <div className="space-y-3">
                        {workFacilityOptions.slice(12, 18).map((option) => (
                          <Radio
                            key={option.value}
                            id={`facility-${option.value}`}
                            name="workFacility"
                            value={option.value}
                            checked={formData.workFacility === option.value}
                            onChange={(value) => updateFormField('workFacility', value)}
                            label={option.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Range Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Salary Range
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Provide a salary range for candidates. If the pay is a fixed amount, enter the same figure in both fields.
                </p>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Currency *</Label>
                      <Select
                        options={currencyOptions}
                        onChange={(value: string) => updateFormField('currency', value)}
                        defaultValue={formData.currency}
                      />
                    </div>

                    <div>
                      <Label>From *</Label>
                      <Input
                        type="number"
                        placeholder="50000"
                        min="0"
                        defaultValue={formData.salaryFrom.toString()}
                        onChange={(e) => updateFormField('salaryFrom', Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label>To *</Label>
                      <Input
                        type="number"
                        placeholder="80000"
                        min="0"
                        defaultValue={formData.salaryTo.toString()}
                        onChange={(e) => updateFormField('salaryTo', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Salary Type *</Label>
                    <Select
                      options={salaryTypeOptions}
                      onChange={(value: string) => updateFormField('salaryType', value)}
                      defaultValue={formData.salaryType}
                    />
                  </div>
                </div>
              </div>

              {/* Job Description Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Job Description
                </h2>
                
                <div>
                  <Label>Description *</Label>
                  <div className="mt-2">
                    <RichTextEditor
                      content={description}
                      onChange={setDescription}
                      placeholder="Describe the job role, responsibilities, requirements, and benefits..."
                      minHeight={400}
                    />
                  </div>
                  {!description && (
                    <p className="mt-1 text-sm text-red-600">Job description is required</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Right Column (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">                {/* Posting Options Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Posting Options
                  </h2>
                  
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
                </div>                {/* Actions Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Actions
                  </h2>
                  
                  <div className="space-y-4">
                    <Button
                      className="w-full"
                      disabled={createJobMutation.isPending}
                      onClick={handleButtonClick}
                    >
                      {createJobMutation.isPending ? 'Publishing...' : 'Publish'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={createJobMutation.isPending}
                      onClick={() => {
                        showToast.success('Draft Saved', 'Job posting saved as draft');
                      }}
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
        </form>
      </div>
    </div>
  );
};

export default JobCreationDashboard;
