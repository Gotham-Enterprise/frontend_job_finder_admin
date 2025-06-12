import React from 'react';
import CombinedJobDetailsStep from './steps/CombinedJobDetailsStep';
import JobDescriptionStep from './steps/JobDescriptionStep';
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

  if (step === 2) {
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

  if (step === 3) {
    return (
      <JobDescriptionStep
        description={description}
        onUpdateDescription={onUpdateDescription}
      />
    );
  }

  return null;
};

export default StepForm;
