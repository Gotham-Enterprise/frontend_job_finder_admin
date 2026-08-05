import React from 'react';
import CombinedJobDetailsStep from './steps/CombinedJobDetailsStep';
import JobDescriptionStep from './steps/JobDescriptionStep';
import ManageStep from './steps/ManageStep';
import { StepFormProps } from '@/services/types/stepForm';


const StepForm: React.FC<StepFormProps> = ({
  step,
  formData,
  description,
  onUpdateField,
  onUpdateAddressField,
  onAddAddress,
  onRemoveAddress,
  onToggleMultipleLocations,
  onUpdateDescription,
  occupationOptions,
  specialtyOptions,
  isLoadingOccupations,
  selectedOccupation,
  isEditMode = false
}) => {
  if (step === 1) {
    return (
      <CombinedJobDetailsStep
        formData={formData}
        onUpdateField={onUpdateField}
        onUpdateAddressField={onUpdateAddressField}
        onAddAddress={onAddAddress}
        onRemoveAddress={onRemoveAddress}
        onToggleMultipleLocations={onToggleMultipleLocations}
        occupationOptions={occupationOptions}
        specialtyOptions={specialtyOptions}
        isLoadingOccupations={isLoadingOccupations}
        selectedOccupation={selectedOccupation}
        isEditMode={isEditMode}
      />
    );
  }  if (step === 2) {
    // The AI description context uses the first address (employer app parity)
    const firstAddress = formData.addresses[0];
    return (
      <JobDescriptionStep
        description={description}
        onUpdateDescription={onUpdateDescription}
        jobTitle={formData.title}
        occupationId={formData.occupationId ? parseInt(formData.occupationId) : undefined}
        specialtyId={formData.specialtyId ? parseInt(formData.specialtyId) : undefined}
        workType={formData.workType}
        workSetting={formData.workSetting}
        locationCountry={formData.country}
        locationState={firstAddress?.state ?? ''}
        locationCity={firstAddress?.city}
        locationZipCode={firstAddress?.zipCode ?? ''}
        locationAddress={firstAddress?.address}
        workFacility={formData.workFacility}
        salaryCurrency={firstAddress?.currency}
        salaryRangeStart={firstAddress?.salaryFrom}
        salaryRangeEnd={firstAddress?.salaryTo}
        salaryType={firstAddress?.salaryType}
        shiftType={formData.shiftType}
        languages={formData.language}
        companySize={formData.clinicSize}
      />
    );
  }  if (step === 3) {
    return (
      <ManageStep
        formData={{
          postingDate: formData.postingDate,
          autoRenew: formData.autoRenew,
          questions: formData.questions,
          documents: formData.documents
        }}
        onUpdateField={onUpdateField}
        isEditMode={isEditMode}
      />
    );
  }

  return null;
};

export default StepForm;
