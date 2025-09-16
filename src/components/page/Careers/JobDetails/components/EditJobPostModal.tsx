import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import RichTextEditor from '@/components/form/input/RichTextEditor';
import Select from '@/components/form/Select';
import { useUpdateCareer } from '@/services/hooks/useCareers';
import { useStates } from '@/services/hooks/useStates';
import { useStatesCities, useCitiesByState } from '@/lib/useStatesCities';
import { Search, X } from 'lucide-react';
import { Career, UpdateCareerPayload } from '@/services/api/careers';

interface EditJobPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Career | null;
  onUpdate: () => void;
}

interface FormData {
  jobTitle: string;
  jobType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  timezone: string;
  salaryRangeStart: string;
  salaryRangeEnd: string;
  jobDescription: string;
}

const EditJobPostModal: React.FC<EditJobPostModalProps> = ({
  isOpen,
  onClose,
  job,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<FormData>({
    jobTitle: '',
    jobType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  country: 'United States',
    timezone: '',
    salaryRangeStart: '',
    salaryRangeEnd: '',
    jobDescription: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // City search state
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)

  const updateCareerMutation = useUpdateCareer();
  const { data: statesData } = useStates();
  const { data: statesCities, isLoading: isLoadingStates } = useStatesCities();

  // Create options for selects
  // Department removed

  const stateOptions = statesData?.data?.states?.map(state => ({
    value: state.abbreviation,
    label: state.name,
  })) || [];

  const jobTypeOptions = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Temporary', label: 'Temporary' },
    { value: 'Internship', label: 'Internship' },
  ];

  const countryOptions = [
    { value: 'United States', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
  ];

  // Extract state abbreviation from formatted state string "State Name (AB)" -> "AB"
  const getStateAbbreviation = (formattedState: string) => {
    const match = formattedState.match(/\(([^)]+)\)$/);
    return match ? match[1] : formattedState;
  };
  
  const stateAbbr = formData.state ? getStateAbbreviation(formData.state) : '';
  const { data: cities, isLoading: isLoadingCities } = useCitiesByState(stateAbbr)
  
  // Filter cities based on search
  const filteredCities = cities?.filter(city => 
    city.toLowerCase().includes(formData.city.toLowerCase())
  ) || []

  // Convert state name to formatted state for display
  const getFormattedState = (stateName: string) => {
    if (!stateName) return '';
    
    // If already formatted, return as is
    if (stateName.includes('(') && stateName.includes(')')) {
      return stateName;
    }
    
    // Find the state in statesCities and format it
    if (statesCities) {
      for (const [abbr, stateData] of Object.entries(statesCities)) {
        if (stateData.name === stateName) {
          return `${stateName} (${abbr})`;
        }
      }
    }
    
    return stateName;
  };

  useEffect(() => {
    // Reset form when modal opens or job changes
  if (isOpen && job) {
      console.log('EditJobPostModal - Job data received:', job);
      console.log('EditJobPostModal - Address field:', job.address);
      console.log('EditJobPostModal - ZipCode field:', job.zipCode);

      // Parse salary range more robustly
      let salaryStart = '';
      let salaryEnd = '';
      
      // Use individual salary fields if available, otherwise parse from salaryRange string
      if (job.salaryRangeStart !== undefined) {
        salaryStart = job.salaryRangeStart.toString();
      } else if (job.salaryRange) {
        const salaryParts = job.salaryRange.split('-');
        if (salaryParts.length === 2) {
          salaryStart = salaryParts[0]?.replace(/[^0-9.]/g, '').trim() || '';
        }
      }
      
      if (job.salaryRangeEnd !== undefined) {
        salaryEnd = job.salaryRangeEnd.toString();
      } else if (job.salaryRange) {
        const salaryParts = job.salaryRange.split('-');
        if (salaryParts.length === 2) {
          salaryEnd = salaryParts[1]?.replace(/[^0-9.]/g, '').trim() || '';
        }
      }

  const newFormData = {
        jobTitle: job.jobTitle || '',
        jobType: job.jobType || '',
        address: job.address || '',
        city: job.city || '',
        state: getFormattedState(job.state || ''),
        zipCode: job.zipCode || '',
        country: job.country || 'United States',
        timezone: job.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        salaryRangeStart: salaryStart,
        salaryRangeEnd: salaryEnd,
        jobDescription: job.jobDescription || job.description || '',
      };
      
      setFormData(newFormData);
      setErrors({}); // Clear field errors
      // Reset city search state when job changes
      setIsCityDropdownOpen(false);
    }
  }, [job, isOpen, statesCities]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectState = (val: string) => {
    setFormData(prev => ({
      ...prev,
      state: val, // val is already formatted as "State Name (AB)"
      city: '' // Reset city when state changes
    }));
    setIsCityDropdownOpen(false); // Close city dropdown
  };

  const handleSelectCity = (val: string) => {
    setFormData(prev => ({
      ...prev,
      city: val
    }));
    setIsCityDropdownOpen(false); // Close dropdown after selection
  };

  const saveChanges = async () => {
    if (!job) return;

    // Extract state name from formatted string "State Name (AB)" -> "State Name"
    const getStateName = (formattedState: string) => {
      const match = formattedState.match(/^(.+)\s\([^)]+\)$/);
      return match ? match[1] : formattedState;
    };

    const payload: UpdateCareerPayload = {
      jobTitle: formData.jobTitle,
      jobType: formData.jobType,
      address: formData.address,
      city: formData.city,
      state: formData.state ? getStateName(formData.state) : '',
      zipCode: formData.zipCode,
      country: formData.country,
      timezone: formData.timezone,
      salaryRangeStart: formData.salaryRangeStart ? parseFloat(formData.salaryRangeStart) : undefined,
      salaryRangeEnd: formData.salaryRangeEnd ? parseFloat(formData.salaryRangeEnd) : 0,
      jobDescription: formData.jobDescription,
    };

    try {
      await updateCareerMutation.mutateAsync({
        id: job.id,
        payload: payload,
      });
      onUpdate();
      onClose();
    } catch (err) {
      // Error toast is automatically shown by the mutation hook
      console.error('Failed to update job post:', err);
    }
  };

  const isFormValid = () => {
    return (
      formData.jobTitle?.trim() &&
      formData.jobDescription?.trim() &&
      formData.city?.trim() &&
      formData.timezone?.trim()
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-6xl mx-auto mt-8 mb-8 rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
    >
      <div className="flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Job Post
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-8 h-full">
            {/* Left Column - Form Fields */}
            <div className="space-y-4 overflow-y-auto pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Title *
                  </label>
                  <Input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => updateField('jobTitle', e.target.value)}
                    placeholder="Enter job title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Type
                  </label>
                  <Select
                    options={jobTypeOptions}
                    value={formData.jobType}
                    onChange={(value) => updateField('jobType', value)}
                    placeholder="Select job type"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address *
                </label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Enter address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <div className="relative">
                    {/* City Input with Dropdown */}
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, city: e.target.value }));
                        if (!isCityDropdownOpen && e.target.value && stateAbbr) {
                          setIsCityDropdownOpen(true);
                        }
                      }}
                      onFocus={() => {
                        if (stateAbbr && !isLoadingCities && !isCityDropdownOpen) {
                          setIsCityDropdownOpen(true);
                        }
                      }}
                      placeholder={!stateAbbr ? 'Select a state first' : isLoadingCities ? 'Loading cities...' : 'Enter or search city'}
                      disabled={!stateAbbr || isLoadingCities}
                      className={`w-full h-11 rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden disabled:bg-gray-50 disabled:text-gray-500 ${formData.city ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
                    />

                    {/* Dropdown */}
                    {isCityDropdownOpen && stateAbbr && !isLoadingCities && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
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
                          ) : formData.city ? (
                            <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                              No cities found matching "{formData.city}". You can still enter it manually.
                            </div>
                          ) : (
                            <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                              Start typing to search cities or enter manually
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zip Code
                  </label>
                  <Input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateField('zipCode', e.target.value)}
                    placeholder="Enter zip code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <Select
                    options={countryOptions}
                    value={formData.country}
                    onChange={(value) => updateField('country', value)}
                    placeholder="Select country"
                  />
                </div>
              </div>

              {/* Department removed */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Timezone *
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => updateField('timezone', e.target.value)}
                    className="h-11 w-full rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden appearance-none"
                  >
                    <option value="">Select timezone</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Salary Range Start ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.salaryRangeStart}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateField('salaryRangeStart', val);
                      const min = val ? parseFloat(val) : undefined;
                      const max = formData.salaryRangeEnd ? parseFloat(formData.salaryRangeEnd) : undefined;
                      if (
                        typeof min === 'number' && !isNaN(min) &&
                        typeof max === 'number' && !isNaN(max) &&
                        max < min
                      ) {
                        setErrors(prev => ({ ...prev, salaryRangeEnd: 'Max salary must be greater than or equal to min salary' }));
                      } else if (errors.salaryRangeEnd) {
                        setErrors(prev => ({ ...prev, salaryRangeEnd: '' }));
                      }
                    }}
                    placeholder="Enter starting salary"
                    min={0}
                    step={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Salary Range End ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.salaryRangeEnd}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateField('salaryRangeEnd', val);
                      const max = val ? parseFloat(val) : undefined;
                      const min = formData.salaryRangeStart ? parseFloat(formData.salaryRangeStart) : undefined;
                      if (
                        typeof min === 'number' && !isNaN(min) &&
                        typeof max === 'number' && !isNaN(max) &&
                        max < min
                      ) {
                        setErrors(prev => ({ ...prev, salaryRangeEnd: 'Max salary must be greater than or equal to min salary' }));
                      } else if (errors.salaryRangeEnd) {
                        setErrors(prev => ({ ...prev, salaryRangeEnd: '' }));
                      }
                    }}
                    placeholder="Enter ending salary"
                    min={(() => { const n = Number(formData.salaryRangeStart); return Number.isFinite(n) ? n : 0; })()}
                    step={1}
                    error={!!errors.salaryRangeEnd}
                    hint={errors.salaryRangeEnd}
                  />
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
                  onChange={(value: string) => updateField('jobDescription', value)}
                  placeholder="Enter job description"
                  minHeight={400}
                  hideImageButton={true}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={updateCareerMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={async () => {
              // Final salary validation before save
              const min = formData.salaryRangeStart ? parseFloat(formData.salaryRangeStart) : undefined;
              const max = formData.salaryRangeEnd ? parseFloat(formData.salaryRangeEnd) : undefined;
              if (
                typeof min === 'number' && !isNaN(min) &&
                typeof max === 'number' && !isNaN(max) &&
                max < min
              ) {
                setErrors(prev => ({ ...prev, salaryRangeEnd: 'Max salary must be greater than or equal to min salary' }));
                return; // Don't save if there's a validation error
              }
              await saveChanges();
            }}
            disabled={!isFormValid() || !!errors.salaryRangeEnd || updateCareerMutation.isPending}
          >
            {updateCareerMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditJobPostModal;
