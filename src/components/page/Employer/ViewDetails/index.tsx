"use client";
import React from "react";
import Link from "next/link";
import { useEmployerDetails } from "@/services/hooks/useEmployers";
import { formatDate } from "@/services/utils/dateUtils";
import ErrorState from "../../../common/ErrorState";
import FullScreenSpinner from "../../../ui/FullScreenSpinner";
import Star from "../../../ui/star";
import {
    CompanyProfile,
    JobPosts,
    CompanyOverview,
    ContactInfo
} from "./components";
import BackToListButton from '@/components/ui/BackToListButton';

interface ViewDetailsProps {
    id: string;
}

export default function ViewDetails({ id }: ViewDetailsProps) {
    const { data, isLoading, error } = useEmployerDetails(id);

    if (isLoading) {
        return <FullScreenSpinner isVisible={true} message="Loading employer details..." />;
    }

    if (error) {
        return (
            <div className="px-4 pt-4 pb-2">
                <BackToListButton href="/admin/employers" className="mb-6">
                Back to Employers
                </BackToListButton>

                <ErrorState 
                    message={`Error loading employer details: ${error.message}`}
                />
            </div>
        );
    }

    if (!data?.success || !data?.data) {
        return (
            <div className="px-4 pt-4 pb-2">
                 <BackToListButton href="/admin/employers" className="mb-6">
                Back to Employers
                </BackToListButton>
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Employer not found</p>
                </div>
            </div>
        );
    }

    const employer = data.data;

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
    };    const contactInfo = [
        {
            label: 'Job Posts',
            value: `${employer.jobPostCount} ${employer.jobPostCount === 1 ? 'Post' : 'Posts'}`,
            className: 'text-gray-900 dark:text-white'
        },
        {
            label: 'Employees',
            value: `${employer.employeeCount}`,
            className: 'text-blue-600 dark:text-blue-400'
        },
        {
            label: 'Total Applications',
            value: `${employer.totalApplicants}`,
            className: 'text-green-600 dark:text-green-400'
        },        {
            label: 'Average Rating',
            value: (
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        {renderStars(employer.averageRating)}
                    </div>
                    <span className="text-yellow-600 dark:text-yellow-400">{employer.averageRating}/5.0</span>
                </div>
            ),
            className: 'text-yellow-600 dark:text-yellow-400'
        },
        {
            label: 'Email',
            value: employer.email,
            className: 'text-gray-900 dark:text-white break-all'
        },        {
            label: 'Phone',
            value: employer.phoneNumber || 'Not specified',
            className: 'text-gray-900 dark:text-white'
        },
        {
            label: 'Location',
            value: [employer.city, employer.state].filter(Boolean).join(', ') || employer.state || 'Not specified',
            className: 'text-gray-900 dark:text-white text-right'
        },
        {
            label: 'Joined',
            value: formatDate(employer.dateJoined),
            className: 'text-gray-900 dark:text-white'
        },
        {
            label: 'Last Active',
            value: formatDate(employer.lastActivity),
            className: 'text-green-600 dark:text-green-400'
        }
    ];

    return (
        <>
        <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/employers" className="mb-6">
                Back to Employers
                </BackToListButton>
        </div>

        <div className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="col-span-full xl:col-auto">
                <CompanyProfile employer={employer} contactInfo={contactInfo} />
            </div>            <div className="col-span-2 space-y-6">
                <CompanyOverview 
                    overview={employer.overview}
                />
                
                <ContactInfo 
                    address={employer.address}
                    city={employer.city}
                    state={employer.state}
                    country={employer.country}
                />
                
                <JobPosts 
                    jobPosts={employer.jobPost || []}
                    formatDate={formatDate}
                />
            </div>
        </div>
        </>
    )
}
