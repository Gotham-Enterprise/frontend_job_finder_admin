"use client";
import React, { useState } from 'react';
import { BoltIcon } from '@/icons';
import ErrorState from '../../../../common/ErrorState';
import FullScreenSpinner from '../../../../ui/FullScreenSpinner';
import ApplicantsHeader from './ApplicantsHeader';
import ApplicantsTable from './ApplicantsTable';
import ApplicantsTablePagination from './ApplicantsTablePagination';
import { Applicant, MetaData, ApplicantsProps } from '@/services/types/applicant';

const Applicants: React.FC<ApplicantsProps> = ({
  applicants,
  metaData,
  isLoading = false,
  error,
  onViewApplicant,
  onViewResume,
  onPageChange,
  getStatusVariant,
  onRefetch,
  className = "",
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isViewingResume, setIsViewingResume] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const tableColumns = [
    { key: 'name', label: 'Applicant', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];
  const filteredApplicants = searchInput
    ? applicants.filter(applicant =>
        applicant.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchInput.toLowerCase())
      )
    : applicants;

  const viewResume = async (resumeUrl: string) => {
    if (onViewResume) {
      setIsViewingResume(true);
      try {
        await onViewResume(resumeUrl);
      } finally {
        setIsViewingResume(false);
      }
    }
  };

  if (error && !isLoading) {
    return (
      <ErrorState 
        className={className}
        message={`Error loading applicants: ${error.message}`}
        onRetry={onRefetch}
        retryIcon={<BoltIcon />}
      />
    );
  }
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <ApplicantsHeader
        totalCount={metaData?.totalCount || 0}
        isLoading={isLoading}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onRefetch={onRefetch}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <>
          <ApplicantsTable
            applicants={filteredApplicants}
            isLoading={isLoading}
            tableColumns={tableColumns}
            getStatusVariant={getStatusVariant}
            onViewApplicant={onViewApplicant}
            onViewResume={viewResume}
            isViewingResume={isViewingResume}
          />

          <ApplicantsTablePagination
            data={{ metaData }}
            filters={{ page: metaData?.page || 1 }}
            onPageChange={onPageChange}
          />
        </>
      )}

      <FullScreenSpinner 
        isVisible={isViewingResume} 
        message="Opening resume..." 
      />
    </div>
  );
};

export default Applicants;
