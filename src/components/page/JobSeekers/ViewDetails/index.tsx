"use client";
import React from "react";
import Link from "next/link";
import { useJobSeekerDetails } from "@/services/hooks/useJobSeekers";
import { formatDate } from "@/services/utils/dateUtils";
import ErrorState from "../../../common/ErrorState";
import FullScreenSpinner from "../../../ui/FullScreenSpinner";
import {
    ProfileCard,
    WorkExperience,
    PersonalSummary,
    EducationBackground,
    Certifications,
    Languages,
    Skills
} from "./components";

interface ViewDetailsProps {
    id: string;
}

export default function ViewDetails({ id }: ViewDetailsProps) {
    const { data, isLoading, error } = useJobSeekerDetails(id);

    const getProficiencyLabel = (proficiency: string) => {
        if (!proficiency || proficiency.trim() === '' || proficiency.toLowerCase() === 'null') {
            return 'Not specified';
        }
        
        switch (proficiency.toLowerCase()) {
            case 'basic': return 'Basic';
            case 'intermediate': return 'Intermediate';
            case 'advanced': return 'Advanced';
            case 'native': return 'Native';
            case 'fluent': return 'Fluent';
            case 'conversational': return 'Conversational';
            case 'beginner': return 'Beginner';
            case 'elementary': return 'Elementary';
            case 'proficient': return 'Proficient';
            default: return proficiency.charAt(0).toUpperCase() + proficiency.slice(1).toLowerCase();
        }
    };

    if (isLoading) {
        return <FullScreenSpinner isVisible={true} message="Loading job seeker details..." />;
    }

    if (error) {
        return (
            <div className="px-4 pt-4 pb-2">
                <Link 
                    href="/admin/job-seekers"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-colors mb-6"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Job Seekers
                </Link>
                <ErrorState 
                    message={`Error loading job seeker details: ${error.message}`}
                />
            </div>
        );
    }

    if (!data?.success || !data?.data) {
        return (
            <div className="px-4 pt-4 pb-2">
                <Link 
                    href="/admin/job-seekers"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-colors mb-6"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Job Seekers
                </Link>
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Job seeker not found</p>
                </div>
            </div>
        );
    }   
    
    const jobSeeker = data.data;

    const contactInfo = [
        {
            label: 'Experience',
            value: `${jobSeeker.professionalBackground?.length || 0} ${jobSeeker.professionalBackground?.length === 1 ? 'Position' : 'Positions'}`,
            className: 'text-gray-900 dark:text-white'
        },        {
            label: 'Phone',
            value: jobSeeker.phoneNumber || 'Not provided',
            className: 'text-gray-900 dark:text-white'
        },
        {
            label: 'Email',
            value: jobSeeker.email,
            className: 'text-gray-900 dark:text-white break-all'
        },        {
            label: 'Location',
            value: [jobSeeker.city, jobSeeker.state].filter(Boolean).join(', ') || 'Not specified',
            className: 'text-gray-900 dark:text-white text-right'
        },
        {
            label: 'Joined',
            value: formatDate(jobSeeker.joined),
            className: 'text-gray-900 dark:text-white'
        },
        {
            label: 'Last Active',
            value: formatDate(jobSeeker.lastActivity),
            className: 'text-green-600 dark:text-green-400'
        }
    ];

    return (
        <>
        <div className="px-4 pt-4 pb-2">
            <Link 
                href="/admin/job-seekers"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-colors"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Job Seekers
            </Link>
        </div>        <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
            <div className="col-span-full xl:col-auto">
                <ProfileCard jobSeeker={jobSeeker} contactInfo={contactInfo} />
            </div>            <div className="col-span-2 space-y-6">
                <WorkExperience 
                    professionalBackground={jobSeeker.professionalBackground}
                    formatDate={formatDate}
                />
                
                <PersonalSummary personalSummary={jobSeeker.personalSummary} />
                
                <EducationBackground 
                    educations={jobSeeker.educations}
                    formatDate={formatDate}
                />
                
                <Certifications 
                    licenses={jobSeeker.licenses}
                    formatDate={formatDate}
                />
                
                <Languages 
                    languages={jobSeeker.languages}
                    getProficiencyLabel={getProficiencyLabel}
                />
                
                <Skills skills={jobSeeker.skills} />
                
         
            </div>
        </div>
        </>
    )
}