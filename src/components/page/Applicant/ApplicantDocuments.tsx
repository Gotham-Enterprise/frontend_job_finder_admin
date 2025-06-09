"use client";
import React from 'react';

interface ResumeData {
    fileUrl: string;
    fileName?: string;
}

interface ApplicantData {
    resume?: ResumeData;
    coverLetterUrl?: string;
    introductionVideoUrl?: string;
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Resume */}
                {applicant.resume && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Resume</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                                    {applicant.resume.fileName || 'Resume Document'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => onViewDocument(applicant.resume!.fileUrl)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            View Resume
                        </button>
                    </div>
                )}

                {/* Cover Letter */}
                {applicant.coverLetterUrl && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Cover Letter</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">Cover Letter Document</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onViewDocument(applicant.coverLetterUrl!)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            View Cover Letter
                        </button>
                    </div>
                )}

                {/* Introduction Video */}
                {applicant.introductionVideoUrl && (
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Introduction Video</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">Video Introduction</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onViewDocument(applicant.introductionVideoUrl!)}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            View Video
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
