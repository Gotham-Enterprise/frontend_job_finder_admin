"use client";

import NotFoundState from "@/components/common/NotFoundState";

interface CompanyOverviewProps {
    overview?: string;
}

export default function CompanyOverview({ overview }: CompanyOverviewProps) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 8h3m-3 4h3m-3 4h3m6-8h3m-3 4h3m-3 4h3" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Company Overview</h3>
            </div>

            <div className="space-y-6">
                {overview ? (
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About the Company</h4>                       
                         <div className="bg-gradient-to-r rounded-lg">
                            <div 
                                className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: overview }}
                            />
                        </div>
                    </div>                ) : (
                    <NotFoundState 
                        title="No Overview Available"
                        message="The company hasn't provided an overview yet."
                        className="w-full"
                    />
                )}
            </div>        </div>
    );
}
