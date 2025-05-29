"use client";

import { JobPost } from "@/services/types/employer";
import { useState } from "react";

interface JobPostsProps {
    jobPosts: JobPost[];
    formatDate: (date: string | undefined) => string;
}

export default function JobPosts({ jobPosts, formatDate }: JobPostsProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(jobPosts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentJobs = jobPosts.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };    
    const formatPostingDate = (postingDate: string) => {
       
        const timeStrings = [
            "Today", 
            "Yesterday", 
            "This Week", 
            "This Month", 
            "Last Week", 
            "Last Month"
        ];
        
      
        if (timeStrings.includes(postingDate)) {
            return postingDate;
        }
        
     
        if (postingDate.includes("ago")) {
            return postingDate;
        }
        
      
        if (!postingDate || postingDate.length < 3) {
            return "Unknown";
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
    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'closed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'paused':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getEmploymentTypeVariant = (type: string) => {
        switch (type.toLowerCase()) {
            case 'full-time':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'part-time':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            case 'contract':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
            case 'freelance':
                return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Job Posts ({jobPosts?.length || 0})</h3>
            </div>            {jobPosts && jobPosts.length > 0 ? (
                <>
                    <div className="space-y-6">
                        {currentJobs.map((job) => (
                        <div key={job.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                                <div className="flex-1 mb-4 lg:mb-0">                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{job.title}</h4>
                                        <div className="flex flex-wrap gap-2 ml-4">
                                            {job.status && (
                                                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusVariant(job.status)}`}>
                                                    {job.status}
                                                </span>
                                            )}
                                            {job.employmentType && (
                                                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getEmploymentTypeVariant(job.employmentType)}`}>
                                                    {job.employmentType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {job.location && (
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{job.location}</span>
                                            </div>
                                        )}
                                        {job.salaryRange && (
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                                <span>{job.salaryRange}</span>
                                            </div>
                                        )}
                                        {job.experienceLevel && (
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                <span>{job.experienceLevel}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {job.description && (
                                <div className="mb-4">
                                    <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Description</h6>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm line-clamp-3">
                                        {job.description}
                                    </p>
                                </div>
                            )}                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Applications</p>
                                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{job._count?.applicants || 0}</p>
                                </div>                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Posted</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatPostingDate(job.postingDate)}</p>
                                </div>                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {job.status || "Active"}
                                    </p>
                                </div>
                            </div>                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, jobPosts.length)} of {jobPosts.length} job posts
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                        currentPage === page
                                            ? 'text-white bg-blue-600 border border-blue-600'
                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
                </>
            ) : (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-center">No job posts available</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This employer hasn't posted any jobs yet</p>
                    </div>
                </div>
            )}
        </div>
    );
}
