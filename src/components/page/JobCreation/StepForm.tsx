import React from 'react';
import CombinedJobDetailsStep from './steps/CombinedJobDetailsStep';
import JobDescriptionStep from './steps/JobDescriptionStep';

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
  // Step 2: Combined Job Details (Basic Info, Location, Work Details, Compensation)
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

  // Step 3: Job Description
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
