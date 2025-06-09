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
               
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Professional Background</h3>
            </div>
            
            {professionalBackground && professionalBackground.length > 0 ? (
                <div>
                    {professionalBackground.map((job) => (
                        <div key={job.id}>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center md:mb-0">
                                   
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{job.title}</h4>
                                </div>                               
                                 <div className="flex flex-wrap gap-2">
                                    {job.isCurrentPosition && (
                                        <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                            Current Position
                                        </span>
                                    )}
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
                <div className="rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400 text-center">No professional background information available</p>
                </div>
            )}
        </div>
    );
}
