"use client";
import React, { useState, useEffect } from 'react';
import Button from '../../../ui/button/Button';
import { useToast } from '@/context/ToastContext';
import { adminUserManagementApi, DeactivatedJobSeeker } from '@/services/api/adminUserManagement';
import { formatDateTimeEST } from '@/services/utils/dateUtils';
import { ReactivateUserModal } from './ReactivateUserModal';
import { DeactivationHistoryModal } from './DeactivationHistoryModal';
import Avatar from '../../../ui/avatar/Avatar';
import Badge from '../../../ui/badge/Badge';
import { Table, TableBody, TableCell, TableRow } from '../../../ui/table';
import TableHeading from '../../../tables/tableHeader';
import { EyeIcon, TimeIcon, DocsIcon } from '@/icons';

interface DeactivatedJobSeekersProps {
  className?: string;
}

interface DeactivatedJobSeekersFilters {
  page: number;
  limit: number;
  name: string;
  email: string;
  deactivatedBy: string;
  startDate: string;
  endDate: string;
  location: string;
  occupation: string;
}

export const DeactivatedJobSeekers: React.FC<DeactivatedJobSeekersProps> = ({ 
  className = "" 
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reactivateModal, setReactivateModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
  });
  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
  });
  
  const [filters, setFilters] = useState<DeactivatedJobSeekersFilters>({
    page: 1,
    limit: 20,
    name: '',
    email: '',
    deactivatedBy: '',
    startDate: '',
    endDate: '',
    location: '',
    occupation: '',
  });

  const { addToast } = useToast();

  const tableColumns = [
    { key: 'user', label: 'User', className: 'text-left' },
    { key: 'occupation', label: 'Occupation', className: 'text-left' },
    { key: 'location', label: 'Location', className: 'text-left' },
    { key: 'deactivationReason', label: 'Deactivation Reason', className: 'text-left' },
    { key: 'deactivatedBy', label: 'Deactivated By', className: 'text-left' },
    { key: 'deactivatedAt', label: 'Date Deactivated', className: 'text-left' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDeactivatedJobSeekers();
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const fetchDeactivatedJobSeekers = async () => {
    setIsLoading(true);
    
    try {
      const response = await adminUserManagementApi.getDeactivatedJobSeekers(filters);
      setData(response);
    } catch (error: any) {
      console.error('Error fetching deactivated job seekers:', error);
      addToast({
        variant: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch deactivated job seekers',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openReactivateModal = (userId: string, userName: string) => {
    setReactivateModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const closeReactivateModal = () => {
    setReactivateModal({
      isOpen: false,
      userId: '',
      userName: '',
    });
  };

  const openHistoryModal = (userId: string, userName: string) => {
    setHistoryModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const closeHistoryModal = () => {
    setHistoryModal({
      isOpen: false,
      userId: '',
      userName: '',
    });
  };

  const handleReactivateSuccess = () => {
    fetchDeactivatedJobSeekers();
    closeReactivateModal();
  };

  const formatDate = (dateString: string) => {
    try {
      const formatted = formatDateTimeEST(dateString);
      if (typeof formatted === 'string') {
        return formatted;
      }
      return (
        <div className="text-sm text-gray-900 dark:text-white">
          <div>{formatted.date}</div>
          <div className="flex items-center mt-1">
            <TimeIcon className="mr-1" />
            <span>{formatted.time}</span>
          </div>
        </div>
      );
    } catch {
      return (
        <span className="text-gray-400 dark:text-gray-500 italic">
          {new Date(dateString).toLocaleDateString()}
        </span>
      );
    }
  };

  const getOccupationString = (jobSeeker: DeactivatedJobSeeker) => {
    if (jobSeeker.user.candidateProfile?.occupation?.name) {
      return jobSeeker.user.candidateProfile.occupation.name;
    }
    return 'Not specified';
  };

  const getLocationString = (jobSeeker: DeactivatedJobSeeker) => {
    if (jobSeeker.user.profile) {
      const { city, state, country } = jobSeeker.user.profile;
      const locationParts = [city, state, country].filter(Boolean);
      return locationParts.length > 0 ? locationParts.join(', ') : 'Not specified';
    }
    return 'Not specified';
  };

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Deactivated Job Seekers
            </h3>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              {data?.pagination?.total || 0} deactivated job seekers
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchDeactivatedJobSeekers}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                  Loading...
                </div>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Search by email..."
                value={filters.email}
                onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Search by location..."
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search by occupation..."
                value={filters.occupation}
                onChange={(e) => setFilters(prev => ({ ...prev, occupation: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div>
              <input
                type="date"
                placeholder="Start date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div>
              <input
                type="date"
                placeholder="End date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Clear filters button */}
          {(filters.name || filters.email || filters.location || filters.occupation || filters.startDate || filters.endDate) && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  page: 1,
                  limit: 20,
                  name: '',
                  email: '',
                  deactivatedBy: '',
                  startDate: '',
                  endDate: '',
                  location: '',
                  occupation: '',
                })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeading columns={tableColumns} />
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell className="text-center py-8 px-6" colSpan={7}>
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : !data?.data?.length ? (
              <TableRow>
                <TableCell className="text-center py-12 px-6" colSpan={7}>
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <EyeIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No deactivated job seekers found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        All job seekers are currently active
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((jobSeeker: DeactivatedJobSeeker) => (
                <TableRow 
                  key={jobSeeker.id}
                  className="border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={jobSeeker.user.profile?.avatarUrl}
                        alt={jobSeeker.user.fullName}
                        name={jobSeeker.user.fullName}
                        size="medium"
                        className="flex-shrink-0"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {jobSeeker.user.fullName || `${jobSeeker.user.firstName} ${jobSeeker.user.lastName}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {jobSeeker.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {getOccupationString(jobSeeker)}
                    </p>
                  </TableCell>
                  
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {getLocationString(jobSeeker)}
                    </p>
                  </TableCell>
                  
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={jobSeeker.deactivation.reason}>
                      {jobSeeker.deactivation.reason}
                    </p>
                  </TableCell>
                  
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {jobSeeker.deactivation.deactivatedBy
                        ? `${jobSeeker.deactivation.deactivatedBy.firstName} ${jobSeeker.deactivation.deactivatedBy.lastName}`
                        : jobSeeker.deactivation.isDeactivatedBySystem
                        ? 'System'
                        : 'Unknown'
                      }
                    </p>
                  </TableCell>
                  
                  <TableCell className="py-4 px-6 whitespace-nowrap">
                    {formatDate(jobSeeker.deactivation.deactivatedAt)}
                  </TableCell>
                  
                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="text-primary"
                        size="sm"
                        onClick={() => openHistoryModal(jobSeeker.user.id, jobSeeker.user.fullName || `${jobSeeker.user.firstName} ${jobSeeker.user.lastName}`)}
                        startIcon={<DocsIcon />}
                      >
                        History
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => openReactivateModal(jobSeeker.user.id, jobSeeker.user.fullName || `${jobSeeker.user.firstName} ${jobSeeker.user.lastName}`)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Reactivate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.total_pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((data.pagination.current_page - 1) * data.pagination.per_page) + 1} to{' '}
              {Math.min(data.pagination.current_page * data.pagination.per_page, data.pagination.total)} of{' '}
              {data.pagination.total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!data.pagination.has_previous_page}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                Page {data.pagination.current_page} of {data.pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!data.pagination.has_next_page}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Modal */}
      <ReactivateUserModal
        isOpen={reactivateModal.isOpen}
        onClose={closeReactivateModal}
        userId={reactivateModal.userId}
        userName={reactivateModal.userName}
        onSuccess={handleReactivateSuccess}
      />

      {/* History Modal */}
      <DeactivationHistoryModal
        isOpen={historyModal.isOpen}
        onClose={closeHistoryModal}
        userId={historyModal.userId}
        userName={historyModal.userName}
      />
    </div>
  );
};
