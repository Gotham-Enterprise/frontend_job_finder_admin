"use client";
import React from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../common/ErrorState';
import { useCareersLogic } from '@/services/hooks/useCareersLogic';
import { CareersProps } from '@/services/types/CareersTypes';
import {
  CareersHeader,
  CareersJobSection,
} from './components';

const Careers: React.FC<CareersProps> = ({ className = "" }) => {
  const {
    activeJobs,
    closedJobs,
    isLoading,
    error,
    refetch,
    createJob,
    viewJobDetails,
    viewApplicants,
  } = useCareersLogic();

  if (error && !isLoading) {
    return (
      <ErrorState 
        className={className}
        message={`Error loading careers: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <CareersHeader
        onCreateJob={createJob}
      />
      
      <CareersJobSection
        title="Active Job Post(s)"
        jobs={activeJobs}
        isLoading={isLoading}
        onViewJobDetails={viewJobDetails}
        onViewApplicants={viewApplicants}
      />
      
      <CareersJobSection
        title="Closed Job Post(s)"
        jobs={closedJobs}
        isLoading={isLoading}
        onViewJobDetails={viewJobDetails}
        onViewApplicants={viewApplicants}
      />
    </div>
  );
};

export default Careers;
