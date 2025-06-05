"use client";
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApplicantDetails } from '@/services/hooks/useEmployers';
import { formatDate } from '@/services/utils/dateUtils';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import ErrorState from '@/components/common/ErrorState';

interface ApplicantDetailsProps {
    id?: string;
}

export default function ApplicantDetails({ id }: ApplicantDetailsProps) {
    const params = useParams();
    const applicantId = id || (params?.id as string);

    const { data, isLoading, error } = useApplicantDetails(applicantId);

    if (isLoading) {
        return <FullScreenSpinner isVisible={true} message="Loading applicant details..." />;
    }

    if (error) {
        return (
            <div className="px-4 pt-4 pb-2">
                <Link 
                    href="/admin/jobs"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-colors mb-6"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Jobs
                </Link>
                <ErrorState 
                    message={`Error loading applicant details: ${error.message}`}
                />
            </div>
        );
    }

    if (!data?.success || !data?.data) {
        return (
            <div className="px-4 pt-4 pb-2">
                <Link 
                    href="/admin/jobs"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-colors mb-6"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Jobs
                </Link>
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Applicant not found</p>
                </div>
            </div>
        );
    }   
    
    const applicant = data.data;

    const handleViewDocument = (url: string) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'under review':
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'interview scheduled':
            case 'interviewing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'shortlisted':
            case 'accepted':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'rejected':
            case 'declined':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'hired':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <>
            <div className="px-4 pt-4 pb-2">
                <Link 
                    href="/admin/jobs"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Jobs
                </Link>
            </div>

            <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
                {/* Profile Card */}
                <div className="col-span-full xl:col-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6">
                        {/* Header */}
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                                {applicant.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {applicant.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                                {applicant.jobTitle}
                            </p>
                            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusVariant(applicant.status)}`}>
                                {applicant.status}
                            </span>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="font-medium text-gray-900 dark:text-white break-all">{applicant.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{applicant.phoneNumber || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {[applicant.city, applicant.state, applicant.country].filter(Boolean).join(', ') || 'Not specified'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m0 0V3a2 2 0 012-2h4a2 2 0 012 2v4m0 0v8a2 2 0 01-2 2H8a2 2 0 01-2-2V7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{applicant.companyName || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m0 0V3a2 2 0 012-2h4a2 2 0 012 2v4m0 0v8a2 2 0 01-2 2H8a2 2 0 01-2-2V7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Applied</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(applicant.dateApplied)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(applicant.dateJoined)}</p>
                                </div>
                            </div>

                            {applicant.stateLicenses && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">State Licenses</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{applicant.stateLicenses}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-span-2 space-y-6">
                    {/* Documents Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
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
                                            <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{applicant.resume.filename}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleViewDocument(applicant.resume.fileUrl)}
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
                                            <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{applicant.coverLetterFilename}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleViewDocument(applicant.coverLetterUrl)}
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15a2 2 0 002-2V9a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293L10.293 4.293A1 1 0 009.586 4H8a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Introduction Video</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{applicant.introductionFilename}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleViewDocument(applicant.introductionVideoUrl)}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                                    >
                                        View Video
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Employer Questions */}
                    {applicant.employerQuestion && applicant.employerQuestion.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Employer Questions & Answers</h2>
                            </div>

                            <div className="space-y-6">
                                {applicant.employerQuestion.map((qa, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                        <div className="mb-3">
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                Q{index + 1}: {qa.question}
                                            </h4>
                                        </div>
                                        <div className="space-y-2">
                                            {qa.answers && qa.answers.length > 0 ? (
                                                qa.answers.map((answer, answerIndex) => (
                                                    <div key={answerIndex} className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600">
                                                        <p className="text-gray-700 dark:text-gray-300">{answer}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600">
                                                    <p className="text-gray-500 dark:text-gray-400 italic">No answer provided</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Additional Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Address Details</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Street:</span> {applicant.address || 'Not provided'}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">City:</span> {applicant.city || 'Not provided'}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">State:</span> {applicant.state || 'Not provided'}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Zip Code:</span> {applicant.zipCode || 'Not provided'}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Country:</span> {applicant.country || 'Not provided'}
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Application Details</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Candidate ID:</span> {applicant.candidateId}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Application ID:</span> {applicant.id}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Current Status:</span> 
                                        <span className={`inline-block ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusVariant(applicant.status)}`}>
                                            {applicant.status}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}