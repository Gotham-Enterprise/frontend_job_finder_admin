"use client";
import React from 'react';

interface ResumeData {
    fileUrl: string;
    fileName?: string;
}

interface ApplicantData {
    resume?: ResumeData;
    coverLetterUrl?: string;
    coverLetterFilename?: string;
    introductionVideoUrl?: string;
    introductionFilename?: string;
}

interface ApplicantDocumentsProps {
    applicant: ApplicantData;
    onViewDocument: (url: string) => void;
}

export default function ApplicantDocuments({ applicant, onViewDocument }: ApplicantDocumentsProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Documents</h2>
            </div>

            <div className="space-y-4">
                {/* Resume */}
                {applicant.resume && (
                    <div 
                        className="flex items-center p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
                        onClick={() => onViewDocument(applicant.resume!.fileUrl)}
                    >
                        <div className="w-7 h-7 rounded-sm flex items-center justify-center mr-3 bg-blue-600 transition-all duration-200 shadow-sm">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                                Resume
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {applicant.resume.fileName || 'Resume Document'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                                CV
                            </span>
                            <div className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cover Letter */}
                {applicant.coverLetterUrl && (
                    <div 
                        className="flex items-center p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
                        onClick={() => onViewDocument(applicant.coverLetterUrl!)}
                    >
                        <div className="w-7 h-7 rounded-sm flex items-center justify-center mr-3 bg-green-600 transition-all duration-200 shadow-sm">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200 truncate">
                                Cover Letter
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {applicant.coverLetterFilename || 'Cover Letter Document'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            <div className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Introduction Video */}
                {applicant.introductionVideoUrl && (
                    <div 
                        className="flex items-center p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
                        onClick={() => onViewDocument(applicant.introductionVideoUrl!)}
                    >
                        <div className="w-7 h-7 rounded-sm flex items-center justify-center mr-3 bg-purple-600 transition-all duration-200 shadow-sm">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200 truncate">
                                Introduction Video
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {applicant.introductionFilename || 'Video Introduction'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            <div className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {!applicant.resume && !applicant.coverLetterUrl && !applicant.introductionVideoUrl && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No documents available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
