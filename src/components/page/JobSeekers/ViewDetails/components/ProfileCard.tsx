"use client";

import ProfileCard from "@/components/ui/ProfileCard";
import { ProfileData, ContactInfo } from "@/components/ui/ProfileCard/types";
import { JobSeekerDetails } from "@/services/types/jobSeeker";

interface JobSeekerProfileCardProps {
    jobSeeker: JobSeekerDetails;
    contactInfo: Array<{
        label: string;
        value: string;
        className: string;
    }>;
}

export default function JobSeekerProfileCard({ jobSeeker, contactInfo }: JobSeekerProfileCardProps) {
    // Transform JobSeekerDetails to ProfileData
    const profileData: ProfileData = {
        name: jobSeeker.name,
        title: jobSeeker.professionalBackground?.[0]?.title || 'Job Seeker',
        status: jobSeeker.status,
        profilePicture: jobSeeker.profilePicture ? {
            url: jobSeeker.profilePicture.url
        } : undefined,
        documents: jobSeeker.documents
    };

    // Transform contact info to include any additional contact details
    const transformedContactInfo: ContactInfo[] = contactInfo.map(info => ({
        label: info.label,
        value: info.value,
        className: info.className
    }));

    return (
        <ProfileCard 
            profileData={profileData}
            contactInfo={transformedContactInfo}
            showStatusIndicator={true}
            showDocuments={true}
            showContactInfo={true}
            className="mb-6"
            avatarSize="lg"
            variant="default"
        />
    );
}
