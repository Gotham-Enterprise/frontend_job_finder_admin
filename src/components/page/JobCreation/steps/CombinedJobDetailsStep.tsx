import React from 'react';
import BasicInfoStep from './BasicInfoStep';
import LocationStep from './LocationStep';
import WorkDetailsStep from './WorkDetailsStep';
import CompensationStep from './CompensationStep';
import {FormData, CombinedJobDetailsStepProps } from '@/services/types/combinedJobDetail';

const CombinedJobDetailsStep: React.FC<CombinedJobDetailsStepProps> = ({
  formData,
  onUpdateField,
  occupationOptions,
  specialtyOptions,
  isLoadingOccupations,
  selectedOccupation
}) => {
  return (
    <div className="space-y-8">
      <BasicInfoStep
        formData={{
          title: formData.title,
          occupationId: formData.occupationId,
          specialtyId: formData.specialtyId
        }}
        onUpdateField={onUpdateField}
        occupationOptions={occupationOptions}
        specialtyOptions={specialtyOptions}
        isLoadingOccupations={isLoadingOccupations}
        selectedOccupation={selectedOccupation}
      />

      <LocationStep
        formData={{
          country: formData.country,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        }}
        onUpdateField={onUpdateField}
      />

      <WorkDetailsStep
        formData={{
          workType: formData.workType,
          workSetting: formData.workSetting,
          shiftType: formData.shiftType,
          timezone: formData.timezone,
          language: formData.language,
          clinicSize: formData.clinicSize,
          workFacility: formData.workFacility
        }}
        onUpdateField={onUpdateField}
      />

      <CompensationStep
        formData={{
          currency: formData.currency,
          salaryFrom: formData.salaryFrom,
          salaryTo: formData.salaryTo,
          salaryType: formData.salaryType
        }}
        onUpdateField={onUpdateField}
      />
    </div>
  );
};

export default CombinedJobDetailsStep;
