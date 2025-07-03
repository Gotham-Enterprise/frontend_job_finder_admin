"use client";
import React from 'react';
import { formatDate } from '@/services/utils/dateUtils';
import { ApplicantAdditionalInfoData, ApplicantAdditionalInfoProps } from '@/services/types/applicant';

export default function ApplicantAdditionalInfo({ applicant }: ApplicantAdditionalInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
                
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
                        {(applicant.dateApplied || applicant.appliedAt) && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Applied:</span> {formatDate(applicant.dateApplied || applicant.appliedAt)}
                            </p>
                        )}
                        {applicant.dateJoined && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Joined:</span> {formatDate(applicant.dateJoined)}
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
                    </div>
                </div>
            </div>

            {/* Additional row for job details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Professional Information */}
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Professional Information</h3>
                    <div className="space-y-2 text-sm">
                        {applicant.jobTitle && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Job Title:</span> {applicant.jobTitle}
                            </p>
                        )}
                        {applicant.companyName && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Company:</span> {applicant.companyName}
                            </p>
                        )}
                        {applicant.stateLicenses && (
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">State Licenses:</span> {applicant.stateLicenses}
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
