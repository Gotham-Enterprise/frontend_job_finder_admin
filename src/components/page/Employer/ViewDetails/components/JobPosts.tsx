"use client";

import { JobPost } from "@/services/types/employer";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import { getJobStatusVariant, getEmploymentTypeVariant } from "@/services/utils/statusVariants";
import NotFoundState from "@/components/common/NotFoundState";
import Pagination from "@/components/tables/Pagination";
import Select from "@/components/form/Select";
import { LocationIcon, DollarIcon, ExperienceIcon, EyeIcon } from "@/components/ui/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";

interface JobPostsProps {
    jobPosts: JobPost[];
    formatDate: (date: string | undefined) => string;
}

export default function JobPosts({ jobPosts, formatDate }: JobPostsProps) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const totalPages = Math.ceil(jobPosts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentJobs = jobPosts.slice(startIndex, endIndex);    const initPageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); 
    };

    const itemsPerPageOptions = [
        { value: '5', label: '5 per page' },
       { value: '10', label: '10 per page' },
        { value: '20', label: '20 per page' },
        { value: '50', label: '50 per page' },
        { value: '100', label: '100 per page' },
    ];

    const tableColumns = useMemo(() => [
        { key: 'title', label: 'Job Title' },
        { key: 'location', label: 'Location' },
        { key: 'salary', label: 'Salary' },
        { key: 'experience', label: 'Experience' },
        { key: 'applications', label: 'Applications' },
        { key: 'posted', label: 'Posted' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: '', className: 'text-right' },
    ], []);

    const formatPostingDate = (postingDate: string) => {
        const timeStrings = [
            "Today", 
            "Yesterday", 
            "This Week", 
            "This Month", 
            "Last Week", 
            "Last Month"
        ];
        
        if (!postingDate || postingDate.length < 3) {
            return "Not specified";
        }
        
        if (timeStrings.includes(postingDate)) {
            return postingDate;
        }
        
        if (postingDate.includes("ago")) {
            return postingDate;
        }
        
        try {
            const date = new Date(postingDate);
            if (!isNaN(date.getTime())) {
                return formatDate(postingDate);
            }
        } catch (error) {
           
        }

          return postingDate;
    };   
    
    return (
        <div className="rounded-xl bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Job Posts</h3>
            </div>
            
            {jobPosts && jobPosts.length > 0 ? (
                <>                    
                <div className="overflow-x-auto">
                        <Table className="border-collapse">
                            <TableHeading  columns={tableColumns} />
                            <TableBody>
                                {currentJobs.map((job) => (
                                    <TableRow key={job.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{job.title}</span>
                                                {job.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                        {job.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {job.location ? (
                                                    <>
                                                        <LocationIcon className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-900 dark:text-white">{job.location}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-400 dark:text-gray-500">Not specified</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {job.salaryRange ? (
                                                    <>
                                                        <DollarIcon className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-900 dark:text-white">{job.salaryRange}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-400 dark:text-gray-500">Not specified</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {job.experienceLevel ? (
                                                    <>
                                                        <ExperienceIcon className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-900 dark:text-white">{job.experienceLevel}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-400 dark:text-gray-500">Not specified</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-center">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {job._count?.applicants || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {formatPostingDate(job.postingDate)}
                                            </p>
                                        </TableCell>                                        
                                        <TableCell className="py-4 px-6">
                                            <div className="flex flex-wrap gap-2">
                                                {job.status && (
                                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getJobStatusVariant(job.status)}`}>
                                                        {job.status}
                                                    </span>
                                                )}
                                                {job.employmentType && (
                                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getEmploymentTypeVariant(job.employmentType)}`}>
                                                        {job.employmentType}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => router.push(`/admin/employers/jobs/details/${job.id}`)}
                                                className="flex gap-1  items-center text-brand-400"
                                            >
                                              <EyeIcon />  View
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {jobPosts.length > 0 && (
                        <div className="flex items-center justify-between mt-6 p-6 pt-6">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {startIndex + 1} of {Math.min(endIndex, jobPosts.length)} results
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Items per page:</span>
                                    <Select
                                        value={itemsPerPage.toString()}
                                        onChange={(value: string) => handleItemsPerPageChange(Number(value))}
                                        options={itemsPerPageOptions}
                                        className="w-auto min-w-[120px]"
                                    />
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={initPageChange}
                                />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <NotFoundState 
                    title="No job posts available"
                    message="This employer hasn't posted any jobs yet"
                />
            )}
        </div>
    );
}
