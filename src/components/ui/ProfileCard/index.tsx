"use client";

import Image from "next/image";
import { ProfileCardProps } from "./types";

// Re-export types for convenience
export type { ContactInfo, Document, ProfileData, ProfileCardProps } from "./types";

export default function ProfileCard({
    profileData,
    contactInfo = [],
    showStatusIndicator = true,
    showDocuments = true,
    showContactInfo = true,
    className = "",
    avatarSize = 'lg',
    variant = 'default'
}: ProfileCardProps) {
    const getStatusVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-500';
            case 'inactive':
                return 'bg-gray-400';
            case 'under review':
            case 'pending':
                return 'bg-yellow-500';
            case 'interview scheduled':
            case 'interviewing':
                return 'bg-blue-500';
            case 'shortlisted':
            case 'accepted':
                return 'bg-green-500';
            case 'rejected':
            case 'declined':
                return 'bg-red-500';
            case 'hired':
                return 'bg-purple-500';
            default:
                return 'bg-gray-400';
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'under review':
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'interview scheduled':
            case 'interviewing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'shortlisted':
            case 'accepted':
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'rejected':
            case 'declined':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'hired':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
        }
    };

    const avatarSizes = {
        sm: { container: 'w-16 h-16', text: 'text-lg' },
        md: { container: 'w-24 h-24', text: 'text-xl' },
        lg: { container: 'w-30 h-30', text: 'text-2xl' }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2);
    };

    const baseCardClasses = variant === 'compact' 
        ? "rounded-xl bg-white p-4 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
        : "rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 sm:p-8";

    return (
        <div className={`${baseCardClasses} ${className}`}>
            <div className="flex flex-col items-center">
              
                <div className={`relative ${variant === 'compact' ? 'mb-4' : 'mb-6'} inline-block`}>
                    {profileData.profilePicture?.url ? (
                        <Image
                            width={avatarSize === 'lg' ? 120 : avatarSize === 'md' ? 96 : 64}
                            height={avatarSize === 'lg' ? 120 : avatarSize === 'md' ? 96 : 64}
                            src={profileData.profilePicture.url}
                            alt={profileData.name}
                            className="rounded-full object-cover border-4 border-blue-100 dark:border-blue-900 shadow-lg"
                        />
                    ) : (
                        <div className={`${avatarSizes[avatarSize].container} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-blue-100 dark:border-blue-900 shadow-lg`}>
                            <span className={`${avatarSizes[avatarSize].text} font-bold text-white`}>
                                {getInitials(profileData.name)}
                            </span>
                        </div>
                    )}
                    
        
                    {showStatusIndicator && profileData.status && (
                        <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-3 border-white dark:border-gray-800 shadow-sm ${getStatusVariant(profileData.status)}`}></div>
                    )}
                </div>

       
                <div className={`text-center ${variant === 'compact' ? 'mb-4' : 'mb-6'}`}>
                    <h2 className={`${variant === 'compact' ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 dark:text-white mb-2`}>
                        {profileData.name}
                    </h2>
                    
                    {profileData.title && (
                        <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300 mb-2">
                            {profileData.title}
                        </span>
                    )}
                    
                    {profileData.status && (
                        <div className="mt-2">
                            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeVariant(profileData.status)}`}>
                                {profileData.status}
                            </span>
                        </div>
                    )}
                </div>

                {/* Contact Info Section */}
                {showContactInfo && contactInfo.length > 0 && (
                    <div className={`w-full space-y-4 ${variant === 'compact' ? 'mb-4' : 'mb-6'}`}>
                        {contactInfo.map((info, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-2">
                                    {info.icon}
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{info.label}</span>
                                </div>
                                <span className={`text-sm font-semibold ${info.className || 'text-gray-900 dark:text-white'}`}>
                                    {info.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}


                {showDocuments && profileData.documents && Array.isArray(profileData.documents) && profileData.documents.length > 0 && (
                    <div className="w-full">
                        <h4 className={`${variant === 'compact' ? 'text-base' : 'text-lg'} font-bold text-gray-900 dark:text-white mb-4`}>
                            Documents
                        </h4>
                        <div className="space-y-3">
                            {profileData.documents.map((document, index) => (
                                <div key={`${document.id || 'doc'}-${index}`} className={`flex items-center p-3 rounded-lg border ${
                                    index % 2 === 0 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                }`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                                        index % 2 === 0 ? 'bg-blue-500' : 'bg-green-500'
                                    }`}>
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{document.type}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{document.fileName}</p>
                                    </div>
                                    <button 
                                        className={`${
                                            index % 2 === 0 
                                                ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                                                : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                                        }`}
                                        onClick={() => window.open(document.url, '_blank')}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

     
                {showDocuments && (!profileData.documents || profileData.documents.length === 0) && (
                    <div className="w-full">
                        <h4 className={`${variant === 'compact' ? 'text-base' : 'text-lg'} font-bold text-gray-900 dark:text-white mb-4`}>
                            Documents
                        </h4>
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
