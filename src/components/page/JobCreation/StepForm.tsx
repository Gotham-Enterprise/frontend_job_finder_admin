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
  }  if (step === 2) {
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
        locationState={formData.state}
        locationCity={formData.city}
        locationZipCode={formData.zipCode}
        locationAddress={formData.address}
        workFacility={formData.workFacility}
        salaryCurrency={formData.currency}
        salaryRangeStart={formData.salaryFrom}
        salaryRangeEnd={formData.salaryTo}
        salaryType={formData.salaryType}
        shiftType={formData.shiftType}
        languages={formData.language}
        companySize={formData.clinicSize}
      />
    );
  }if (step === 3) {
    return (
      <ManageStep
        formData={{
          postingDate: formData.postingDate,
          autoRenew: formData.autoRenew,
          questions: formData.questions,
          documents: formData.documents
        }}
        onUpdateField={onUpdateField}
      />
    );
  }

  return null;
};

export default StepForm;
