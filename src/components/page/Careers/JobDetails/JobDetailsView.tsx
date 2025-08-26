'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCareerDetails } from '@/services/hooks/useCareers';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';

const JobDetailsView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch job details with applicants
  const { data: careerData, isLoading: careerLoading } = useCareerDetails(jobId || '', 1, 100, searchTerm);

  // Extract job and applicants data from career response
  const jobData = careerData?.data;
  
  // Memoize applicants data to prevent unnecessary re-renders
  const applicantsData = useMemo(() => {
    return (careerData?.data as any)?.applicants || { items: [], totalCount: 0 };
  }, [careerData]);

  // Count applicants by status
  const statusCounts = useMemo(() => {
    if (!applicantsData?.items) {
      return { all: 0, pending: 0, qualified: 0, notQualified: 0 };
    }
    
    const applicants = applicantsData.items;
    return {
      all: applicants.length,
      pending: applicants.filter((a: any) => a.status.toLowerCase() === 'pending').length,
      qualified: applicants.filter((a: any) => a.status.toLowerCase() === 'qualified').length,
      notQualified: applicants.filter((a: any) => a.status.toLowerCase() === 'not qualified').length,
    };
  }, [applicantsData]);

  const totalApplicants = applicantsData?.totalCount || 0;

  // Filter applicants based on current filter
  const filteredApplicants = useMemo(() => {
    if (!applicantsData?.items) return [];
    
    const applicants = applicantsData.items;
    
    const filtered = applicants.filter((applicant: any) => {
      // Apply status filter
      if (activeTab !== 'All') {
        const statusMap = {
          'Pending': 'pending',
          'Qualified': 'qualified',
          'Not Qualified': 'not qualified'
        };
        const targetStatus = statusMap[activeTab as keyof typeof statusMap];
        if (applicant.status.toLowerCase() !== targetStatus) {
          return false;
        }
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          applicant.applicant.fullName?.toLowerCase().includes(searchLower) ||
          applicant.applicant.email?.toLowerCase().includes(searchLower) ||
          applicant.applicant.phone?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
    
    return filtered;
  }, [applicantsData, activeTab, searchTerm]);

  const getStatusBadgeProps = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { color: 'warning' as const, variant: 'light' as const };
      case 'qualified':
        return { color: 'success' as const, variant: 'light' as const };
      case 'not qualified':
        return { color: 'error' as const, variant: 'light' as const };
      default:
        return { color: 'primary' as const, variant: 'light' as const };
    }
  };

  if (!jobId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Job ID Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please provide a valid job ID to view details.
          </p>
          <Button 
            className="mt-4" 
            onClick={() => router.push('/admin/careers')}
          >
            Back to Careers
          </Button>
        </div>
      </div>
    );
  }

  if (careerLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/careers')}
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Jobs
          </Button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {totalApplicants} Applicants
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">Edit Job Post</Button>
          <Button variant="outline">Duplicate Job Post</Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:border-red-300">
            Close Job Post
          </Button>
        </div>
      </div>

      {/* Job Information */}
      {jobData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {jobData.title || 'Job Title'}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {jobData.location}
            </div>
            <div>{jobData.jobType}</div>
            {jobData.salaryRange && (
              <div>{jobData.salaryRange}</div>
            )}
          </div>
        </div>
      )}

      {/* Applicants Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 py-3">
            {[
              { name: 'All', count: statusCounts.all },
              { name: 'Pending', count: statusCounts.pending },
              { name: 'Qualified', count: statusCounts.qualified },
              { name: 'Not Qualified', count: statusCounts.notQualified },
            ].map(tab => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.name
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.name}</span>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-md">
            <Input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Applicants Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-gray-700">
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Applied
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplicants.map((applicant: any) => (
                <TableRow key={applicant.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <TableCell className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {applicant.applicant?.fullName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {applicant.applicant?.email || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      Applied {new Date(applicant.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge {...getStatusBadgeProps(applicant.status)}>
                      {applicant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <button className="text-brand-600 hover:text-brand-500 text-sm font-medium">
                      👁 View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredApplicants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              No applicants found for the selected criteria.
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredApplicants.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {filteredApplicants.length} of {totalApplicants} applicants
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                  1
                </button>
                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                  2
                </button>
                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                  3
                </button>
                <span className="text-sm text-gray-500">...</span>
                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                  10
                </button>
                <button className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailsView;
