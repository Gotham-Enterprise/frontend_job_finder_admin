"use client";
import React, { useState } from 'react';
import { formatDate, formatDateTimeEST } from '@/services/utils/dateUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../../ui/table';
import Badge from '../../../ui/badge/Badge';
import Button from '../../../ui/button/Button';
import TableHeading from '../../../tables/tableHeader';
import { EyeIcon, PencilIcon, TimeIcon, TrashBinIcon } from '@/icons';
import { JobsAdminTableProps } from '@/services/types/JobsAdminTypes';
import PermissionWrapper from '@/components/common/PermissionWrapper';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { showToast } from '@/services/utils/toast';

const JobsAdminTable: React.FC<JobsAdminTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  getJobStatusVariant,
  onViewJobDetails,
  onEditJobPost,
  onDeleteJobPost,
  onConfirmDelete,
  onCancelDelete,
  isDeleteDialogOpen,
  isDeletingJob,
}) => {
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

  const handleCopyJobId = (jobId: string) => {
    navigator.clipboard.writeText(jobId);
    setCopiedJobId(jobId);
    showToast.success('Copied', 'Job ID copied to clipboard');
    setTimeout(() => setCopiedJobId(null), 2000);
  };
  return (
    <>
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
              <TableCell className="text-center py-8 px-6" colSpan={9}>
                <p className="text-gray-500 dark:text-gray-400">No jobs found</p>
              </TableCell>
            </TableRow>          
            ) : (
            data.data.map((job: any) => (
              <TableRow 
                key={job.id} 
                data-item-id={job.id}
                data-job-id={job.id}
                className="border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <TableCell className="py-4 px-6">
                  <button
                    title="Click to copy Job ID"
                    onClick={() => handleCopyJobId(job.id)}
                    className="flex items-center gap-1.5 cursor-pointer group"
                  >
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400 group-hover:text-brand-500 transition-colors">
                      {job.id.slice(0, 8)}...
                    </span>
                    {copiedJobId === job.id ? (
                      <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex flex-col gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {job.title}
                    </p>
                    {job.specialty && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Specialty:</span>
                        <Badge 
                          variant="light" 
                          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700"
                        >
                          {job.specialty}
                        </Badge>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {job.companyName}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {job.occupation || 'Not specified'}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {job.location}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {job.locationState}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 whitespace-nowrap">
                  {job.datePosted ? (() => {
                    const datePosted = formatDateTimeEST(job.datePosted);
                    if (typeof datePosted === 'string') {
                      return (
                        <p className="text-sm text-gray-900 dark:text-white">
                          {datePosted}
                        </p>
                      );
                    }
                    return (
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>{datePosted.date}</div>
                        <div className="flex items-center mt-1">
                          <TimeIcon className="mr-1" />
                          <span>{datePosted.time}</span>
                        </div>
                      </div>
                    );
                  })() : (
                    <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Badge variant={getStatusVariant(job.status)}>
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Badge 
                    variant={getJobStatusVariant(job.jobStatus)}
                    color={job.jobStatus === 'Deleted' ? 'error' : undefined}
                  >
                    {job.jobStatus}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <PermissionWrapper module="jobs" action="view">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-brand-400"
                        onClick={() => onViewJobDetails(job.id)}
                        startIcon={<EyeIcon />}
                      >
                        View
                      </Button>
                    </PermissionWrapper>
                    <PermissionWrapper module="jobs" action="edit">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 hover:text-blue-700"
                        onClick={() => onEditJobPost(job.id)}
                        startIcon={<PencilIcon />}
                      >
                        Edit
                      </Button>
                    </PermissionWrapper>
                    {!job.isDeleted && (
                      <PermissionWrapper module="jobs" action="edit">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 hover:text-red-700"
                          onClick={() => onDeleteJobPost(job.id)}
                          disabled={isDeletingJob}
                          startIcon={<TrashBinIcon />}
                        >
                          Delete
                        </Button>
                      </PermissionWrapper>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={onCancelDelete}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
        title="Delete Job Post"
        message="Are you sure you want to delete this job post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeletingJob}
      />
    </>
  );
};

export default JobsAdminTable;
