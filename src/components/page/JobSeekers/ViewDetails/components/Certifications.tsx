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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Licenses</h3>
            </div>
              {licenses && licenses.length > 0 ? (
                <div className="space-y-4">
                    {licenses.map((license) => (
                        <div key={license.id}>
                            <div className="flex items-center mb-3">
                             
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{license.name}</h4>
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
                <p className="text-gray-500 dark:text-gray-400 text-center">No licenses or certifications available</p>
            )}
        </div>
    );
}
