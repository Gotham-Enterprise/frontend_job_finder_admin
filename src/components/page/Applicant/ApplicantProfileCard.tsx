"use client";
import { ApplicantData, ApplicantProfileCardProps } from '@/services/types/applicant';

export default function ApplicantProfileCard({ applicant, onViewDocument, isViewingResume = false }: ApplicantProfileCardProps) {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2);
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 sm:p-8 mb-6">
            <div className="flex flex-col items-center">
                <div className="relative mb-6 inline-block">
                    <div className="w-30 h-30 bg-gradient-to-br bg-primary rounded-full flex items-center justify-center border-4 border-blue-100 dark:border-blue-900 shadow-lg">
                        <span className="text-2xl font-bold text-white">
                            {getInitials(applicant.name)}
                        </span>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {applicant.name}
                    </h2>
                    <div className="flex items-center items-center justify-center gap-2">
                        {applicant.jobTitle && (
                            <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                {applicant.jobTitle}
                            </span>
                        )}
                        {applicant.status && (
                            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                                {applicant.status}
                            </span>
                        )}
                    </div>
                </div>

                <div className="w-full space-y-4 mb-6">
                    {applicant.yearsOfExperience !== undefined && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Experience</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {applicant.yearsOfExperience} Year(s)
                            </span>
                        </div>
                    )}
                    {applicant.phone && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {applicant.phone}
                            </span>
                        </div>
                    )}
                    {applicant.email && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white break-all">
                                {applicant.email}
                            </span>
                        </div>
                    )}
                    {applicant.location && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Location</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {applicant.location}
                            </span>
                        </div>
                    )}
                    {applicant.joinedDate && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Joined</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {applicant.joinedDate}
                            </span>
                        </div>
                    )}
                    {applicant.lastActiveDate && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Active</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {applicant.lastActiveDate}
                            </span>
                        </div>
                    )}
                </div>

                {/* Resume Section */}
                <div className="w-full">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resume</h4>
                    
                    {applicant.resume && (
                        <div 
                            className={`flex items-center p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 transition-all duration-200 shadow-sm ${
                                isViewingResume 
                                    ? 'cursor-not-allowed opacity-75' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer group hover:shadow-md'
                            }`}
                            onClick={() => !isViewingResume && onViewDocument(applicant.resume!.fileUrl, applicant.resume!.fileObjectKey)}
                        >
                            <div className="w-7 h-7 rounded-sm flex items-center justify-center mr-3 bg-primary transition-all duration-200 shadow-sm">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                                    {applicant.resume.fileName || "Resume"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                                    CV
                                </span>
                                <div className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 group-hover:scale-110 transition-transform duration-200">
                                    {isViewingResume ? (
                                        <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                                            <div className="animate-spin rounded-full h-3 w-3 border border-blue-500 border-t-transparent mr-1"></div>
                                            <span>Opening...</span>
                                        </div>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {!applicant.resume && (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No resume uploaded</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
