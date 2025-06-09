"use client";

import { JobPost } from "@/services/types/employer";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import { getJobStatusVariant, getEmploymentTypeVariant } from "@/services/utils/statusVariants";
import NotFoundState from "@/components/common/NotFoundState";
import Pagination from "@/components/tables/Pagination";
import { LocationIcon, DollarIcon, ExperienceIcon, JobIcon, EyeIcon } from "@/components/ui/icons";

interface JobPostsProps {
    jobPosts: JobPost[];
    formatDate: (date: string | undefined) => string;
}

export default function JobPosts({ jobPosts, formatDate }: JobPostsProps) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(jobPosts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentJobs = jobPosts.slice(startIndex, endIndex);

    const initPageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getJobDetails = (job: JobPost) => [
        {
            label: "Applications:",
            value: job._count?.applicants || 0,
            className: "text-lg font-semibold text-blue-600 dark:text-blue-400"
        },
        {
            label: "Posted:",
            value: formatPostingDate(job.postingDate),
            className: "text-sm text-gray-600 dark:text-gray-400"
        },
        {
            label: "Status:",
            value: job.status || "Active",
            className: "text-sm text-gray-600 dark:text-gray-400"
        }
    ];    const formatPostingDate = (postingDate: string) => {
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
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">            <div className="flex items-center mb-6">
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Job Posts ({jobPosts?.length || 0})</h3>
            </div>
             {jobPosts && jobPosts.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {currentJobs.map((job) => (
                            <div key={job.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                           
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex-1">
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-3">
                                                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 lg:mb-0">{job.title}</h4>
                                                <div className="flex flex-wrap gap-2">                                                    {job.status && (
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
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">                                                {job.location && (
                                                    <div className="flex items-center gap-2">
                                                        <LocationIcon className="text-gray-400" />
                                                        <span>{job.location}</span>
                                                    </div>
                                                )}                                                {job.salaryRange && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarIcon className="text-gray-400" />
                                                        <span>{job.salaryRange}</span>
                                                    </div>
                                                )}                                                {job.experienceLevel && (
                                                    <div className="flex items-center gap-2">
                                                        <ExperienceIcon className="text-gray-400" />
                                                        <span>{job.experienceLevel}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                             
                                {job.description && (
                                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm line-clamp-2">
                                            {job.description}
                                        </p>
                                    </div>
                                )}                                
                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex items-center gap-8">
                                            {getJobDetails(job).map((item, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                                                    <span className={item.className}>
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>                                        <Button
                                            onClick={() => router.push(`/admin/jobs/details/${job.id}`)}
                                            variant="default"
                                            size="sm"
                                            className="lg:w-auto w-full"
                                            startIcon={<EyeIcon className="w-4 h-4" />}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>               

                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, jobPosts.length)} of {jobPosts.length} job posts
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={initPageChange}
                        />
                    </div>
                )}</>
            ) : (
                <NotFoundState 
                    title="No job posts available"
                    message="This employer hasn't posted any jobs yet"
                />
            )}
        </div>
    );
}
