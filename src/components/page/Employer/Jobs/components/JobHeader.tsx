"use client";

interface JobHeaderProps {
    job: {
        title: string;
        occupation?: string;
        workType: string;
    };
    getJobStatusVariant: (status: string) => string;
}

export default function JobHeader({ job, getJobStatusVariant }: JobHeaderProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {job.title}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                        {job.occupation || 'Company Name'} 
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getJobStatusVariant('active')}`}>
                        Active
                    </span>
                    <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {job.workType}
                    </span>
                </div>
            </div>
        </div>
    );
}
