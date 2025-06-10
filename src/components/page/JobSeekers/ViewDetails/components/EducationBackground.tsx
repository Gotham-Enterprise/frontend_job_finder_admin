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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Education Background</h3>
            </div>
            
            {educations && educations.length > 0 ? (
                <div className="space-y-4">
                    {educations.map((education) => (
                        <div key={education.id}>
                            <div className="flex items-center mb-3">
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
                <p className="text-gray-500 dark:text-gray-400 text-center">No education information available</p>
            )}
        </div>
    );
}
