"use client";

import { ProfessionalBackground } from "@/services/types/jobSeeker";

interface WorkExperienceProps {
    professionalBackground?: ProfessionalBackground[];
    formatDate: (dateString: string | undefined) => string;
}

export default function WorkExperience({ professionalBackground, formatDate }: WorkExperienceProps) {
  
    const formatMonthYear = (month: string, year: string) => {
        if (!month || !year) return 'Not specified';
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthIndex = parseInt(month) - 1;
        const monthName = monthNames[monthIndex] || 'Unknown';
        return `${monthName} ${year}`;
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-6">
               
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Work Experience</h3>
            </div>
            
            {professionalBackground && professionalBackground.length > 0 ? (
                <div className="space-y-6">
                    {professionalBackground.map((job, index) => (
                        <div key={`${job.id}-${index}`} className="pb-6 border-b border-gray-200 dark:border-gray-600 last:border-b-0 last:pb-0">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div className="flex items-center md:mb-0">
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {job.jobTitle || 'Position Title Not Specified'}
                                    </h4>
                                </div>                                 
                                <div className="flex flex-wrap gap-2 md:mt-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Work Type:</span>
                                        <span className="inline-block px-3 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                                            {job.employmentType}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Work Setting:</span>
                                        <span className="inline-block px-3 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full dark:bg-purple-900 dark:text-purple-300">
                                            {job.workplaceModel}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                                    {job.companyName || 'Company Not Specified'}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {formatMonthYear(job.startMonth, job.startYear)} - {
                                        job.isPresent ? 'Present' : formatMonthYear(job.endMonth, job.endYear)
                                    }
                                </p>
                            </div>
                              {job.description && job.description.trim() && (
                                <div className="mb-4">
                                    <h6 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Job Description</h6>
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
