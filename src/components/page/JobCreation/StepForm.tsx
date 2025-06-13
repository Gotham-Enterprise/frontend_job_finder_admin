import React from 'react';
import CombinedJobDetailsStep from './steps/CombinedJobDetailsStep';
import JobDescriptionStep from './steps/JobDescriptionStep';
import ManageStep from './steps/ManageStep';
import { FormData, StepFormProps } from '@/services/types/stepForm';


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
  if (step === 1) {
    return (
      <CombinedJobDetailsStep
        formData={formData}
        onUpdateField={onUpdateField}
        occupationOptions={occupationOptions}
        specialtyOptions={specialtyOptions}
        isLoadingOccupations={isLoadingOccupations}
        selectedOccupation={selectedOccupation}
      />
    );
  }
  if (step === 2) {
    return (
      <JobDescriptionStep
        description={description}
        onUpdateDescription={onUpdateDescription}
      />
    );
  }
  if (step === 3) {
    return (
      <ManageStep
        formData={{
          postingDate: formData.postingDate,
          autoRenew: formData.autoRenew
        }}
        onUpdateField={onUpdateField}
      />
    );
  }

  return null;
};

export default StepForm;
