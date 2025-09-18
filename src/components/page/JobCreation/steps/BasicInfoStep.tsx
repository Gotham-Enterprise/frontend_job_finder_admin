import React from 'react';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import {FormData, BasicInfoStepProps} from '@/services/types/basicInfo'

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onUpdateField,
  occupationOptions,
  specialtyOptions,
  isLoadingOccupations,
  selectedOccupation
}) => {
  return (
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
             placeholder='Select Occupation'
              options={occupationOptions}
              disabled={isLoadingOccupations}
              onChange={(value: string) => onUpdateField('occupationId', value)}
              defaultValue={formData.occupationId}
            />

          
          </div>

          <div>
            <Label>Specialty</Label>
            <Select
              placeholder="Select Specialty"
              options={specialtyOptions}
              disabled={!selectedOccupation}
              onChange={(value: string) => onUpdateField('specialtyId', value)}
              defaultValue={formData.specialtyId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
