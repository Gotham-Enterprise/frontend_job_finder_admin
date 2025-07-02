import React from 'react';
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
import { EyeIcon, TimeIcon } from '@/icons';
import { JobSeekersTableProps } from '@/services/types/JobSeekersTypes';
import Avatar from '../../../ui/avatar/Avatar';

const JobSeekersTable: React.FC<JobSeekersTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  onViewJobSeeker,
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
                <p className="text-gray-500 dark:text-gray-400">No job seekers found</p>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((jobSeeker: any) => (
              <TableRow key={jobSeeker.id} className="border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {jobSeeker.jobApplications} applications
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {jobSeeker.occupation || jobSeeker.specialty || 'Not specified'}
                  </p>
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
                  {jobSeeker.hasResume && jobSeeker.resumeId ? (
                    <Button
                      variant="text-primary"
                      size="sm"
                      className="text-brand-400"
                      onClick={() => onViewResume(jobSeeker.resumeId)}
                      disabled={isViewingResume}
                    
                    >
                      {isViewingResume ? 'Opening...' : 'View resume'}
                    </Button>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">No resume</span>
                  )}
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-brand-400"
                      onClick={() => onViewJobSeeker(jobSeeker.id)}
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

export default JobSeekersTable;
