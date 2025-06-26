import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../../../ui/table';
import Button from '../../../../ui/button/Button';
import TableHeading from '../../../../tables/tableHeader';
import { EyeIcon } from '@/icons';
import { ApplicantsTableProps } from '@/services/types/applicant';
import Avatar from '../../../../ui/avatar/Avatar';

const ApplicantsTable: React.FC<ApplicantsTableProps> = ({
  applicants,
  isLoading,
  tableColumns,
  getStatusVariant,
  onViewApplicant,
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
              <TableCell className="text-center py-8 px-6" colSpan={3}>
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading applicants...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : !applicants?.length ? (            
          <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={3}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No applicants yet</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Applications will appear here once candidates apply</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            applicants.map((applicant) => (
              <TableRow key={applicant.id} className="border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={applicant.profilePicture?.url}
                      alt={applicant.name}
                      name={applicant.name}
                      size="medium"
                      className="flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {applicant.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {applicant.email}
                      </p>
                    </div>
                  </div>                
                  </TableCell>

                <TableCell className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusVariant(applicant.status)}`}>
                    {applicant.status}
                  </span>                
                  </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Button
                    variant="ghost"
                    size="sm"
                    className="whitespace-nowrap text-brand-400"
                      onClick={() => onViewApplicant(applicant.id)}
                    >
                      <EyeIcon />
                      View
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

export default ApplicantsTable;
