import React from 'react';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import Radio from '@/components/form/input/Radio';
import RichTextEditor from '@/components/form/input/RichTextEditor';

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

interface StepFormProps {
  step: number;
  formData: FormData;
  description: string;
  onUpdateField: (field: keyof FormData, value: any) => void;
  onUpdateDescription: (value: string) => void;
  occupationOptions: Array<{ value: string; label: string }>;
  specialtyOptions: Array<{ value: string; label: string }>;
  isLoadingOccupations: boolean;
  selectedOccupation: number | null;
}

const StepForm: React.FC<StepFormProps> = ({
  step,
  formData,
  description,
  onUpdateField,
  onUpdateDescription,
  occupationOptions,
  specialtyOptions,
  isLoadingOccupations,
  selectedOccupation
}) => {
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
    { value: 'hospital', label: 'Hospital' },
    { value: 'outpatient-office', label: 'Outpatient Office' },
    { value: 'community-health-clinic', label: 'Community Health Clinic' },
    { value: 'skilled-nursing-facility', label: 'Skilled Nursing Facility' },
    { value: 'surgical-center', label: 'Surgical Center' },
    { value: 'early-intervention-center', label: 'Early Intervention Center' },
    { value: 'home-care', label: 'Home Care' },
    { value: 'school', label: 'School' },
    { value: 'correctional-facility', label: 'Correctional Facility' },
    { value: 'assistive-living-facility', label: 'Assistive Living Facility' },
    { value: 'detox-center', label: 'Detox Center' },
    { value: 'corporate', label: 'Corporate' },
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

  // Step 2: Combined Job Details (Basic Info, Location, Work Details, Compensation)
  if (step === 2) {
    return (
      <div className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Basic Information
          </h2>
          
          <div className="space-y-6">
            <div>
              <Label>Job Title *</Label>
              <Input
                placeholder="e.g. Senior Registered Nurse, Physical Therapist"
                defaultValue={formData.title}
                onChange={(e) => onUpdateField('title', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Occupation *</Label>
                <Select
                  options={occupationOptions}
                  disabled={isLoadingOccupations}
                  onChange={(value: string) => onUpdateField('occupationId', value)}
                  defaultValue={formData.occupationId}
                />
              </div>

              <div>
                <Label>Specialty</Label>
                <Select
                  options={specialtyOptions}
                  disabled={!selectedOccupation}
                  onChange={(value: string) => onUpdateField('specialtyId', value)}
                  defaultValue={formData.specialtyId}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Location
          </h2>
          
          <div className="space-y-6">
            <div>
              <Label>Country *</Label>
              <Select
                options={countryOptions}
                onChange={(value: string) => onUpdateField('country', value)}
                defaultValue={formData.country}
              />
            </div>

            <div>
              <Label>Street Address *</Label>
              <Input
                placeholder="123 Main Street"
                defaultValue={formData.address}
                onChange={(e) => onUpdateField('address', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>City *</Label>
                <Input
                  placeholder="City"
                  defaultValue={formData.city}
                  onChange={(e) => onUpdateField('city', e.target.value)}
                />
              </div>
              <div>
                <Label>State/Province *</Label>
                <Input
                  placeholder="State"
                  defaultValue={formData.state}
                  onChange={(e) => onUpdateField('state', e.target.value)}
                />
              </div>
              <div>
                <Label>ZIP/Postal Code *</Label>
                <Input
                  placeholder="12345"
                  defaultValue={formData.zipCode}
                  onChange={(e) => onUpdateField('zipCode', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Work Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Work Details
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Work Type *</Label>
                <div className="space-y-2">
                  {workTypeOptions.map((option) => (
                    <Radio
                      key={option.value}
                      id={`workType-${option.value}`}
                      name="workType"
                      value={option.value}
                      label={option.label}
                      checked={formData.workType === option.value}
                      onChange={(value) => onUpdateField('workType', value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Work Setting *</Label>
                <div className="space-y-2">
                  {workSettingOptions.map((option) => (
                    <Radio
                      key={option.value}
                      id={`workSetting-${option.value}`}
                      name="workSetting"
                      value={option.value}
                      label={option.label}
                      checked={formData.workSetting === option.value}
                      onChange={(value) => onUpdateField('workSetting', value)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Shift Type</Label>
                <Select
                  options={shiftTypeOptions}
                  onChange={(value: string) => onUpdateField('shiftType', value)}
                  defaultValue={formData.shiftType}
                />
              </div>
              <div>
                <Label>Timezone</Label>
                <Input
                  type="text"
                  placeholder="e.g. EST, PST, GMT"
                  defaultValue={formData.timezone}
                  onChange={(e) => onUpdateField('timezone', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Required Language</Label>
                <Select
                  options={languageOptions}
                  onChange={(value: string) => onUpdateField('language', value)}
                  defaultValue={formData.language}
                />
              </div>
              <div>
                <Label>Clinic Size</Label>
                <Select
                  options={clinicSizeOptions}
                  onChange={(value: string) => onUpdateField('clinicSize', value)}
                  defaultValue={formData.clinicSize}
                />
              </div>
            </div>

            <div>
              <Label>Work Facility *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                {workFacilityOptions.map((option) => (
                  <Radio
                    key={option.value}
                    id={`workFacility-${option.value}`}
                    name="workFacility"
                    value={option.value}
                    label={option.label}
                    checked={formData.workFacility === option.value}
                    onChange={(value) => onUpdateField('workFacility', value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Compensation Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Compensation
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Currency *</Label>
                <Select
                  options={currencyOptions}
                  onChange={(value: string) => onUpdateField('currency', value)}
                  defaultValue={formData.currency}
                />
              </div>
              <div>
                <Label>Salary From *</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  min="0"
                  defaultValue={formData.salaryFrom.toString()}
                  onChange={(e) => onUpdateField('salaryFrom', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Salary To *</Label>
                <Input
                  type="number"
                  placeholder="80000"
                  min="0"
                  defaultValue={formData.salaryTo.toString()}
                  onChange={(e) => onUpdateField('salaryTo', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label>Salary Type *</Label>
              <div className="flex gap-4 mt-3">
                {salaryTypeOptions.map((option) => (
                  <Radio
                    key={option.value}
                    id={`salaryType-${option.value}`}
                    name="salaryType"
                    value={option.value}
                    label={option.label}
                    checked={formData.salaryType === option.value}
                    onChange={(value) => onUpdateField('salaryType', value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Job Description
  if (step === 3) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Job Description
        </h2>
        
        <div className="space-y-4">
          <Label>Describe the position, requirements, and benefits</Label>          <RichTextEditor
            content={description}
            onChange={onUpdateDescription}
            placeholder="Write a compelling job description that attracts the right candidates..."
          />
        </div>
      </div>
    );
  }

  return null;
};

export default StepForm;
