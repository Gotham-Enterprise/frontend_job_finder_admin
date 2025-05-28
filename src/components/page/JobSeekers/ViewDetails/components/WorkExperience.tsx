"use client";

import { ProfessionalBackground } from "@/services/types/jobSeeker";

interface WorkExperienceProps {
    professionalBackground?: ProfessionalBackground[];
    formatDate: (dateString: string | undefined) => string;
}

export default function WorkExperience({ professionalBackground, formatDate }: WorkExperienceProps) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Professional Background</h3>
            </div>
            
            {professionalBackground && professionalBackground.length > 0 ? (
                <div className="space-y-6">
                    {professionalBackground.map((job) => (
                        <div key={job.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div className="flex items-center mb-2 md:mb-0">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{job.title}</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {job.isCurrentPosition && (
                                        <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                            Current Position
                                        </span>
                                    )}
                                    <span className="inline-block px-3 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                                        Full-Time
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-2">{job.company}</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {formatDate(job.startDate)} - {job.endDate ? formatDate(job.endDate) : 'Present'}
                                </p>
                            </div>
                            
                            {job.description && (
                                <div className="mb-4">
                                    <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Details</h6>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                                        {job.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-gray-500 dark:text-gray-400 text-center">No professional background information available</p>
                </div>
            )}
        </div>
    );
}
