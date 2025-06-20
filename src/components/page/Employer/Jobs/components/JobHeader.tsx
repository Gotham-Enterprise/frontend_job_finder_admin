"use client";

import { LocationIcon, CalenderIcon, GroupIcon } from "@/icons";

interface JobHeaderProps {
    job: {
        id: string;
        title: string;
        occupation?: string;
        location: string;
        isSalaryVisible: boolean;
        salaryRangeStart: number;
        salaryRangeEnd: number;
        salaryType: string;
        salaryCurrency: string;
        workSetting: string;
        workType: string;
        datePosted: string;
        applicantCount: number;
        workFacility: string;
        isApplied: boolean;
        isSaved: boolean;
    };
    getJobStatusVariant: (status: string) => string;
}

export default function JobHeader({ job, getJobStatusVariant }: JobHeaderProps) {
    const formatSalary = () => {
        if (!job.isSalaryVisible) return 'Salary not disclosed';
        
        const currency = job.salaryCurrency === 'USD' ? '$' : job.salaryCurrency;
        const period = job.salaryType === 'monthly' ? '/month' : 
                      job.salaryType === 'hourly' ? '/hour' : 
                      job.salaryType === 'yearly' ? '/year' : '';
        
        return `${currency}${job.salaryRangeStart}k - ${currency}${job.salaryRangeEnd}k ${period}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getWorkTypeDisplay = (workType: string) => {
        switch (workType) {
            case 'fulltime': return 'Full-time';
            case 'parttime': return 'Part-time';
            case 'contract': return 'Contract';
            case 'freelance': return 'Freelance';
            default: return workType;
        }
    };

    const getWorkSettingDisplay = (workSetting: string) => {
        switch (workSetting) {
            case 'onsite': return 'On-site';
            case 'remote': return 'Remote';
            case 'hybrid': return 'Hybrid';
            default: return workSetting;
        }
    };

    const getWorkFacilityDisplay = (workFacility: string) => {
        switch (workFacility) {
            case 'hospital': return 'Hospital';
            case 'clinic': return 'Clinic';
            case 'school': return 'School';
            case 'home': return 'Home Care';
            case 'other': return 'Other';
            default: return workFacility;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {job.title}
                    </h1>
                    {job.occupation && (
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                            {job.occupation}
                        </p>
                    )}                     
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span className="flex items-center gap-2">
                            <LocationIcon className="w-4 h-4" />
                            {job.location}
                        </span>
                        <span className="flex items-center gap-2">
                            <CalenderIcon className="w-4 h-4" />
                            Posted {formatDate(job.datePosted)}
                        </span>
                        <span className="flex items-center gap-2">
                            <GroupIcon className="w-4 h-4" />
                            {job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}
                        </span>
                    </div>

                </div>
                <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getJobStatusVariant('active')}`}>
                        Active
                    </span>
                    <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {getWorkTypeDisplay(job.workType)}
                    </span>
                    <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                        {getWorkSettingDisplay(job.workSetting)}
                    </span>
                    <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                        {getWorkFacilityDisplay(job.workFacility)}
                    </span>
                </div>
            </div>
        </div>
    );
}
