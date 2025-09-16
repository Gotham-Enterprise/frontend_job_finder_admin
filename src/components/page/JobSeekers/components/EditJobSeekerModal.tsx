import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import Select from '@/components/form/Select';
import { jobSeekerApi } from '@/services/api/jobSeeker';
import { useStates } from '@/services/hooks/useStates';
import { useStatesCities, useCitiesByState } from '@/lib/useStatesCities';
import { useJobsAdminOccupations } from '@/services/hooks/useJobsAdmin';
import { JobSeekerUpdateData, JobSeekerDetails } from '@/services/types/jobSeeker';
import { Specialty } from '@/services/types/jobsAdmin';
import { Search, X } from 'lucide-react';

interface EditJobSeekerModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobSeekerId: string;
  onUpdate: () => void;
}

export const EditJobSeekerModal: React.FC<EditJobSeekerModalProps> = ({
  isOpen,
  onClose,
  jobSeekerId,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<JobSeekerUpdateData>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    country: 'US',
    zipCode: '',
    phoneNumber: '',
    occupationId: 0,
    specialtyId: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOccupationId, setSelectedOccupationId] = useState<number | undefined>(undefined);

  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { data: statesCities, isLoading: isLoadingStates } = useStatesCities();
  const { data: occupationsData, isLoading: isOccupationsLoading } = useJobsAdminOccupations();

  // City search state
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)

  const stateOptions = React.useMemo(() => {
    if (statesCities) {
      return Object.entries(statesCities).map(([key, value]) => ({
        value: `${value.name} (${key})`,
        label: value.name
      })).sort((a, b) => a.label.localeCompare(b.label));
    }
    return [];
  }, [statesCities]);

  const occupationOptions = useMemo(() => {
    const baseOptions = [{ value: '', label: 'Select Occupation' }];
    
    if (occupationsData?.success && occupationsData.data) {
      const dynamicOptions = occupationsData.data.map(occupation => ({
        value: occupation.id.toString(),
        label: occupation.name
      }));
      return [...baseOptions, ...dynamicOptions];
    }
    
    return baseOptions;
  }, [occupationsData]);

  const specialtyOptions = useMemo(() => {
    const baseOptions = [{ value: '', label: 'Select Specialty' }];
    
    if (selectedOccupationId && occupationsData?.success && occupationsData.data) {
      const selectedOccupation = occupationsData.data.find(
        occupation => occupation.id === selectedOccupationId
      );
      
      if (selectedOccupation?.specialty) {
        const dynamicOptions = selectedOccupation.specialty.map((specialty: Specialty) => ({
          value: specialty.id.toString(),
          label: specialty.name
        }));
        return [...baseOptions, ...dynamicOptions];
      }
    }
    
    return baseOptions;
  }, [selectedOccupationId, occupationsData]);

  const countryOptions = React.useMemo(() => [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'MX', label: 'Mexico' },
    { value: 'OTHER', label: 'Other' },
  ], []);

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

  const loadJobSeekerData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await jobSeekerApi.getJobSeekerById(jobSeekerId);
      if (response.success && response.data) {
        const jobSeeker = response.data;
        const nameParts = jobSeeker.name?.split(' ') || ['', ''];
        const formattedState = statesCities && jobSeeker.state && statesCities[jobSeeker.state] ? `${statesCities[jobSeeker.state].name} (${jobSeeker.state})` : jobSeeker.state || '';
        setFormData({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          address: jobSeeker.address || '',
          city: jobSeeker.city || '',
          state: formattedState,
          country: 'US',
          zipCode: jobSeeker.zipCode || '',
          phoneNumber: jobSeeker.phoneNumber || '',
          occupationId: jobSeeker.occupationId || 0,
          specialtyId: jobSeeker.specialtyId,
        });
        setSelectedOccupationId(jobSeeker.occupationId);
      }
    } catch (err) {
      setError('Failed to load job seeker data');
      console.error('Error loading job seeker:', err);
    } finally {
      setIsLoading(false);
    }
  }, [jobSeekerId]);

  useEffect(() => {
    if (isOpen && jobSeekerId && statesCities && formData.state && !formData.state.includes('(')) {
      const stateEntry = Object.entries(statesCities).find(([abbr]) => abbr === formData.state);
      if (stateEntry) {
        setFormData(prev => ({ ...prev, state: `${stateEntry[1].name} (${formData.state})` }));
      }
    }
  }, [statesCities, jobSeekerId, isOpen, formData.state]);

  const updateField = (field: keyof JobSeekerUpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Handle occupation change to reset specialty
    if (field === 'occupationId') {
      const occupationId = value ? parseInt(value) : 0;
      setSelectedOccupationId(occupationId);
      setFormData(prev => ({
        ...prev,
        occupationId,
        specialtyId: undefined // Reset specialty when occupation changes
      }));
    }

    // Handle specialty change
    if (field === 'specialtyId') {
      setFormData(prev => ({
        ...prev,
        specialtyId: value ? parseInt(value) : undefined
      }));
    }
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
    setIsSaving(true);
    setError(null);
    try {
      const stateAbbr = formData.state ? getStateAbbreviation(formData.state) : '';
      await jobSeekerApi.updateJobSeeker(jobSeekerId, { ...formData, state: stateAbbr });
      onUpdate();
      onClose();
    } catch (err) {
      const errorMessage =
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as { message?: string }).message
          : undefined;
      setError(errorMessage || 'Failed to update job seeker');
      console.error('Error updating job seeker:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    return formData.firstName.trim() && formData.lastName.trim() && formData.occupationId > 0;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-2xl mx-auto mt-8 mb-8 rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
    >
      <div className="flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Job Seeker
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Occupation *
                </label>
                <Select
                  options={occupationOptions}
                  value={formData.occupationId > 0 ? formData.occupationId.toString() : ''}
                  onChange={(value) => updateField('occupationId', value)}
                  placeholder="Select occupation"
                  disabled={isOccupationsLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specialty
                </label>
                <Select
                  options={specialtyOptions}
                  value={formData.specialtyId ? formData.specialtyId.toString() : ''}
                  onChange={(value) => updateField('specialtyId', value)}
                  placeholder="Select specialty"
                  disabled={!selectedOccupationId || selectedOccupationId === 0 || isOccupationsLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Enter address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
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
                  options={stateOptions}
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
                  Country
                </label>
                <Select
                  options={countryOptions}
                  value={formData.country}
                  onChange={(value) => updateField('country', value)}
                  placeholder="Select country"
                  disabled={true}
                />
              </div>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        )}
        </div>

        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={saveChanges}
            disabled={!isFormValid() || isSaving || isLoading}
          >
            {isSaving ? (
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
