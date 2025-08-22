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
import Checkbox from '../../../form/input/Checkbox';
import { EyeIcon, TimeIcon, PencilIcon } from '@/icons';
import { EmployerTableProps } from '@/services/types/EmployerTypes';
import Avatar from '../../../ui/avatar/Avatar';
import { EditEmployerModal } from './EditEmployerModal';

const EmployerTable: React.FC<EmployerTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  onViewEmployer,
  onViewSubscription,
  selectedEmployerId,
  onEmployerSelect,
  onRefresh,
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployerIdForEdit, setSelectedEmployerIdForEdit] = useState<string | null>(null);

  const openEditModal = (employerId: string) => {
    setSelectedEmployerIdForEdit(employerId);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedEmployerIdForEdit(null);
  };

  const refreshData = () => {
    if (onRefresh) {
      onRefresh();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };  return (
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
              <TableRow 
                key={employer.id} 
                data-item-id={employer.id}
                data-employer-id={employer.id}
                className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <TableCell className="py-4 px-6 text-center">
                  <Checkbox
                    checked={selectedEmployerId === employer.id}
                    onChange={(checked) => onEmployerSelect(employer.id, checked)}
                  />
                </TableCell>
                <TableCell className="py-4 px-6 text-sm max-w-xs">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={employer.companyName}
                      size="medium"
                      className="flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1 max-w-48">
                      <p className="font-medium text-gray-900 dark:text-white truncate" title={employer.companyName}>
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
                    {employer.city && employer.state 
                      ? `${employer.city}, ${employer.state}`
                      : employer.city || employer.state || 'Not specified'
                    }
                  </p>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {employer.jobPostCount}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 whitespace-nowrap">
                  {employer.dateJoined ? (() => {
                    const dateJoined = formatDateTimeEST(employer.dateJoined);
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
                  <span 
                    onClick={() => onViewSubscription(employer.id)}
                    className="cursor-pointer inline-block hover:opacity-80 transition-opacity"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onViewSubscription(employer.id);
                      }
                    }}
                  >
                    <Badge 
                      variant="light" 
                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700"
                    >
                      {employer.currentPlan}
                    </Badge>
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">

                  <div className="flex items-center gap-4">
                                      <button 
                                     
                                        className="flex gap-2 text-brand-400"
                                        onClick={() => onViewEmployer(employer.id)}
                                      
                                      >
                                       <EyeIcon />  View
                                      </button>
                                     
                                      {/* <button 
                                         className="flex gap-2 text-brand-400"
                                       onClick={() => openEditModal(employer.id)}
                                     
                                      >
                                        <PencilIcon /> Edit
                                      </button> */}
                                    </div>
             
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedEmployerIdForEdit && (
        <EditEmployerModal
          isOpen={editModalOpen}
          onClose={closeEditModal}
          employerId={selectedEmployerIdForEdit}
          onUpdate={refreshData}
        />
      )}
    </div>
  );
};

export default EmployerTable;
