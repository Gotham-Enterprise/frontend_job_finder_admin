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
import { useClinicSizes } from '@/services/hooks/useClinicSizes';
import { useWorkFacilities } from '@/services/hooks/useWorkFacilities';
import { WorkSetting } from '@/services/types/workSettings';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const WorkDetailsStep: React.FC<WorkDetailsStepProps> = ({
  formData,
  onUpdateField
}) => {  const { data: shiftTypesData, isLoading: shiftTypesLoading, error: shiftTypesError } = useShiftTypes();
  const { data: workTypesData, isLoading: workTypesLoading, error: workTypesError } = useWorkTypes();
  const { data: workSettingsData, isLoading: workSettingsLoading, error: workSettingsError } = useWorkSettings();
  const { data: languagesData, isLoading: languagesLoading, error: languagesError } = useLanguages();
  const { data: clinicSizesData, isLoading: clinicSizesLoading, error: clinicSizesError } = useClinicSizes();
  const { data: workFacilitiesData, isLoading: workFacilitiesLoading, error: workFacilitiesError } = useWorkFacilities();
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
  const clinicSizeOptions = useMemo(() => {
    const defaultOption = { value: '', label: 'Select Clinic Size' };
    
    if (clinicSizesLoading) {
      return [defaultOption, { value: 'loading', label: 'Loading...', disabled: true }];
    }
    
    if (clinicSizesError || !clinicSizesData?.success) {
      return [
        defaultOption,
        { value: 'error', label: 'Error loading clinic sizes', disabled: true }
      ];
    }
    
    const apiOptions = clinicSizesData.data.map((clinicSize) => ({
      value: clinicSize.id.toString(),
      label: clinicSize.name
    }));
    
    return [defaultOption, ...apiOptions];
  }, [clinicSizesData, clinicSizesLoading, clinicSizesError]);
  
  const workFacilityOptions = useMemo(() => {
    if (workFacilitiesLoading) {
      return [{ value: 'loading', label: 'Loading...', disabled: true }];
    }
    
    if (workFacilitiesError || !workFacilitiesData?.success) {
      return [{ value: 'error', label: 'Error loading work facilities', disabled: true }];
    }
    
    const apiOptions = workFacilitiesData.data.map((workFacility) => ({
      value: workFacility.id.toString(),
      label: workFacility.name
    }));
    
    return apiOptions;
  }, [workFacilitiesData, workFacilitiesLoading, workFacilitiesError]);

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
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <MultiSelect
              label="Language"
              options={languageOptions}
              defaultSelected={formData.language || []}
              onChange={(selected: string[]) => onUpdateField('language', selected)}
              placeholder="Select languages..."
              maxDisplayItems={2}
            />
          </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label>Shift Type</Label>
            <Select
              options={shiftTypeOptions}
              onChange={(value: string) => onUpdateField('shiftType', value)}
              defaultValue={formData.shiftType}
            />
          </div>          
       
          <div>
            <Label>Company Size</Label>
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
