"use client";
import React from 'react';
import { formatDate } from '@/services/utils/dateUtils';

interface ApplicantData {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    appliedAt?: string;
    updatedAt?: string;
    availabilityDate?: string;
    workAuthorization?: string;
    references?: string;
}

interface ApplicantAdditionalInfoProps {
    applicant: ApplicantData;
}

export default function ApplicantAdditionalInfo({ applicant }: ApplicantAdditionalInfoProps) {
    return (
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
                {/* Address Details */}
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Address Details</h3>
                    <div className="space-y-2 text-sm">
                        {applicant.address && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Address:</span> {applicant.address}
                            </p>
                        )}
                        {applicant.city && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">City:</span> {applicant.city}
                            </p>
                        )}
                        {applicant.state && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">State:</span> {applicant.state}
                            </p>
                        )}
                        {applicant.zipCode && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">ZIP Code:</span> {applicant.zipCode}
                            </p>
                        )}
                        {applicant.country && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Country:</span> {applicant.country}
                            </p>
                        )}
                    </div>
                </div>
                
                {/* Application Timeline */}
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Application Timeline</h3>
                    <div className="space-y-2 text-sm">
                        {applicant.appliedAt && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Applied:</span> {formatDate(applicant.appliedAt)}
                            </p>
                        )}
                        {applicant.updatedAt && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Last Updated:</span> {formatDate(applicant.updatedAt)}
                            </p>
                        )}
                        {applicant.availabilityDate && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Available From:</span> {formatDate(applicant.availabilityDate)}
                            </p>
                        )}
                        {applicant.workAuthorization && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Work Authorization:</span> {applicant.workAuthorization}
                            </p>
                        )}
                        {applicant.references && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">References:</span> {applicant.references}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
