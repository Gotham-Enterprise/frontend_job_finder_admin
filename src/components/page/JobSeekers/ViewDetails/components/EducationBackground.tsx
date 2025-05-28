"use client";

import { Education } from "@/services/types/jobSeeker";

interface EducationBackgroundProps {
    educations?: Education[];
    formatDate: (dateString: string | undefined) => string;
}

export default function EducationBackground({ educations, formatDate }: EducationBackgroundProps) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Education Background</h3>
            </div>
            
            {educations && educations.length > 0 ? (
                <div className="space-y-4">
                    {educations.map((education) => (
                        <div key={education.id} className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center mb-3">
                                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{education.degree}</h4>
                            </div>
                            <p className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">{education.institution}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {formatDate(education.startDate)} - {education.endDate ? formatDate(education.endDate) : 'Present'}
                            </p>
                            {education.description && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{education.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-gray-500 dark:text-gray-400 text-center">No education information available</p>
                </div>
            )}
        </div>
    );
}
