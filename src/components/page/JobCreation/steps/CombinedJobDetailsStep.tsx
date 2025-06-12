import React from 'react';
import BasicInfoStep from './BasicInfoStep';
import LocationStep from './LocationStep';
import WorkDetailsStep from './WorkDetailsStep';
import CompensationStep from './CompensationStep';
import JobDescriptionStep from './JobDescriptionStep';

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

interface CombinedJobDetailsStepProps {
  formData: FormData;
  onUpdateField: (field: keyof FormData, value: any) => void;
  occupationOptions: Array<{ value: string; label: string }>;
  specialtyOptions: Array<{ value: string; label: string }>;
  isLoadingOccupations: boolean;
  selectedOccupation: number | null;
}

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
