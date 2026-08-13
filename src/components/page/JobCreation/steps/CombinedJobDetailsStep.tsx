import React from 'react';
import BasicInfoStep from './BasicInfoStep';
import LocationSalarySection from './LocationSalarySection';
import WorkDetailsStep from './WorkDetailsStep';
import { CombinedJobDetailsStepProps } from '@/services/types/combinedJobDetail';

const CombinedJobDetailsStep: React.FC<CombinedJobDetailsStepProps> = ({
  formData,
  onUpdateField,
  onUpdateAddressField,
  onAddAddress,
  onRemoveAddress,
  onToggleMultipleLocations,
  occupationOptions,
  specialtyOptions,
  isLoadingOccupations,
  selectedOccupation,
  isEditMode = false
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

      <LocationSalarySection
        country={formData.country}
        addresses={formData.addresses}
        onUpdateField={onUpdateField}
        onUpdateAddressField={onUpdateAddressField}
        onAddAddress={onAddAddress}
        onRemoveAddress={onRemoveAddress}
        onToggleMultipleLocations={onToggleMultipleLocations}
        isEditMode={isEditMode}
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
    </div>
  );
};

export default CombinedJobDetailsStep;
