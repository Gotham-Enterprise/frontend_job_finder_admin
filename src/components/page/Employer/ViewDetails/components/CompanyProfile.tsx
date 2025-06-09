"use client";

import Image from "next/image";
import { EmployerDetails } from "@/services/types/employer";
import { ReactNode } from "react";
import { renderStars } from "@/services/utils/starUtils";
import Button from "@/components/ui/button/Button";
import NotFoundState from "@/components/common/NotFoundState";

interface CompanyProfileProps {
    employer: EmployerDetails;
    contactInfo: Array<{
        label: string;
        value: string | ReactNode;
        className: string;
    }>;
    onSeeReviews?: () => void;
    overview?: string;
}

export default function CompanyProfile({ employer, contactInfo, onSeeReviews, overview }: CompanyProfileProps) {
    return (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 sm:p-8">
            <div className="flex flex-col items-center">                
                <div className="relative mb-6 inline-block">
                    <div className="w-30 h-30 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center border-4 border-blue-100 dark:border-blue-900 shadow-lg">
                        <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                            {employer.companyName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                        </span>
                    </div>
                    <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-3 border-white dark:border-gray-800 shadow-sm ${
                        employer.status === 'active' ? 'bg-green-500' : 
                        employer.status === 'inactive' ? 'bg-gray-400' : 'bg-red-500'
                    }`}></div>
                </div>                
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{employer.companyName}</h2>
                    <p className="text-gray-500 text-sm dark:text-gray-400 mb-3">{employer.address}</p>                    
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-1">
                                {renderStars(employer.averageRating)}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {employer.averageRating}/5.0
                            </span>
                        </div>{onSeeReviews && (
                            <Button
                                onClick={onSeeReviews}
                                variant="ghost"
                                size="lg"
                                className="text-blue-600 dark:text-blue-300"
                            >
                                See reviews
                            </Button>
                        )}
                    </div>
                </div>                
                <div className="w-full space-y-4 mb-6">                    
                    {contactInfo.map((info, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{info.label}</span>
                            <div className={`text-sm font-semibold ${info.className}`}>{info.value}</div>
                        </div>
                    ))}                
                </div>

                <div className="w-full">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Company Overview</h3>
                    
                    {overview ? (
                        <div className="bg-gradient-to-r rounded-lg">
                            <div 
                                className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: overview }}
                            />
                        </div>
                    ) : (
                        <NotFoundState 
                            title="No Overview Available"
                            message="The company hasn't provided an overview yet."
                            className="w-full"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
