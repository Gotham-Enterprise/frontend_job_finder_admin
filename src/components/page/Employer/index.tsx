"use client";
import React, { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployers } from '@/services/hooks/useEmployers';
import { useEmployerStates } from '@/services/hooks/useEmployerStates';
import { EmployerFilters } from '@/services/types/employer';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Button from '../../ui/button/Button';
import Input from '../../ui/input/Input';
import Select from '../../form/Select';
import Label from '../../form/Label';
import Pagination from '../../tables/Pagination';
import TableHeading from '../../tables/tableHeader';
import { BoltIcon, DownloadIcon, FunnelIcon, EyeIcon } from '@/icons';
import { SearchIcon } from '../../ui/icons';
import ErrorState from '../../common/ErrorState';

interface EmployersProps {
  className?: string;
}

const Employers: React.FC<EmployersProps> = ({ className = "" }) => {
  const router = useRouter();
  const [filters, setFilters] = useState<EmployerFilters>({
    page: 1,
    limit: 10,
    name: '',
    location: '',
    status: undefined,
  });
  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { data, isLoading, error, refetch } = useEmployers(filters);
  const { data: statesData, isLoading: isStatesLoading } = useEmployerStates();

  const tableColumns = useMemo(() => [
    { key: 'companyName', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'state', label: 'States' },
    { key: 'jobPostCount', label: 'Job Posts' },
    { key: 'dateJoined', label: 'Date Joined' },
    { key: 'lastActivity', label: 'Last Activity' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '', className: 'text-right' },
  ], []);

  const statusOptions = useMemo(() => [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
  ], []);

  const stateOptions = useMemo(() => {
    const baseOptions = [{ value: '', label: 'All States' }];
    
    if (statesData?.success && statesData.data) {
      const dynamicOptions = statesData.data.map(state => ({
        value: state,
        label: state
      }));
      return [...baseOptions, ...dynamicOptions];
    }
    
    return baseOptions;
  }, [statesData]);

  const itemsPerPageOptions = useMemo(() => [
    { value: '5', label: '5 per page' },
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
  ], []);

  const filterChange = useMemo(() => (key: keyof EmployerFilters, value: any) => {
    startTransition(() => {
      setFilters(prev => ({ 
        ...prev, 
        [key]: value === '' ? undefined : value,
        page: 1
      }));
    });
  }, []);

  const initPageChange = useMemo(() => (newPage: number) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, page: newPage }));
    });
  }, []);

  const formatDate = useMemo(() => (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getStatusVariant = useMemo(() => (status: string): 'light' | 'solid' => {
    switch (status.toLowerCase()) {
      case 'active': return 'solid';
      case 'inactive': return 'light';
      case 'suspended': return 'solid';
      default: return 'light';
    }
  }, []);

  const viewEmployer = (employerId: string) => {
    router.push(`/admin/employer/details/${employerId}`);
  };

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setFilters(prev => ({ ...prev, name: searchInput, page: 1 }));
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  if (error && !isPending) {
    return (
      <ErrorState 
        className={className}
        message={`Error loading employers: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Employers
            </h3>
            <p className="text-sm text-gray-500 text-gray-400 mt-1 dark:text-white">
              {data?.metaData?.totalCount || 0} total employers
              {isPending && (
                <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">
                  Updating...
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="dark:text-white"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              startIcon={<FunnelIcon className="dark:text-white" />}
            >
              Filters
            </Button>
            <Button
              variant="text-primary"
              size="sm"
              onClick={() => refetch()}
              startIcon={<DownloadIcon />}
              disabled={isLoading}
            >
              Export
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4" />
            </div>
            <Input
              type="text"
              placeholder="Search employers..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`w-full pl-10 ${searchInput ? 'pr-10' : ''}`}
            />
            {searchInput && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

      
        {isFilterOpen && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State
                </Label>
                <Select
                  defaultValue={filters.location || ''}
                  onChange={(value: string) => filterChange('location', value)}
                  options={stateOptions}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </Label>
                <Select
                  defaultValue={filters.status || ''}
                  onChange={(value: string) => filterChange('status', value)}
                  options={statusOptions}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Items per page
                </Label>
                <Select
                  defaultValue={filters.limit?.toString() || '10'}
                  onChange={(value: string) => filterChange('limit', parseInt(value))}
                  options={itemsPerPageOptions}
                />
              </div>
            </div>
          </div>
        )}
      </div>

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
            ) : !data?.success || !data?.data?.length ? (
              <TableRow>
                <TableCell className="text-center py-8 px-6" colSpan={8}>
                  <p className="text-gray-500 dark:text-gray-400">No employers found</p>
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((employer) => (
                <TableRow key={employer.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                          {employer.companyName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
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
                      {employer.state || 'N/A'}
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

                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-brand-400"
                        onClick={() => viewEmployer(employer.id)}
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
      {data?.success && data?.data?.length > 0 && data?.metaData && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((data.metaData.page - 1) * (filters.limit || 10)) + 1} to{' '}
              {Math.min(data.metaData.page * (filters.limit || 10), data.metaData.totalCount)} of{' '}
              {data.metaData.totalCount} results
            </div>
            <Pagination
              currentPage={data.metaData.page}
              totalPages={data.metaData.totalPages}
              onPageChange={initPageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Employers;