"use client";

import ProfileCard from "@/components/ui/ProfileCard";
import { ProfileData, ContactInfo } from "@/services/types/ProfileCard";
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
    
    const profileData: ProfileData = {
        name: jobSeeker.name,
        title: jobSeeker.professionalBackground?.[0]?.title || 'Job Seeker',
        status: jobSeeker.status,
        profilePicture: jobSeeker.profilePicture ? {
            url: jobSeeker.profilePicture.url
        } : undefined,
        documents: jobSeeker.documents
    };

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
