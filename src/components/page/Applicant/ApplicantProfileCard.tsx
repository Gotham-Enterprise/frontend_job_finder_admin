"use client";

import ProfileCard from "@/components/ui/ProfileCard";
import { ContactInfo, ProfileData } from "@/components/ui/ProfileCard/types";

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
            icon: (
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
            )
        }] : []),
        ...(applicant.phone ? [{
            label: "Phone",
            value: applicant.phone,
            className: "text-gray-900 dark:text-white",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                </div>
            )
        }] : []),
        ...(applicant.linkedinUrl ? [{
            label: "LinkedIn",
            value: "View Profile",
            className: "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                </div>
            )
        }] : []),
        ...(applicant.portfolioUrl ? [{
            label: "Portfolio",
            value: "View Portfolio",
            className: "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                </div>
            )
        }] : []),
        ...(applicant.yearsOfExperience ? [{
            label: "Experience",
            value: `${applicant.yearsOfExperience} years`,
            className: "text-gray-900 dark:text-white",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8m0 0v.01M8 6v10a2 2 0 002 2h4a2 2 0 002 2V6M8 6H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
                    </svg>
                </div>
            )
        }] : []),
        ...(applicant.preferredSalary ? [{
            label: "Preferred Salary",
            value: applicant.preferredSalary,
            className: "text-gray-900 dark:text-white",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                </div>
            )
        }] : []),
        ...(applicant.stateLicenses ? [{
            label: "State Licenses",
            value: applicant.stateLicenses,
            className: "text-gray-900 dark:text-white",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                </div>
            )
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
