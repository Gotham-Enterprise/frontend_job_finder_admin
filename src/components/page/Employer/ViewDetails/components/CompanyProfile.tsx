"use client";

import Image from "next/image";
import { EmployerDetails } from "@/services/types/employer";
import { ReactNode } from "react";
import Star from "@/components/ui/star";

interface CompanyProfileProps {
    employer: EmployerDetails;
    contactInfo: Array<{
        label: string;
        value: string | ReactNode;
        className: string;
    }>;
    onSeeReviews?: () => void;
}

const renderStars = (rating: string) => {
    const numRating = parseFloat(rating) || 0;
    const stars = [];
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
        stars.push(
            <Star key={`full-${i}`} width={16} height={16} fill="#FFD700" stroke="#FFD700" />
        );
    }
    
    if (hasHalfStar && fullStars < 5) {
        stars.push(
            <div key="half" className="relative">
                <Star width={16} height={16} fill="#E5E7EB" stroke="#E5E7EB" />
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                    <Star width={16} height={16} fill="#FFD700" stroke="#FFD700" />
                </div>
            </div>
        );
    }
    
    const remainingStars = 5 - Math.ceil(numRating);
    for (let i = 0; i < remainingStars; i++) {
        stars.push(
            <Star key={`empty-${i}`} width={16} height={16} fill="#E5E7EB" stroke="#E5E7EB" />
        );
    }
    
    return stars;
};

export default function CompanyProfile({ employer, contactInfo, onSeeReviews }: CompanyProfileProps) {
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
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-full border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center gap-1">
                                {renderStars(employer.averageRating)}
                            </div>
                            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                {employer.averageRating}/5.0
                            </span>
                        </div>
                        {onSeeReviews && (
                            <button
                                onClick={onSeeReviews}
                                className="inline-block px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200 cursor-pointer"
                            >
                                See reviews
                            </button>
                        )}
                    </div>
                </div>

                <div className="w-full space-y-4 mb-6">                    
                    {contactInfo.map((info, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{info.label}</span>
                            <div className={`text-sm font-semibold ${info.className}`}>{info.value}</div>
                        </div>
                    ))}                </div>
            </div>
        </div>
    );
}
