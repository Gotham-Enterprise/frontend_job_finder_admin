"use client";
import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/ui/input/Input';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import RichTextEditor from '@/components/form/input/RichTextEditor';
import { useCreateCareer } from '@/services/hooks/useCareers';
import { useStates } from '@/services/hooks/useStates';
import { useStatesCities, useCitiesByState } from '@/lib/useStatesCities';
import { Search, X } from 'lucide-react';
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
  const { data: statesCities, isLoading: isLoadingStates } = useStatesCities();
  
  // City search state
  const [citySearch, setCitySearch] = useState('')
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  
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

  // Extract state abbreviation from formatted state string "State Name (AB)" -> "AB"
  const getStateAbbreviation = (formattedState: string) => {
    const match = formattedState.match(/\(([^)]+)\)$/);
    return match ? match[1] : formattedState;
  };
  
  const stateAbbr = formData.state ? getStateAbbreviation(formData.state) : '';
  const { data: cities, isLoading: isLoadingCities } = useCitiesByState(stateAbbr)
  
  // Filter cities based on search
  const filteredCities = cities?.filter(city => 
    city.toLowerCase().includes(citySearch.toLowerCase())
  ) || []

  // Department & unit selection removed

  // Prepare country options
  const countryOptions = useMemo(() => {
    return COUNTRIES.map(country => ({
      value: country,
      label: country
    }));
  }, []);

  const TIMEZONE_OPTIONS = useMemo(() => [
    { value: 'America/New_York', label: 'Eastern Standard Time (EST)' },
    { value: 'America/Chicago', label: 'Central Standard Time (CST)' },
    { value: 'America/Denver', label: 'Mountain Standard Time (MST)' },
    { value: 'America/Los_Angeles', label: 'Pacific Standard Time (PST)' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' }
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

  const handleSelectState = (val: string) => {
    setFormData(prev => ({
      ...prev,
      state: val, // val is already formatted as "State Name (AB)"
      city: '' // Reset city when state changes
    }));
    setCitySearch(''); // Reset city search
    setIsCityDropdownOpen(false); // Close city dropdown
  };

  const handleSelectCity = (val: string) => {
    setFormData(prev => ({
      ...prev,
      city: val
    }));
    setCitySearch(''); // Clear search after selection
    setIsCityDropdownOpen(false); // Close dropdown after selection
  };

  const handleCitySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCitySearch(e.target.value);
    if (!isCityDropdownOpen && e.target.value) {
      setIsCityDropdownOpen(true);
    }
  };

  const clearCitySearch = () => {
    setCitySearch('');
    setIsCityDropdownOpen(false);
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

    // Salary validation: if min provided, max must be greater than or equal to min
    if (
      typeof formData.salaryRangeStart === 'number' &&
      typeof formData.salaryRangeEnd === 'number' &&
      formData.salaryRangeEnd < formData.salaryRangeStart
    ) {
      newErrors.salaryRangeEnd = 'Max salary must be greater than or equal to min salary';
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
      // Extract state name from formatted string "State Name (AB)" -> "State Name"
      const getStateName = (formattedState: string) => {
        const match = formattedState.match(/^(.+)\s\([^)]+\)$/);
        return match ? match[1] : formattedState;
      };

      const payload: CreateCareerPayload = {
        ...formData,
        state: formData.state ? getStateName(formData.state) : '',
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
      // Reset city search state
      setCitySearch('');
      setIsCityDropdownOpen(false);
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleCancel = () => {
    onClose();
    setErrors({});
    // Reset city search state
    setCitySearch('');
    setIsCityDropdownOpen(false);
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

                {/* City, State, Zip Code Row (Enhanced with search functionality) */}
                <div className="grid grid-cols-3 gap-4">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <div className="relative">
                      {/* Select Trigger */}
                      <button
                        type="button"
                        onClick={() => stateAbbr && !isLoadingCities && setIsCityDropdownOpen(!isCityDropdownOpen)}
                        disabled={!stateAbbr || isLoadingCities}
                        className={`w-full h-11 rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden text-left flex items-center justify-between disabled:bg-gray-50 disabled:text-gray-500 ${formData.city ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
                      >
                        <span>
                          {formData.city || (!stateAbbr ? 'Select a state first' : isLoadingCities ? 'Loading cities...' : 'Select city')}
                        </span>
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown */}
                      {isCityDropdownOpen && stateAbbr && !isLoadingCities && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                          {/* Search Input Inside Dropdown */}
                          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search cities..."
                                value={citySearch}
                                onChange={handleCitySearchChange}
                                className="w-full p-2 pl-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-brand-300 focus:border-brand-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                autoFocus
                              />
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                              {citySearch && (
                                <X 
                                  className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" 
                                  onClick={clearCitySearch}
                                />
                              )}
                            </div>
                          </div>

                          {/* Cities List */}
                          <div className="max-h-48 overflow-y-auto">
                            {filteredCities.length > 0 ? (
                              <>
                                {filteredCities.slice(0, 100).map((city) => (
                                  <div
                                    key={city}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-900 dark:text-white"
                                    onClick={() => handleSelectCity(city)}
                                  >
                                    {city}
                                  </div>
                                ))}
                                {filteredCities.length > 100 && (
                                  <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t bg-gray-50 dark:bg-gray-700">
                                    Showing first 100 results. Keep typing to narrow down...
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                                {citySearch ? 'No cities found matching your search' : 'Start typing to search cities'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Click outside to close */}
                      {isCityDropdownOpen && (
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsCityDropdownOpen(false)}
                        />
                      )}
                    </div>
                    {errors.city && (
                      <p className="mt-1.5 text-xs text-error-500">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State *
                    </label>
                    <Select
                      options={(statesCities ? Object.entries(statesCities).map(([key, value]) => ({
                        value: `${value.name} (${key})`,
                        label: value.name
                      })) : []).sort((a, b) => a.label.localeCompare(b.label))}
                      value={formData.state}
                      onChange={handleSelectState}
                      placeholder={isLoadingStates ? 'Loading states...' : 'Select State'}
                      disabled={isLoadingStates}
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
                          // Validate relation with current max
                          const currentMax = formData.salaryRangeEnd;
                          if (
              typeof value === 'number' &&
              typeof currentMax === 'number' &&
                            currentMax < value
                          ) {
                            setErrors(prev => ({ ...prev, salaryRangeEnd: 'Max salary must be greater than or equal to min salary' }));
                          } else if (errors.salaryRangeEnd) {
                            setErrors(prev => ({ ...prev, salaryRangeEnd: '' }));
                          }
                        }}
            min={0}
            step={1}
                        error={!!errors.salaryRangeStart}
                        hint={errors.salaryRangeStart}
                      />
                      <Input
                        type="number"
                        placeholder="Max Salary"
                        value={formData.salaryRangeEnd || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setFormData(prev => ({ ...prev, salaryRangeEnd: value }));
                          // Validate relation with current min
                          const min = formData.salaryRangeStart;
                          if (
              typeof min === 'number' &&
              value < min
                          ) {
              setErrors(prev => ({ ...prev, salaryRangeEnd: 'Max salary must be greater than or equal to min salary' }));
                          } else if (errors.salaryRangeEnd) {
                            setErrors(prev => ({ ...prev, salaryRangeEnd: '' }));
                          }
                        }}
            min={typeof formData.salaryRangeStart === 'number' ? formData.salaryRangeStart : 0}
            step={1}
                        error={!!errors.salaryRangeEnd}
                        hint={errors.salaryRangeEnd}
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
