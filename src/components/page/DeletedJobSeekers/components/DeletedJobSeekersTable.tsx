import React from 'react';
import { EyeIcon, ArrowUpIcon, CheckCircleIcon } from '@/icons';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../../ui/table';
import Button from '../../../ui/button/Button';
import LoadingSkeleton from '../../../ui/LoadingSkeleton';
import { DeletedJobSeekersTableProps } from '@/services/types/deletedJobSeekers';
import { DeletedJobSeekerAccount } from '@/services/api/deletedJobSeekers';

const DeletedJobSeekersTable: React.FC<DeletedJobSeekersTableProps> = ({
  data,
  isLoading,
  tableColumns,
  onViewDetails,
  onRestoreAccount,
  onRefresh,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (account: DeletedJobSeekerAccount) => {
    if (account.isRestored) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Restored
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        Deleted
      </span>
    );
  };

  const renderTableData = () => {
    if (!data?.data || data.data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={tableColumns.length} className="px-6 py-16 text-center">
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <EyeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">No deleted accounts found</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                No job seeker accounts have been permanently deleted yet.
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return data.data.map((account: DeletedJobSeekerAccount) => (
      <TableRow key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <TableCell className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {account.originalFirstName} {account.originalLastName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ID: {account.originalUserId}
            </span>
          </div>
        </TableCell>
        
        <TableCell className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-900 dark:text-white">
            {account.originalEmail}
          </span>
        </TableCell>
        
        <TableCell className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {account.maskedEmail}
          </span>
        </TableCell>
        
        <TableCell className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col">
            <span className="text-sm text-gray-900 dark:text-white">
              {account.deletedByAdmin.firstName} {account.deletedByAdmin.lastName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {account.deletedByAdmin.email}
            </span>
          </div>
        </TableCell>
        
        <TableCell className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(account.deletedAt)}
          </span>
        </TableCell>
        
        <TableCell className="px-6 py-4 whitespace-nowrap">
          {getStatusBadge(account)}
          {account.isRestored && account.restoredAt && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Restored: {formatDate(account.restoredAt)}
            </div>
          )}
        </TableCell>
        
        <TableCell className="px-6 py-4 whitespace-nowrap text-center">
          <span className="text-sm text-gray-900 dark:text-white">
            {account.totalApplicationsCount}
          </span>
        </TableCell>
        
        <TableCell className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(account.id)}
              className="flex items-center gap-1"
            >
              <EyeIcon className="w-4 h-4" />
              View
            </Button>
            
            {!account.isRestored && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestoreAccount(account)}
                className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-900/20"
              >
                <ArrowUpIcon className="w-4 h-4" />
                Restore
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  if (isLoading) {
    return (
      <div className="px-6 py-4">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {tableColumns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {renderTableData()}
        </TableBody>
      </Table>
    </div>
  );
};

export default DeletedJobSeekersTable;
