import React, { useMemo } from 'react';
import Select from '@/components/form/Select';
import MultiSelect from '@/components/form/MultiSelect';
import Label from '@/components/form/Label';
import Radio from '@/components/form/input/Radio';
import { WorkDetailsStepProps } from '@/services/types/workDetail';
import { useShiftTypes } from '@/services/hooks/useShiftTypes';
import { useWorkTypes } from '@/services/hooks/useWorkTypes';
import { useWorkSettings } from '@/services/hooks/useWorkSettings';
import { useLanguages } from '@/services/hooks/useLanguages';
import { WorkSetting } from '@/services/types/workSettings';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const WorkDetailsStep: React.FC<WorkDetailsStepProps> = ({
  formData,
  onUpdateField
}) => {
  const { data: shiftTypesData, isLoading: shiftTypesLoading, error: shiftTypesError } = useShiftTypes();
  const { data: workTypesData, isLoading: workTypesLoading, error: workTypesError } = useWorkTypes();
  const { data: workSettingsData, isLoading: workSettingsLoading, error: workSettingsError } = useWorkSettings();
  const { data: languagesData, isLoading: languagesLoading, error: languagesError } = useLanguages();
  const workSettingOptions = useMemo(() => {
    if (workSettingsLoading) {
      return [{ value: 'loading', label: 'Loading...', disabled: true }];
    }
    
    if (workSettingsError || !workSettingsData?.success) {
      return [{ value: 'error', label: 'Error loading work settings', disabled: true }];
    }
      const apiOptions = workSettingsData.data.map((workSetting: WorkSetting) => ({
      value: workSetting.id.toString(),
      label: workSetting.name
    }));
    
    return apiOptions;
  }, [workSettingsData, workSettingsLoading, workSettingsError]);

  const shiftTypeOptions = useMemo(() => {
    const defaultOption = { value: '', label: 'Select Shift Type' };
    
    if (shiftTypesLoading) {
      return [defaultOption, { value: 'loading', label: 'Loading...', disabled: true }];
    }
    
    if (shiftTypesError || !shiftTypesData?.success) {
      return [
        defaultOption,
        { value: 'error', label: 'Error loading shift types', disabled: true }
      ];
    }
    
    const apiOptions = shiftTypesData.data.map((shiftType) => ({
      value: shiftType.id.toString(),
      label: shiftType.name
    }));
      return [defaultOption, ...apiOptions];
  }, [shiftTypesData, shiftTypesLoading, shiftTypesError]);

  const workTypeOptions = useMemo(() => {
    if (workTypesLoading) {
      return [{ value: 'loading', label: 'Loading...', disabled: true }];
    }
    
    if (workTypesError || !workTypesData?.success) {
      return [{ value: 'error', label: 'Error loading work types', disabled: true }];
    }
    
    const apiOptions = workTypesData.data.map((workType) => ({
      value: workType.id.toString(),
      label: workType.name
    }));
    
    return apiOptions;
  }, [workTypesData, workTypesLoading, workTypesError]);
  const languageOptions = useMemo(() => {
    if (languagesLoading) {
      return [{ value: 'loading', text: 'Loading...', selected: false }];
    }
    
    if (languagesError || !languagesData?.success) {
      return [{ value: 'error', text: 'Error loading languages', selected: false }];
    }
    
    const apiOptions = languagesData.data.map((language) => ({
      value: language.id.toString(),
      text: language.name,
      selected: formData.language?.includes(language.id.toString()) || false
    }));
    
    return apiOptions;
  }, [languagesData, languagesLoading, languagesError, formData.language]);

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

  return (
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
              {workSettingOptions.map((option: SelectOption) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <Label>Shift Type</Label>
            <Select
              options={shiftTypeOptions}
              onChange={(value: string) => onUpdateField('shiftType', value)}
              defaultValue={formData.shiftType}
            />
          </div>          <div>
            <MultiSelect
              label="Language"
              options={languageOptions}
              defaultSelected={formData.language || []}
              onChange={(selected: string[]) => onUpdateField('language', selected)}
              placeholder="Select languages..."
              maxDisplayItems={2}
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
  );
};

export default WorkDetailsStep;
