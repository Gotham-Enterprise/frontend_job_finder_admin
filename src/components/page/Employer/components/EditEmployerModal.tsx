import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import TextArea from '@/components/form/input/TextArea';
import Select from '@/components/form/Select';
import { employerApi } from '@/services/api/employer';
import { EmployerUpdateData } from '@/services/types/employer';
import { useStates } from '@/services/hooks/useStates';
import { useStatesCities, useCitiesByState } from '@/lib/useStatesCities';
import { Search, X } from 'lucide-react';

interface EditEmployerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employerId: string;
  onUpdate: () => void;
}

export const EditEmployerModal: React.FC<EditEmployerModalProps> = ({
  isOpen,
  onClose,
  employerId,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<EmployerUpdateData>({
    name: '',
    overview: '',
    address: '',
    city: '',
    state: '',
    country: 'US',
    zipCode: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { data: statesCities, isLoading: isLoadingStates } = useStatesCities();

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

  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'MX', label: 'Mexico' },
  ];

  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const loadEmployerData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await employerApi.getEmployerById(employerId);
      if (response.success && response.data) {
        const employer = response.data;
        const formattedState = statesCities && employer.state && statesCities[employer.state] ? `${statesCities[employer.state].name} (${employer.state})` : employer.state || '';
        setFormData({
          name: employer.companyName || '',
          overview: stripHtmlTags(employer.overview || ''),
          address: employer.address || '',
          city: employer.city || '',
          state: formattedState,
          country: employer.country || 'US',
          zipCode: '', // Not available in the current employer details
          phoneNumber: employer.phoneNumber || '',
        });
      }
    } catch (err) {
      setError('Failed to load employer data');
      console.error('Error loading employer:', err);
    } finally {
      setIsLoading(false);
    }
  }, [employerId]);

  useEffect(() => {
    if (isOpen && employerId) {
      loadEmployerData();
    }
  }, [isOpen, employerId, loadEmployerData]);

  useEffect(() => {
    if (isOpen && employerId && statesCities && formData.state && !formData.state.includes('(')) {
      const stateEntry = Object.entries(statesCities).find(([abbr]) => abbr === formData.state);
      if (stateEntry) {
        setFormData(prev => ({ ...prev, state: `${stateEntry[1].name} (${formData.state})` }));
      }
    }
  }, [statesCities, employerId, isOpen, formData.state]);

  const updateField = (field: keyof EmployerUpdateData, value: string) => {
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
    setIsSaving(true);
    setError(null);
    try {
      const stateAbbr = formData.state ? getStateAbbreviation(formData.state) : '';
      await employerApi.updateEmployer(employerId, { ...formData, state: stateAbbr });
      onUpdate();
      onClose();
    } catch (err) {
      setError('Failed to update employer');
      console.error('Error updating employer:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    return formData.name.trim() && formData.overview.trim();
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
            Edit Employer
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Overview *
              </label>
              <TextArea
                value={formData.overview}
                onChange={(value) => updateField('overview', value)}
                placeholder="Enter company overview"
                rows={4}
                className="text-gray-900 dark:text-white"
              />
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
                  onChange={(value: string) => updateField('state', value)}
                  placeholder="Select state"
                  disabled={isStatesLoading}
                  searchable={true}
                  searchPlaceholder="Search states..."
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
                  defaultValue="US"
                  onChange={(value: string) => updateField('country', value)}
                  placeholder="United States"
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
