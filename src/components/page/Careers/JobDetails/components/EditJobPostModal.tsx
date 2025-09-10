import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import RichTextEditor from '@/components/form/input/RichTextEditor';
import Select from '@/components/form/Select';
import { useUpdateCareer } from '@/services/hooks/useCareers';
import { useStates } from '@/services/hooks/useStates';
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
  const [error, setError] = useState<string | null>(null);

  const updateCareerMutation = useUpdateCareer();
  const { data: statesData } = useStates();

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

  useEffect(() => {
    // Reset form when modal opens or job changes
  if (isOpen && job) {

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
        state: job.state || '',
        zipCode: job.zipCode || '',
        country: job.country || 'United States',
        timezone: job.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        salaryRangeStart: salaryStart,
        salaryRangeEnd: salaryEnd,
        jobDescription: job.jobDescription || job.description || '',
      };
      
      setFormData(newFormData);
      setError(null); // Clear any previous errors
    }
  }, [job, isOpen]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveChanges = async () => {
    if (!job) return;

    const payload: UpdateCareerPayload = {
      jobTitle: formData.jobTitle,
      jobType: formData.jobType,
      address: formData.address,
      city: formData.city,
      state: formData.state,
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
      setError('Failed to update job post');
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

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
                    City *
                  </label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State
                  </label>
                  <Select
                    options={stateOptions}
                    value={formData.state}
                    onChange={(value) => updateField('state', value)}
                    placeholder="Select state"
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
                    onChange={(e) => updateField('salaryRangeStart', e.target.value)}
                    placeholder="Enter starting salary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Salary Range End ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.salaryRangeEnd}
                    onChange={(e) => updateField('salaryRangeEnd', e.target.value)}
                    placeholder="Enter ending salary"
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
            onClick={saveChanges}
            disabled={!isFormValid() || updateCareerMutation.isPending}
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
