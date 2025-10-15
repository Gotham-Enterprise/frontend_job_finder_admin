import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { CareerTableData } from '@/services/types/CareersTypes';

interface CareersJobSectionProps {
  title: string;
  jobs: CareerTableData[];
  isLoading: boolean;
  onViewJobDetails: (jobId: string) => void;
  onViewApplicants: (jobId: string) => void;
  meta?: {
    page: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit?: number;
  };
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

const CareersJobSection: React.FC<CareersJobSectionProps> = ({
  title,
  jobs,
  isLoading,
  onViewJobDetails,
  onViewApplicants,
  meta,
  onPrevPage,
  onNextPage,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50, 100],
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
  </div>
      
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-gray-800">
              <TableCell isHeader className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Job Title
              </TableCell>
              <TableCell isHeader className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </TableCell>
              <TableCell isHeader className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Location
              </TableCell>
              <TableCell isHeader className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Applicants
              </TableCell>
              <TableCell isHeader className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Views
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {job.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {(() => {
                        // Prefer explicit pay if meaningful (not empty/'Not specified')
                        const hasExplicit = job.pay && job.pay !== 'Not specified' && job.payPeriod;
                        if (hasExplicit) {
                          return `$${job.pay}/${job.payPeriod}`;
                        }
                        // Fall back to salary range
                        const start = job.salaryRangeStart;
                        const end = job.salaryRangeEnd;
                        if (start && end) {
                          const fmt = (v: number) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                          return `$${fmt(start)} - $${fmt(end)}`;
                        }
                        if (start && !end) {
                          const fmt = (v: number) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                          return `$${fmt(start)}`;
                        }
                        if (!start && end) {
                          const fmt = (v: number) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                          return `$${fmt(end)}`;
                        }
                        return 'Not specified';
                      })()}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Posted {job.postedDate}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge 
                    variant="light" 
                    color="primary"
                    className="capitalize"
                  >
                    {job.type}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {job.location}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <button
                    onClick={() => onViewApplicants(job.id)}
                    className="text-blue-500 hover:text-blue-600 font-medium text-sm hover:underline"
                  >
                    {job.applicantCount} Applicants
                    <svg className="w-4 h-4 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {job.views ?? 0} {job.views === 1 ? 'View' : 'Views'}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              No {title.toLowerCase()} found.
            </div>
          </div>
        )}
      </div>

      {meta && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-3">
            <span>Page {meta.page} of {meta.totalPages} • {meta.totalCount} total</span>
            <div className="flex items-center gap-2">
              <label htmlFor={`${title}-page-size`} className="whitespace-nowrap">Rows per page</label>
              <select
                id={`${title}-page-size`}
                value={meta.limit || 5}
                onChange={(e) => onPageSizeChange?.(parseInt(e.target.value, 10))}
                className="px-2 py-1 border border-gray-300 rounded-md bg-white dark:bg-transparent dark:border-gray-700"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              disabled={!meta.hasPreviousPage}
              onClick={onPrevPage}
              className={`px-3 py-1 rounded border ${meta.hasPreviousPage ? 'text-gray-700 dark:text-gray-200 border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800' : 'text-gray-400 border-gray-200 dark:border-gray-800 cursor-not-allowed'}`}
            >
              Prev
            </button>
            <button
              disabled={!meta.hasNextPage}
              onClick={onNextPage}
              className={`px-3 py-1 rounded border ${meta.hasNextPage ? 'text-gray-700 dark:text-gray-200 border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800' : 'text-gray-400 border-gray-200 dark:border-gray-800 cursor-not-allowed'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareersJobSection;
