"use client";

import NotFoundState from "@/components/common/NotFoundState";

interface CompanyOverviewProps {
    overview?: string;
}

export default function CompanyOverview({ overview }: CompanyOverviewProps) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-6">
              
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Company Overview</h3>
            </div>

            <div className="space-y-6">
                {overview ? (
                    <div>
                      
                         <div className="bg-gradient-to-r rounded-lg">
                            <div 
                                className="text-gray-700 dark:text-gray-300 leading-relaxed flex-col gap-10 prose prose-sm max-w-none dark:prose-invert"
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
