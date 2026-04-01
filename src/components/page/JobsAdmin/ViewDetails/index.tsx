"use client";
import React, { useState } from "react";
import { useJobsAdminDetails } from "@/services/hooks/useJobsAdmin";
import { formatDate } from "@/services/utils/dateUtils";
import ErrorState from "../../../common/ErrorState";
import FullScreenSpinner from "../../../ui/FullScreenSpinner";
import ProfileCard from "@/components/ui/ProfileCard";
import { ProfileData, ContactInfo } from "@/services/types/ProfileCard";
import BackToListButton from '@/components/ui/BackToListButton';
import AdminCreateApplicationModal from "@/components/admin/AdminCreateApplicationModal";

interface ViewDetailsProps {
    id: string;
}

export default function ViewDetails({ id }: ViewDetailsProps) {
    const { data, isLoading, error } = useJobsAdminDetails(id);
    const [isCreateAppModalOpen, setIsCreateAppModalOpen] = useState(false);

    if (isLoading) {
        return <FullScreenSpinner isVisible={true} message="Loading job details..." />;
    }

    if (error) {
        return (
            <div className="px-4 pt-4 pb-2">
                <BackToListButton href="/admin/jobs" preserveState={true}>
                    Back to Jobs
                </BackToListButton>
                <ErrorState 
                    message={`Error loading job details: ${error.message}`}
                />
            </div>
        );
    }

    if (!data?.success || !data?.data) {
        return (
            <div className="px-4 pt-4 pb-2">
                <BackToListButton href="/admin/jobs" preserveState={true}>
                    Back to Jobs
                </BackToListButton>
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Job not found</p>
                </div>
            </div>
        );
    }
    
    const job = data.data;    const profileData: ProfileData = {
        name: job.title,
        title: job.occupation,
        specialty: job.specialty,
        status: job.workType || 'Full-time',
    };

    const formatSalaryRange = (start: number, end: number, currency: string) => {
        return `${currency}${start.toLocaleString()} - ${currency}${end.toLocaleString()}`;
    };

    const contactInfo: ContactInfo[] = [
        {
            label: 'Company',
            value: job.companyId,
            className: 'text-gray-900 dark:text-white',
          
        },
        {
            label: 'Location',
            value: job.location,
            className: 'text-gray-900 dark:text-white',
           
        },
        ...(job.isSalaryVisible && job.salaryRangeStart && job.salaryRangeEnd ? [{
            label: 'Salary Range',
            value: formatSalaryRange(job.salaryRangeStart, job.salaryRangeEnd, job.salaryCurrency),
            className: 'text-green-600 dark:text-green-400',
           
        }] : []),
        {
            label: 'Work Setting',
            value: job.workSetting || 'Not specified',
            className: 'text-gray-900 dark:text-white',
          
        },
        {
            label: 'Work Facility',
            value: job.workFacility || 'Not specified',
            className: 'text-gray-900 dark:text-white',
           
        },
        {
            label: 'Date Posted',
            value: formatDate(job.datePosted),
            className: 'text-gray-900 dark:text-white',
           
        },
        {
            label: 'Applicants',
            value: `${job.applicantCount || 0}`,
            className: 'text-blue-600 dark:text-blue-400',
          
        }
    ];

    return (
        <>
            <div className="px-4 pt-4 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <BackToListButton href="/admin/jobs" preserveState={true}>
                        Back to Jobs
                    </BackToListButton>
                    <button
                        onClick={() => setIsCreateAppModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30 rounded-lg transition-colors"
                    >
                        Create Application
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
                <div className="col-span-full xl:col-auto">
                    <ProfileCard 
                        profileData={profileData} 
                        contactInfo={contactInfo}
                        showStatusIndicator={false}
                        showDocuments={false}
                        showContactInfo={true}
                        className="mb-6"
                        avatarSize="lg"
                        variant="default"
                    />
                </div>

                <div className="col-span-2 space-y-6">
                    <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Job Description</h3>
                        </div>
                        
                        <div className="prose prose-sm flex flex-col gap-10 max-w-none dark:prose-invert">
                            <div 
                                className="text-gray-700 dark:text-gray-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: job.jobDescription || 'No job description provided' }}
                            />
                        </div>
                    </div>

                    {job.applicationId && (
                        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Application Status</h3>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Application ID: {job.applicationId}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AdminCreateApplicationModal
                isOpen={isCreateAppModalOpen}
                onClose={() => setIsCreateAppModalOpen(false)}
                onSuccess={() => window.location.reload()}
                preSelectedJob={{ id: job.id, title: job.title }}
            />
        </>
    );
}
