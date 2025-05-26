"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useJobSeekers } from '@/services/hooks/useJobSeekers';
import { JobSeekerFilters } from '@/services/types/jobSeeker';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../ui/table';
import Badge from '../ui/badge/Badge';
import Button from '../ui/button/Button';
import Input from '../ui/input/Input';
import Select from '../form/Select';
import Label from '../form/Label';
import Pagination from '../tables/Pagination';
import TableHeading from '../tables/tableHeader';
import { PencilIcon, BoltIcon, MoreDotIcon, FunnelIcon, EyeIcon } from '@/icons';
import { SearchIcon } from '../ui/icons';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';

interface JobSeekersProps {
  className?: string;
}

const JobSeekers: React.FC<JobSeekersProps> = ({ className = "" }) => {

  const [filters, setFilters] = useState<JobSeekerFilters>({
    page: 1,
    limit: 10,
    search: '',
    location: '',
    specialty: '',
    status: undefined,
  });

  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data, isLoading, error, refetch } = useJobSeekers(filters);
  const tableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'specialties', label: 'Specialties' },
    { key: 'state', label: 'State' },
    { key: 'resume', label: 'Resume' },
    { key: 'dateJoined', label: 'Date Joined' },
    { key: 'lastActivity', label: 'Last Activity' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];


  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
  ];

  const specialtyOptions = [
    { value: '', label: 'All Specialties' },
    { value: 'Internal Medicine', label: 'Internal Medicine' },
    { value: 'Emergency Medicine', label: 'Emergency Medicine' },
    { value: 'Family Medicine', label: 'Family Medicine' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Surgery', label: 'Surgery' },
    { value: 'Geriatrics', label: 'Geriatrics' },
    { value: 'Home Health Nursing', label: 'Home Health Nursing' },
  ];

  const itemsPerPageOptions = [
    { value: '5', label: '5 per page' },
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
  ];

  const filterChange = (key: keyof JobSeekerFilters, value: any) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value === '' ? undefined : value,
      page: 1
    }));
  };



  const initPageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };


  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const getStatusVariant = (status: string): 'light' | 'solid' => {
    switch (status) {
      case 'active': return 'solid';
      case 'inactive': return 'light';
      case 'suspended': return 'solid';
      default: return 'light';
    }
  };
  if (isLoading) {
    return (
      <LoadingState 
        className={className}
        message="Loading job seekers..."
      />
    );
  }

  if (error) {
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
            </h3>
            <p className="text-sm text-gray-500 text-gray-400 mt-1 dark:text-white">
              {data?.data.totalCount || 0} total job seekers
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
              startIcon={<BoltIcon />}
              disabled={isLoading}
            >
              Export
            </Button>
          </div>
        </div>        
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-400 dark:text-white" />
            </div>
            <Input
              type="text"
              placeholder="Search job seekers by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>
        {isFilterOpen && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </Label>
                <Input
                  type="text"
                  placeholder="Filter by location..."
                  value={filters.location || ''}
                  onChange={(e) => filterChange('location', e.target.value)}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specialty
                </Label>
                <Select
                  defaultValue={filters.specialty || ''}
                  onChange={(value: string) => filterChange('specialty', value)}
                  options={specialtyOptions}
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
      </div>      <div className="overflow-x-auto">
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
            ) : !data?.data.items?.length ? (
              <TableRow>
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
                      {jobSeeker.specialty}
                    </p>
                  </TableCell>
                  
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {jobSeeker.state || jobSeeker.city || 'N/A'}
                    </p>
                  </TableCell>
                  
                  <TableCell className="py-4 px-6">
                    <Button variant="outline" size="sm">
                      View Resume
                    </Button>
                  </TableCell>
                  
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(jobSeeker.dateJoined)}
                    </p>
                  </TableCell>
                  
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(jobSeeker.lastActivity)}
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
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSeekers;