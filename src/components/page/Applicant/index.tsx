"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { useApplicantDetails } from '@/services/hooks/useEmployers';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import ErrorState from '@/components/common/ErrorState';
import BackButton from '@/components/ui/BackButton';
import ApplicantProfileCard from './ApplicantProfileCard';
import ApplicantDocuments from './ApplicantDocuments';
import ApplicantQuestions from './ApplicantQuestions';
import ApplicantAdditionalInfo from './ApplicantAdditionalInfo';

interface ApplicantDetailsProps {
    id?: string;
}

export default function ApplicantDetails({ id }: ApplicantDetailsProps) {
    const params = useParams();
    const applicantId = id || (params?.id as string);

    const { data, isLoading, error } = useApplicantDetails(applicantId);

    if (isLoading) {
        return <FullScreenSpinner isVisible={true} message="Loading applicant details..." />;
    }

    if (error) {
        return (
            <div className="px-4 pt-4 pb-2">
                <BackButton className="mb-6" />
                <ErrorState 
                    message={`Error loading applicant details: ${error.message}`}
                />
            </div>
        );
    }

    if (!data?.success || !data?.data) {
        return (            
            <div className="px-4 pt-4 pb-2">                
                <BackButton className="mb-6" />
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Applicant not found</p>
                </div>
            </div>
        );
    }   
    
    const applicant = data.data;

    const initViewDocument = (url: string) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <>
            <div className="px-4 pt-4 pb-2">
                <BackButton />
            </div>

            <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
                <div className="col-span-full xl:col-auto">
                    <ApplicantProfileCard applicant={applicant} />
                </div>
                <div className="col-span-2 space-y-6">
                    <ApplicantDocuments 
                        applicant={applicant} 
                        onViewDocument={initViewDocument} 
                    />
                    <ApplicantQuestions employerQuestions={applicant.employerQuestion || []} />
                    <ApplicantAdditionalInfo applicant={applicant} />
                </div>
            </div>
        </>
    );
}
