"use client";
import Button from "@/components/ui/button/Button";
import {  ApplicantsListProps } from '@/services/types/applicant';

export default function ApplicantsList({ 
    applicants, 
    metaData, 
    page, 
    setPage, 
    getStatusVariant, 
    onViewApplicantDetails 
}: ApplicantsListProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Applicants ({applicants.length})
                </h3>
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                </div>
            </div>

            <div className="space-y-4">
                {applicants.map((applicant) => (
                    <div key={applicant.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                    {applicant.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                                    {applicant.email}
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusVariant(applicant.status)}`}>
                                    {applicant.status}
                                </span>
                            </div>
                            <div className="flex justify-end mt-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onViewApplicantDetails(applicant.id)}
                                    className="text-xs h-8 px-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                    startIcon={
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    }
                                >
                                    View
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {metaData.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Page {metaData.page} of {metaData.totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={!metaData.hasPreviousPage}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(prev => prev + 1)}
                            disabled={!metaData.hasNextPage}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {applicants.length === 0 && (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Applications will appear here when received</p>
                </div>
            )}
        </div>
    );
}
