"use client";
import React from "react";
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
import BackToListButton from '@/components/ui/BackToListButton';

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
    }    if (error) {
        return (
            <div className="px-4 pt-4 pb-2">
                <BackToListButton href="/admin/job-seekers" className="mb-6">
                    Back to Job Seekers
                </BackToListButton>
                <ErrorState 
                    message={`Error loading job seeker details: ${error.message}`}
                />
            </div>
        );
    }    if (!data?.success || !data?.data) {
        return (
            <div className="px-4 pt-4 pb-2">
                <BackToListButton href="/admin/job-seekers" className="mb-6">
                    Back to Job Seekers
                </BackToListButton>
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
            value: `${jobSeeker.professionalBackground?.length || 0} ${jobSeeker.professionalBackground?.length === 1 ? 'Year' : 'Year(s)'}`,
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
            className: 'text-gray-900 dark:text-white'
        }
    ];

    return (        
    <>
        <div className="px-4 pt-4 pb-2">
            <BackToListButton href="/admin/job-seekers">
                Back to Job Seekers
            </BackToListButton>
        </div><div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
            <div className="col-span-full xl:col-auto">
                <ProfileCard jobSeeker={jobSeeker} contactInfo={contactInfo} />
            </div>            
            
            <div className="col-span-2 space-y-6">

            <PersonalSummary personalSummary={jobSeeker.personalSummary} />

                <WorkExperience 
                    professionalBackground={jobSeeker.professionalBackground}
                    formatDate={formatDate}
                />
                
               
                
                <EducationBackground 
                    educations={jobSeeker.educations}
                    formatDate={formatDate}
                />
                
                <Certifications 
                    licenses={jobSeeker.licenses}
                    formatDate={formatDate}
                />
                
            
        
                <Skills skills={jobSeeker.skills} />
                
           
                <Languages 
                    languages={jobSeeker.languages}
                    getProficiencyLabel={getProficiencyLabel}
                />
            </div>
        </div>
        </>
    )
}