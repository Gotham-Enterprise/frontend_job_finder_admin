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

         
            {/* Job Details Section */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Job Information</h3>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">Employment Type</label>
                                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">{job.workType}</p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">Location</label>
                                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">{job.location}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">Salary</label>
                                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                                    {job.isSalaryVisible 
                                        ? formatSalaryRange(job.salaryRangeStart, job.salaryRangeEnd, job.salaryCurrency)
                                        : 'Competitive salary'
                                    }
                                </p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">Work Arrangement</label>
                                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">{job.workSetting}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Description Section */}
            <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Description</h3>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                    <div 
                        className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-lg max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: job.jobDescription }}
                    />
                </div>
            </div>
        </div>
    );
}
