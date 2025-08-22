import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import TextArea from '@/components/form/input/TextArea';
import Select from '@/components/form/Select';
import { employerApi } from '@/services/api/employer';
import { EmployerUpdateData } from '@/services/types/employer';
import { useStates } from '@/services/hooks/useStates';

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

  const stateOptions = [
    { value: '', label: 'Select state' },
    ...(statesData?.success && statesData.data
      ? statesData.data.states.map(state => ({
          value: state.abbreviation,
          label: state.name
        }))
      : [])
  ];

  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'MX', label: 'Mexico' },
  ];

  useEffect(() => {
    if (isOpen && employerId) {
      loadEmployerData();
    }
  }, [isOpen, employerId]);

  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const loadEmployerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await employerApi.getEmployerById(employerId);
      if (response.success && response.data) {
        const employer = response.data;
        setFormData({
          name: employer.companyName || '',
          overview: stripHtmlTags(employer.overview || ''),
          address: employer.address || '',
          city: employer.city || '',
          state: employer.state || '',
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
  };

  const updateField = (field: keyof EmployerUpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveChanges = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await employerApi.updateEmployer(employerId, formData);
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
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Enter city"
                />
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
