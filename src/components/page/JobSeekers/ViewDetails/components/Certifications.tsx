"use client";

import { License } from "@/services/types/jobSeeker";

interface CertificationsProps {
    licenses?: License[];
    formatDate: (dateString: string | undefined) => string;
}

export default function Certifications({ licenses, formatDate }: CertificationsProps) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Licenses & Certification</h3>
            </div>
              {licenses && licenses.length > 0 ? (
                <div className="space-y-4">
                    {licenses.map((license) => (
                        <div key={license.id} className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center mb-3">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{license.name}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-300">Issue Date:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{formatDate(license.issueDate)}</span>
                                </div>
                                {license.expiryDate && (
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Expiry Date:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">{formatDate(license.expiryDate)}</span>
                                    </div>
                                )}
                                {license.licenseNumber && (
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-300">License Number:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">{license.licenseNumber}</span>
                                    </div>
                                )}                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-300">Issuing Authority:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">
                                        {license.issuingAuthority || 'Not specified'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="text-gray-500 dark:text-gray-400 text-center">No licenses or certifications available</p>
                </div>
            )}
        </div>
    );
}
