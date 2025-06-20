"use client";

interface JobHeaderProps {
    job: {
        title: string;
        occupation?: string;
        workType: string;
        isSalaryVisible: boolean;
        salaryRangeStart: number;
        salaryRangeEnd: number;
        salaryCurrency: string;
        location: string;
        workSetting: string;
        jobDescription: string;
    };
    getJobStatusVariant: (status: string) => string;
    formatSalaryRange: (start: number, end: number, currency: string) => string;
}

export default function JobHeader({ job, getJobStatusVariant, formatSalaryRange }: JobHeaderProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {job.title}
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                        {job.occupation ? job.occupation : 'No occupation specified'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <span className={`inline-block px-4 py-2 text-sm font-medium rounded-full ${getJobStatusVariant('active')}`}>
                        Active
                    </span>
                    <span className="inline-block px-4 py-2 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {job.workType}
                    </span>
                </div>
            </div>

         
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Job Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Work Type</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{job.workType}</p>
                        </div>
                    </div>

                  
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Salary Range</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {job.isSalaryVisible 
                                    ? formatSalaryRange(job.salaryRangeStart, job.salaryRangeEnd, job.salaryCurrency)
                                    : 'Not disclosed'
                                }
                            </p>
                        </div>
                    </div>

                
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{job.location}</p>
                        </div>
                    </div>

                 
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Work Setting</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{job.workSetting}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Description</h3>
                <div 
                    className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-lg max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: job.jobDescription }}
                />
            </div>
        </div>
    );
}
