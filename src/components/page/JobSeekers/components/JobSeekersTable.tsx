import React, { useState } from 'react';
import Link from 'next/link';
import {  formatDateTimeEST } from '@/services/utils/dateUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../../ui/table';
import Badge from '../../../ui/badge/Badge';
import Button from '../../../ui/button/Button';
import TableHeading from '../../../tables/tableHeader';
import { EyeIcon, TimeIcon, FileIcon, DownloadIcon, PencilIcon } from '@/icons';
import { JobSeekersTableProps } from '@/services/types/JobSeekersTypes';
import Avatar from '../../../ui/avatar/Avatar';
import { EditJobSeekerModal } from './EditJobSeekerModal';
import { useToast } from '@/context/ToastContext';
import PermissionWrapper from '@/components/common/PermissionWrapper';


interface SpecialtyDisplayProps {
  specialties: string[];
  jobSeekerId: string;
  expandedRows: Set<string>;
  onToggleExpanded: (jobSeekerId: string) => void;
}

const SpecialtyDisplay: React.FC<SpecialtyDisplayProps> = ({ 
  specialties, 
  jobSeekerId, 
  expandedRows, 
  onToggleExpanded 
}) => {
  if (!specialties || specialties.length === 0) {
    return <span className="text-gray-400 dark:text-gray-500 text-sm italic">Not specified</span>;
  }

  const isExpanded = expandedRows.has(jobSeekerId);
  const shouldShowToggle = specialties.length > 2;
  const displayedSpecialties = isExpanded ? specialties : specialties.slice(0, 2);

  const toggleExpanded = () => {
    onToggleExpanded(jobSeekerId);
  };

  return (
    <div className="text-sm text-gray-900 dark:text-white">
      <div className="space-y-1">
        {displayedSpecialties.map((specialty, index) => (
          <div key={index} className="text-sm">
            {specialty}
          </div>
        ))}
      </div>
      {shouldShowToggle && (
        <Button
          variant="text-primary"
          size="sm"
          className="text-brand-400 mt-1 p-0 h-auto text-xs"
          onClick={toggleExpanded}
        >
          {isExpanded ? 'See Less' : `See More (${specialties.length - 2} more)`}
        </Button>
      )}
    </div>
  );
};

const JobSeekersTable: React.FC<JobSeekersTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  onViewJobSeeker,
  onViewResume,
  isViewingResume,
  onRefresh,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loadingResumeId, setLoadingResumeId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedJobSeekerId, setSelectedJobSeekerId] = useState<string | null>(null);
  const { addToast } = useToast();

  const openEditModal = (jobSeekerId: string) => {
    setSelectedJobSeekerId(jobSeekerId);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedJobSeekerId(null);
  };

  const refreshData = (showSuccessToast = false) => {
    if (showSuccessToast) {
      addToast({
        variant: 'success',
        title: 'Success',
        message: 'Job seeker has been updated successfully',
        duration: 5000,
      });
    }
    
    if (onRefresh) {
      onRefresh();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const toggleExpanded = (jobSeekerId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(jobSeekerId)) {
      newExpandedRows.delete(jobSeekerId);
    } else {
      newExpandedRows.add(jobSeekerId);
    }
    setExpandedRows(newExpandedRows);
  };

  const viewResume = async (jobSeekerId: string, objectKey: string, fileName?: string) => {
    setLoadingResumeId(jobSeekerId);
    try {
      await onViewResume(objectKey, fileName);
    } finally {
      setLoadingResumeId(null);
    }
  };

  const renderResumeButton = (jobSeeker: any) => {
    const isLoadingThisResume = loadingResumeId === jobSeeker.id;

    if (jobSeeker.hasResume && jobSeeker.resumeFileObjectKey) {
      return (
        <Button
          variant="default"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
          onClick={() => viewResume(jobSeeker.id, jobSeeker.resumeFileObjectKey, jobSeeker.resumeFileName)}
          disabled={isLoadingThisResume}
          startIcon={isLoadingThisResume ? null : <FileIcon  />}
        >
          {isLoadingThisResume ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              Opening...
            </>
          ) : (
            'Resume'
          )}
        </Button>
      );
    }
    
    if (jobSeeker.resumeId && jobSeeker.resumeFileObjectKey) {
      return (
        <Button
          variant="default"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
          onClick={() => viewResume(jobSeeker.id, jobSeeker.resumeFileObjectKey, jobSeeker.resumeFileName)}
          disabled={isLoadingThisResume}
          startIcon={isLoadingThisResume ? null : <FileIcon  />}
        >
          {isLoadingThisResume ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              Opening...
            </>
          ) : (
            'Resume'
          )}
        </Button>
      );
    }

    if (jobSeeker.documents && jobSeeker.documents.length > 0) {
      const resumeDoc = jobSeeker.documents.find((doc: any) => 
        doc.type?.toLowerCase().includes('resume') || 
        doc.fileName?.toLowerCase().includes('resume')
      ) || jobSeeker.documents[0];
      
      if (resumeDoc && resumeDoc.objectKey) {
        return (
          <Button
            variant="default"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
            onClick={() => viewResume(jobSeeker.id, resumeDoc.objectKey, resumeDoc.fileName)}
            disabled={isLoadingThisResume}
            startIcon={isLoadingThisResume ? null : <FileIcon />}
          >
            {isLoadingThisResume ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Opening...
              </>
            ) : (
              'Resume'
            )}
          </Button>
        );
      }
    }

    return (
      <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs">
        <FileIcon className="opacity-50" />
        <span>No resume</span>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeading columns={tableColumns} />
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={9}>
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : !data?.data?.length ? (
            <TableRow>
              <TableCell className="text-center py-12 px-6" colSpan={9}>
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <FileIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No job seekers found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((jobSeeker: any) => (
              <TableRow 
                key={jobSeeker.id} 
                data-item-id={jobSeeker.id}
                data-jobseeker-id={jobSeeker.id}
                className="border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={jobSeeker.profilePicture?.url}
                      alt={jobSeeker.name}
                      name={jobSeeker.name}
                      size="medium"
                      className="flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {jobSeeker.name}
                      </p>
                      {jobSeeker.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {jobSeeker.email}
                        </p>
                      )}
                      <Link 
                        href={`/admin/applications?name=${encodeURIComponent(jobSeeker.name.split(' ')[0])}`}
                        className="text-sm text-blue-500 dark:text-blue-500 hover:text-brand-500 dark:hover:text-brand-400 cursor-pointer transition-colors duration-200"
                      >
                        {jobSeeker.jobApplications} applications
                      </Link>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {jobSeeker.occupation || 'Not specified'}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <SpecialtyDisplay 
                    specialties={Array.isArray(jobSeeker.specialty) ? jobSeeker.specialty : (jobSeeker.specialty ? [jobSeeker.specialty] : [])} 
                    jobSeekerId={jobSeeker.id}
                    expandedRows={expandedRows}
                    onToggleExpanded={toggleExpanded}
                  />
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {jobSeeker.city && jobSeeker.state 
                      ? `${jobSeeker.city}, ${jobSeeker.state}`
                      : jobSeeker.city || jobSeeker.state || 'Not specified'
                    }
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6 text-left">
                  {renderResumeButton(jobSeeker)}
                </TableCell>
                <TableCell className="py-4 px-6 whitespace-nowrap">
                  {jobSeeker.dateJoined ? (() => {
                    const dateJoined = formatDateTimeEST(jobSeeker.dateJoined);
                    if (typeof dateJoined === 'string') {
                      return (
                        <p className="text-sm text-gray-900 dark:text-white">
                          {dateJoined}
                        </p>
                      );
                    }
                    return (
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>{dateJoined.date}</div>
                        <div className="flex items-center mt-1">
                          <TimeIcon className="mr-1" />
                          <span>{dateJoined.time}</span>
                        </div>
                      </div>
                    );
                  })() : (
                    <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6 whitespace-nowrap">
                  {jobSeeker.lastActivity ? (() => {
                    const lastActivity = formatDateTimeEST(jobSeeker.lastActivity);
                    if (typeof lastActivity === 'string') {
                      return (
                        <p className="text-sm text-gray-900 dark:text-white">
                          {lastActivity}
                        </p>
                      );
                    }
                    return (
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>{lastActivity.date}</div>
                        <div className="flex items-center mt-1">
                          <TimeIcon className="mr-1" />
                          <span>{lastActivity.time}</span>
                        </div>
                      </div>
                    );
                  })() : (
                    <span className="text-gray-400 dark:text-gray-500 italic">No activity</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Badge variant={getStatusVariant(jobSeeker.status)}>
                    {jobSeeker.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <div className="flex items-center gap-4">
                    <PermissionWrapper module="jobseekers" action="view">
                      <button 
                        className="flex gap-2 text-brand-400"
                        onClick={() => onViewJobSeeker(jobSeeker.id)}
                      >
                        <EyeIcon />  View
                      </button>
                    </PermissionWrapper>
                    <PermissionWrapper module="jobseekers" action="edit">
                      <button 
                        className="flex gap-2 text-brand-400"
                        onClick={() => openEditModal(jobSeeker.id)}
                      >
                        <PencilIcon /> Edit
                      </button>
                    </PermissionWrapper>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedJobSeekerId && (
        <EditJobSeekerModal
          isOpen={editModalOpen}
          onClose={closeEditModal}
          jobSeekerId={selectedJobSeekerId}
          onUpdate={() => refreshData(true)}
        />
      )}
    </div>
  );
};

export default JobSeekersTable;
