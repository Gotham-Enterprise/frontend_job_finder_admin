import React from 'react';
import { formatDate } from '@/services/utils/dateUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../../ui/table';
import Badge from '../../../ui/badge/Badge';
import Button from '../../../ui/button/Button';
import TableHeading from '../../../tables/tableHeader';
import { EyeIcon } from '@/icons';
import { EmployerTableProps } from '@/services/types/EmployerTypes';

const EmployerTable: React.FC<EmployerTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  onViewEmployer,
  onViewSubscription,
}) => {
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
          ) : !data?.success || !data?.data?.length ? (
            <TableRow>
              <TableCell className="text-center py-8 px-6" colSpan={9}>
                <p className="text-gray-500 dark:text-gray-400">No employers found</p>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((employer: any) => (
              <TableRow key={employer.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                        {employer.companyName.split(' ').map((n: string) => n.charAt(0)).join('').substring(0, 2)}
                      </div>
                    </div>
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
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(employer.lastActivity) || (
                      <span className="text-gray-400 dark:text-gray-500 italic">No activity</span>
                    )}
                  </p>
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
                    View subscription
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
