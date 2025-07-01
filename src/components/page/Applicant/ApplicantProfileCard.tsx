"use client";

import ProfileCard, { ContactInfo, ProfileData } from "@/components/ui/ProfileCard";

interface ApplicantData {
    name: string;
    jobTitle: string;
    status: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    yearsOfExperience?: number;
    preferredSalary?: string;
    stateLicenses?: string;
}

interface ApplicantProfileCardProps {
    applicant: ApplicantData;
}

export default function ApplicantProfileCard({ applicant }: ApplicantProfileCardProps) {
   
    const profileData: ProfileData = {
        name: applicant.name,
        title: applicant.jobTitle,
        status: applicant.status,
        email: applicant.email,
        phone: applicant.phone,
        linkedinUrl: applicant.linkedinUrl,
        portfolioUrl: applicant.portfolioUrl,
        yearsOfExperience: applicant.yearsOfExperience,
        preferredSalary: applicant.preferredSalary,
        stateLicenses: applicant.stateLicenses,
    };

    const contactInfo: ContactInfo[] = [
        ...(applicant.email ? [{
            label: "Email",
            value: applicant.email,
            className: "text-gray-900 dark:text-white",
           
        }] : []),
        ...(applicant.phone ? [{
            label: "Phone",
            value: applicant.phone,
            className: "text-gray-900 dark:text-white",
           
        }] : []),
        ...(applicant.linkedinUrl ? [{
            label: "LinkedIn",
            value: "View Profile",
            className: "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer",
          
        }] : []),
        ...(applicant.portfolioUrl ? [{
            label: "Portfolio",
            value: "View Portfolio",
            className: "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer",
          
        }] : []),
        ...(applicant.yearsOfExperience ? [{
            label: "Experience",
            value: `${applicant.yearsOfExperience} years`,
            className: "text-gray-900 dark:text-white",
          
        }] : []),
        ...(applicant.preferredSalary ? [{
            label: "Preferred Salary",
            value: applicant.preferredSalary,
            className: "text-gray-900 dark:text-white",
        
        }] : []),
        ...(applicant.stateLicenses ? [{
            label: "State Licenses",
            value: applicant.stateLicenses,
            className: "text-gray-900 dark:text-white",
           
        }] : []),
    ];

    return (
        <ProfileCard
            profileData={profileData}
            contactInfo={contactInfo}
            showStatusIndicator={false}
            showDocuments={false}
            showContactInfo={true}
            className="mb-6"
            avatarSize="md"
        />
    );
}
