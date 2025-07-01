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
import Checkbox from '../../../form/input/Checkbox';
import { EyeIcon, TimeIcon } from '@/icons';
import { EmployerTableProps } from '@/services/types/EmployerTypes';
import Avatar from '../../../ui/avatar/Avatar';

const EmployerTable: React.FC<EmployerTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  onViewEmployer,
  onViewSubscription,
  selectedEmployerId,
  onEmployerSelect,
}) => {  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeading columns={tableColumns} />
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={10}>
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : !data?.success || !data?.data?.length ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={10}>
                <p className="text-gray-500 dark:text-gray-400">No employers found</p>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((employer: any) => (
              <TableRow key={employer.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="py-4 px-6 text-center">
                  <Checkbox
                    checked={selectedEmployerId === employer.id}
                    onChange={(checked) => onEmployerSelect(employer.id, checked)}
                  />
                </TableCell>
                <TableCell className="py-4 px-6 text-sm">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={employer.companyName}
                      size="medium"
                      className="flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {employer.companyName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {employer.jobPostCount} job posts
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {employer.email}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {employer.state || 'Not specified'}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {employer.jobPostCount}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(employer.dateJoined)}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6">
                  {employer.lastActivity ? (() => {
                    const lastActivity = formatDateTimeEST(employer.lastActivity);
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
                  <Badge variant={getStatusVariant(employer.status)}>
                    {employer.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="whitespace-nowrap text-brand-400"
                    startIcon={<EyeIcon />}
                    onClick={() => onViewSubscription(employer.id)}
                  >
                    {employer.currentPlan}
                  </Button>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-brand-400"
                      onClick={() => onViewEmployer(employer.id)}
                      startIcon={<EyeIcon />}
                    >
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

export default EmployerTable;
