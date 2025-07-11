import React from 'react';
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
import { EyeIcon, PencilIcon, TimeIcon } from '@/icons';
import { JobsAdminTableProps } from '@/services/types/JobsAdminTypes';

const JobsAdminTable: React.FC<JobsAdminTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  getJobStatusVariant,
  onViewJobDetails,
  onEditJobPost,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeading columns={tableColumns} />
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={8}>
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : !data?.data?.length ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={8}>
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
                  <Badge variant={getJobStatusVariant(job.jobStatus)}>
                    {job.jobStatus}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-brand-400"
                      onClick={() => onViewJobDetails(job.id)}
                      startIcon={<EyeIcon />}
                    >
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => onEditJobPost(job.id)}
                      startIcon={<PencilIcon />}
                    >
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobsAdminTable;
