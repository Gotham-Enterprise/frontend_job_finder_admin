import React from 'react';
import { formatDateTimeEST } from '@/services/utils/dateUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../../ui/table';
import Badge from '../../../ui/badge/Badge';
import Button from '../../../ui/button/Button';
import TableHeading from '../../../tables/tableHeader';
import { EyeIcon, TimeIcon } from '@/icons';
import { JobApplicationsTableProps } from '@/services/types/JobApplicationsTypes';
import Avatar from '../../../ui/avatar/Avatar';

const JobApplicationsTable: React.FC<JobApplicationsTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  onViewJobApplication,
  onViewResume,
  isViewingResume,
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
                <p className="text-gray-500 dark:text-gray-400">No job applications found</p>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((jobApplication: any) => (
              <TableRow key={jobApplication.id} className="border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={jobApplication.avatarUrl}
                      alt={jobApplication.name}
                      name={jobApplication.name}
                      size="medium"
                      className="flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {jobApplication.name}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                    {jobApplication.occupation || 'Not specified'}
                  </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {jobApplication.companyName}
                  </p>
               
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {jobApplication.jobLocationCity && jobApplication.jobLocationState 
                      ? `${jobApplication.jobLocationCity}, ${jobApplication.jobLocationState}`
                      : jobApplication.jobLocationState || 'Not specified'
                    }
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6 text-left">
                  {jobApplication.hasResume && jobApplication.resumeObjectKey ? (
                    <Button
                      variant="text-primary"
                      size="sm"
                      className="text-brand-400"
                      onClick={() => onViewResume(jobApplication.resumeObjectKey)}
                      disabled={isViewingResume}
                    >
                      {isViewingResume ? 'Opening...' : 'View resume'}
                    </Button>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">No resume</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6 whitespace-nowrap">
                  {jobApplication.applicationDate ? (() => {
                    const applicationDate = formatDateTimeEST(jobApplication.applicationDate);
                    if (typeof applicationDate === 'string') {
                      return (
                        <p className="text-sm text-gray-900 dark:text-white">
                          {applicationDate}
                        </p>
                      );
                    }
                    return (
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>{applicationDate.date}</div>
                        <div className="flex items-center mt-1">
                        <TimeIcon className="mr-1" />
                          <span>{applicationDate.time}</span>
                        </div>
                      </div>
                    );
                  })() : (
                    <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Badge variant={getStatusVariant(jobApplication.status)}>
                    {jobApplication.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-brand-400"
                      onClick={() => onViewJobApplication(jobApplication.id)}
                      startIcon={<EyeIcon />}
                    >
                      View
                    </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobApplicationsTable;
