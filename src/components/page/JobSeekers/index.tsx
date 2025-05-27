"use client";
import React, { useState, useEffect, useMemo, useTransition } from 'react';
import Image from 'next/image';
import { useJobSeekers, useViewResume } from '@/services/hooks/useJobSeekers';
import { useOccupations } from '@/services/hooks/useOccupations';
import { useStates } from '@/services/hooks/useStates';
import { JobSeekerFilters } from '@/services/types/jobSeeker';
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
import FullScreenSpinner from '../../ui/FullScreenSpinner';

interface JobSeekersProps {
  className?: string;
}

const JobSeekers: React.FC<JobSeekersProps> = ({ className = "" }) => {
  const [filters, setFilters] = useState<JobSeekerFilters>({
    page: 1,
    limit: 10,
    search: '',
    location: '',
    occupationId: undefined,
    status: undefined,  });const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();  const { data, isLoading, error, refetch } = useJobSeekers(filters);
  const { data: occupationsData, isLoading: isOccupationsLoading } = useOccupations();
  const { data: statesData, isLoading: isStatesLoading } = useStates();
  const { mutate: viewResume, isPending: isViewingResume } = useViewResume();
  
  const tableColumns = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'specialties', label: 'Occupation' },
    { key: 'state', label: 'State' },
    { key: 'resume', label: 'Resume' },
    { key: 'dateJoined', label: 'Date Joined' },
    { key: 'lastActivity', label: 'Last Activity' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '', className: 'text-right' },
  ], []);

  const statusOptions = useMemo(() => [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ], []);  const occupationOptions = useMemo(() => {
    const baseOptions = [{ value: '', label: 'All Occupations' }];
    
    if (occupationsData?.success && occupationsData.data) {
      const dynamicOptions = occupationsData.data.map(occupation => ({
        value: occupation.id.toString(),
        label: occupation.name
      }));
      return [...baseOptions, ...dynamicOptions];
    }
    
    return baseOptions;
  }, [occupationsData]);

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
  ], []);  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const filterChange = useMemo(() => (key: keyof JobSeekerFilters, value: any) => {
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
    switch (status) {
      case 'active': return 'solid';
      case 'inactive': return 'light';
      case 'suspended': return 'solid';
      default: return 'light';
    }  }, []);
  const initViewResume = async (resumeId: string | null) => {
    if (!resumeId) {
      console.error('No resume ID provided');
      return;
    }
    
    viewResume(resumeId);
  };


  if (error && !isPending) {
    return (
      <ErrorState 
        className={className}
        message={`Error loading job seekers: ${error.message}`}
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
              Job Seekers
            </h3>            <p className="text-sm text-gray-500 text-gray-400 mt-1 dark:text-white">
              {data?.data.totalCount || 0} total job seekers
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
            </Button>            <Button
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
              placeholder="Search job seekers by name..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">              
                <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Occupation
                </Label>
                <Select
                  defaultValue={filters.occupationId?.toString() || ''}
                  onChange={(value: string) => filterChange('occupationId', value === '' ? undefined : parseInt(value))}
                  options={occupationOptions}
                />
              </div>
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
        )}      </div>
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
            ) : !data?.data.items?.length ? (              <TableRow>
                <TableCell className="text-center py-8 px-6" colSpan={8}>
                  <p className="text-gray-500 dark:text-gray-400">No job seekers found</p>
                </TableCell>
              </TableRow>
            ) : (
              data.data.items.map((jobSeeker) => (
                <TableRow key={jobSeeker.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {jobSeeker.profilePicture?.url ? (
                          <Image
                            src={jobSeeker.profilePicture.url}
                            alt={jobSeeker.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {jobSeeker.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                          </div>
                        )}
                      </div>
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
                      {jobSeeker.occupation}
                    </p>
                  </TableCell>
                    <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {jobSeeker.state || jobSeeker.city || 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {jobSeeker.hasResume === false ? (
                      <Badge variant="light" color="error">
                        No resume uploaded
                      </Badge>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="group relative bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 
                                 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20
                                 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 
                                 font-medium transition-all duration-200 shadow-sm hover:shadow-md
                                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white 
                                 dark:disabled:hover:bg-gray-800 px-3 w-full" 
                        onClick={() => initViewResume(jobSeeker.resumeId)}                        
                        disabled={isViewingResume}
                      >
                        <span className="text-sm">
                          {isViewingResume ? 'Opening...' : 'View Resume'}
                        </span>
                      </Button>
                    )}
                  </TableCell>                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(jobSeeker.dateJoined)}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(jobSeeker.lastActivity) || (
                        <span className="text-gray-400 dark:text-gray-500 italic">No activity</span>
                      )}
                    </p>
                  </TableCell>
                    <TableCell className="py-4 px-6">
                    <Badge variant={getStatusVariant(jobSeeker.status)}>
                      {jobSeeker.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-brand-400"
                        onClick={() => console.log('View profile', jobSeeker.id)}
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

     
      {data && data.data.items && data.data.items.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((data.data.pagination.currentPage - 1) * (filters.limit || 10)) + 1} to{' '}
              {Math.min(data.data.pagination.currentPage * (filters.limit || 10), data.data.totalCount)} of{' '}
              {data.data.totalCount} results
            </div>
            <Pagination
              currentPage={data.data.pagination.currentPage}
              totalPages={data.data.pagination.totalPages}
              onPageChange={initPageChange}
            />          </div>
        </div>
      )}
      
     
      <FullScreenSpinner 
        isVisible={isViewingResume} 
        message="Opening resume..." 
      />
    </div>
  );
};

export default JobSeekers;