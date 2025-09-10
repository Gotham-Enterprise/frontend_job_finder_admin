"use client";
import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/ui/input/Input';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import RichTextEditor from '@/components/form/input/RichTextEditor';
import { useCreateCareer } from '@/services/hooks/useCareers';
import { useStates } from '@/services/hooks/useStates';
import type { CreateCareerPayload } from '@/services/api/careers';

// Countries list
const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Sweden',
  'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium', 'Ireland', 'New Zealand', 'Japan', 'South Korea',
  'Singapore', 'Hong Kong', 'United Arab Emirates', 'Saudi Arabia', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia',
  'India', 'China', 'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam', 'South Africa', 'Egypt', 'Nigeria',
  'Kenya', 'Morocco', 'Israel', 'Turkey', 'Russia', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria',
  'Croatia', 'Slovenia', 'Portugal', 'Greece', 'Cyprus', 'Malta', 'Luxembourg', 'Iceland', 'Estonia', 'Latvia',
  'Lithuania', 'Slovakia', 'Serbia', 'Bosnia and Herzegovina', 'Montenegro', 'North Macedonia', 'Albania', 'Ukraine',
  'Belarus', 'Moldova', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan', 'Uzbekistan', 'Kyrgyzstan', 'Tajikistan',
  'Afghanistan', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives', 'Myanmar', 'Cambodia', 'Laos',
  'Mongolia', 'Taiwan', 'Brunei', 'East Timor', 'Papua New Guinea', 'Fiji', 'Solomon Islands', 'Vanuatu', 'Samoa',
  'Tonga', 'Kiribati', 'Tuvalu', 'Nauru', 'Palau', 'Marshall Islands', 'Micronesia'
];

// Workplace type options
const WORKPLACE_TYPES = [
  { value: 'onsite', label: 'On-site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' }
];

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createCareerMutation = useCreateCareer();
  const { data: statesData, isLoading: statesLoading } = useStates();
  
  const [formData, setFormData] = useState<CreateCareerPayload>({
    jobTitle: '',
    jobType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  // departmentId & unitId removed
    timezone: '',
    salaryRangeStart: undefined,
    salaryRangeEnd: 0,
    jobDescription: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Department & unit selection removed

  // Prepare country options
  const countryOptions = useMemo(() => {
    return COUNTRIES.map(country => ({
      value: country,
      label: country
    }));
  }, []);

  const TIMEZONE_OPTIONS = useMemo(() => [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' }
  ], []);

  const handleInputChange = (field: keyof CreateCareerPayload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectChange = (field: keyof CreateCareerPayload) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user makes a selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
  // department/unit reset removed
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
  const ADDRESS_REGEX = /^[a-zA-Z0-9 .,#\-'/]+$/; // mirror backend

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state?.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.jobType.trim()) {
      newErrors.jobType = 'Job type is required';
    }
    if (!formData.timezone.trim()) {
      newErrors.timezone = 'Timezone is required';
    }
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    }
    if (!formData.country?.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    } else if (!ADDRESS_REGEX.test(formData.address.trim())) {
      newErrors.address = 'Address contains invalid characters';
    }
    if (!formData.zipCode?.trim()) {
      newErrors.zipCode = 'Zip code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const payload: CreateCareerPayload = {
        ...formData,
      };

      await createCareerMutation.mutateAsync(payload);
      onClose();
      // Reset form
      setFormData({
        jobTitle: '',
        jobType: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
  // departmentId & unitId removed
        timezone: '',
        salaryRangeStart: undefined,
        salaryRangeEnd: 0,
        jobDescription: '',
      });
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleCancel = () => {
    onClose();
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-6xl mx-4 my-8 rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
    >
      <div className="flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Job Post
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-8 h-full">
              {/* Left Column - Form Fields */}
              <div className="space-y-4 overflow-y-auto pr-4">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <Input
                    type="text"
                    placeholder="Job Title name"
                    value={formData.jobTitle}
                    onChange={handleInputChange('jobTitle')}
                    error={!!errors.jobTitle}
                    hint={errors.jobTitle}
                  />
                </div>

                {/* Job Type and Country Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Type *
                    </label>
                    <select
                      value={formData.jobType}
                      onChange={handleInputChange('jobType')}
                      className="h-11 w-full rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden appearance-none"
                    >
                      <option value="">Job Type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Internship">Internship</option>
                    </select>
                    {errors.jobType && (
                      <p className="mt-1.5 text-xs text-error-500">{errors.jobType}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country *
                    </label>
                    <Select
                      options={countryOptions}
                      value={formData.country}
                      onChange={handleSelectChange('country')}
                      placeholder="Select Country"
                    />
                    {errors.country && (
                      <p className="mt-1.5 text-xs text-error-500">{errors.country}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <Input
                    type="text"
                    placeholder="Street address"
                    value={formData.address || ''}
                    onChange={handleInputChange('address')}
                    error={!!errors.address}
                    hint={errors.address}
                  />
                </div>

                {/* City, State, Zip Code Row (State now a dropdown) */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <Input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange('city')}
                      error={!!errors.city}
                      hint={errors.city}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State *
                    </label>
                    <Select
                      options={(statesData?.data?.states || []).map((s: any) => ({ value: s.abbreviation, label: s.name }))}
                      value={formData.state}
                      onChange={handleSelectChange('state')}
                      placeholder={statesLoading ? 'Loading states...' : 'Select State'}
                      disabled={statesLoading}
                    />
                    {errors.state && (
                      <p className="mt-1.5 text-xs text-error-500">{errors.state}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Zip Code *
                    </label>
                    <Input
                      type="text"
                      placeholder="Zip Code"
                      value={formData.zipCode || ''}
                      onChange={handleInputChange('zipCode')}
                      error={!!errors.zipCode}
                      hint={errors.zipCode}
                    />
                  </div>
                </div>

                {/* Department & Unit inputs removed */}

                {/* Timezone and Salary Range Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone *
                    </label>
                    <Select
                      options={TIMEZONE_OPTIONS}
                      value={formData.timezone}
                      onChange={handleSelectChange('timezone')}
                      placeholder="Select timezone"
                    />
                    {errors.timezone && (
                      <p className="mt-1.5 text-xs text-error-500">{errors.timezone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salary Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min Salary"
                        value={formData.salaryRangeStart || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined;
                          setFormData(prev => ({ ...prev, salaryRangeStart: value }));
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Max Salary"
                        value={formData.salaryRangeEnd || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setFormData(prev => ({ ...prev, salaryRangeEnd: value }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Job Description Editor */}
              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Description *
                </label>
                <div className="flex-1 min-h-0">
                  <RichTextEditor
                    content={formData.jobDescription}
                    onChange={(value: string) => {
                      setFormData(prev => ({ ...prev, jobDescription: value }));
                      if (errors.jobDescription) {
                        setErrors(prev => ({ ...prev, jobDescription: '' }));
                      }
                    }}
                    placeholder="Enter job description"
                    minHeight={400}
                    hideImageButton={true}
                  />
                  {errors.jobDescription && (
                    <p className="mt-1.5 text-xs text-error-500">{errors.jobDescription}</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={createCareerMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={() => {
              const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
              handleSubmit(fakeEvent);
            }}
            disabled={createCareerMutation.isPending}
          >
            {createCareerMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
