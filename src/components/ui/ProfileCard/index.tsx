"use client";

import Image from "next/image";
import { useState } from "react";
import { ProfileCardProps, ContactInfo, Document, ProfileData } from "@/services/types/ProfileCard";
import { getStatusIndicatorVariant, getProfileStatusBadgeVariant } from "@/services/utils/statusVariants";
import Button from "../button/Button";

export type { ContactInfo, Document, ProfileData, ProfileCardProps } from "@/services/types/ProfileCard";

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
    const [showAllResumes, setShowAllResumes] = useState(false);
    const [showAllDocuments, setShowAllDocuments] = useState(false);
    
    const avatarSizes: Record<'sm' | 'md' | 'lg', { container: string; text: string }> = {
        sm: { container: 'w-16 h-16', text: 'text-lg' },
        md: { container: 'w-24 h-24', text: 'text-xl' },
        lg: { container: 'w-30 h-30', text: 'text-2xl' }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2);
    };

    const getResumesToShow = () => {
        if (!profileData.documents || profileData.documents.length === 0) return [];
        
        const resumes = profileData.documents.filter(doc => 
            doc.type?.toLowerCase().includes('resume') || 
            doc.type?.toLowerCase().includes('cv') ||
            doc.fileName?.toLowerCase().includes('resume') ||
            doc.fileName?.toLowerCase().includes('cv')
        );
        
        if (resumes.length <= 3) {
            return resumes;
        } else if (!showAllResumes) {
            return resumes.slice(0, 3);
        } else {
            return resumes;
        }
    };

    const getDocumentsToShow = () => {
        if (!profileData.documents || profileData.documents.length === 0) return [];
        
        const documents = profileData.documents.filter(doc => 
            !doc.type?.toLowerCase().includes('resume') && 
            !doc.type?.toLowerCase().includes('cv') &&
            !doc.fileName?.toLowerCase().includes('resume') &&
            !doc.fileName?.toLowerCase().includes('cv')
        );
        
        if (documents.length <= 3) {
            return documents;
        } else if (!showAllDocuments) {
            return documents.slice(0, 3);
        } else {
            return documents;
        }
    };

    const getContainerClasses = (isExpanded: boolean, totalCount: number) => {
        if (totalCount > 3 && isExpanded) {
            return "space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-600 scrollbar-track-blue-50 dark:scrollbar-track-blue-900/20 pr-2 border border-blue-100 dark:border-blue-800 rounded-lg p-3 bg-blue-50/30 dark:bg-blue-900/10";
        }
        return "space-y-2";
    };

    const baseCardClasses = variant === 'compact' 
        ? "rounded-xl bg-white p-4 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
        : "rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 sm:p-8";

    return (
        <div className={`${baseCardClasses} ${className}`}>
            <div className="flex flex-col items-center">
              
                <div className={`relative ${variant === 'compact' ? 'mb-4' : 'mb-6'} inline-block`}>                    {profileData.profilePicture?.url ? (
                        <Image
                            width={avatarSize === 'lg' ? 120 : avatarSize === 'md' ? 96 : 64}
                            height={avatarSize === 'lg' ? 120 : avatarSize === 'md' ? 96 : 64}
                            src={profileData.profilePicture.url}
                            alt={profileData.name}
                            className={`${avatarSizes[avatarSize].container} rounded-full object-cover border-4 border-blue-100 dark:border-blue-900 shadow-lg`}
                        />
                    ) : (
                        <div className={`${avatarSizes[avatarSize].container} bg-gradient-to-br bg-primary rounded-full flex items-center justify-center border-4 border-blue-100 dark:border-blue-900 shadow-lg`}>
                            <span className={`${avatarSizes[avatarSize].text} font-bold text-white`}>
                                {getInitials(profileData.name)}
                            </span>
                        </div>
                    )}
                                {showStatusIndicator && profileData.status && (
                        <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-3 border-white dark:border-gray-800 shadow-sm ${getStatusIndicatorVariant(profileData.status)}`}></div>
                    )}
                </div>

       
                <div className={`text-center ${variant === 'compact' ? 'mb-4' : 'mb-6'}`}>
                    <h2 className={`${variant === 'compact' ? 'text-lg' : 'text-lg'} font-bold text-gray-900 dark:text-white mb-2`}>
                        {profileData.name}
                    </h2>
                      <div className="flex items-center items-center justify-center gap-2">
                   {profileData.title && (
                        <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                            {profileData.title}
                        </span>
                    )}
                    {profileData.specialty && (
                        <span className="inline-block px-3 py-1 text-sm font-medium text-purple-600 bg-purple-100 rounded-full dark:bg-purple-900 dark:text-purple-300">
                            {profileData.specialty}
                        </span>
                    )}
                      {profileData.status && (
                        <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getProfileStatusBadgeVariant(profileData.status)}`}>
                        {profileData.status}
                    </span>
                    )}
                   </div>
                </div>

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
                 {/* Resume Section */}
                 {showDocuments && profileData.documents && Array.isArray(profileData.documents) && getResumesToShow().length > 0 && (
                    <div className="w-full mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className={`${variant === 'compact' ? 'text-base' : 'text-lg'} font-bold text-gray-900 dark:text-white`}>
                                Resume
                            </h4>
                            {profileData.documents.filter(doc => 
                                doc.type?.toLowerCase().includes('resume') || 
                                doc.type?.toLowerCase().includes('cv') ||
                                doc.fileName?.toLowerCase().includes('resume') ||
                                doc.fileName?.toLowerCase().includes('cv')
                            ).length > 3 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                        {profileData.documents.filter(doc => 
                                            doc.type?.toLowerCase().includes('resume') || 
                                            doc.type?.toLowerCase().includes('cv') ||
                                            doc.fileName?.toLowerCase().includes('resume') ||
                                            doc.fileName?.toLowerCase().includes('cv')
                                        ).length} files
                                    </span>
                                    {!showAllResumes ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAllResumes(true)}
                                            className="text-xs h-7 px-3 border-blue-200 text-blue-600 dark:border-blue-700 dark:text-blue-400"
                                        >
                                            View All
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAllResumes(false)}
                                            className="text-xs h-7 px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            Collapse
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className={getContainerClasses(showAllResumes, profileData.documents.filter(doc => 
                            doc.type?.toLowerCase().includes('resume') || 
                            doc.type?.toLowerCase().includes('cv') ||
                            doc.fileName?.toLowerCase().includes('resume') ||
                            doc.fileName?.toLowerCase().includes('cv')
                        ).length)}>
                            {getResumesToShow().map((document, index) => (
                                <div 
                                    key={`resume-${document.id || 'doc'}-${index}`} 
                                    className="flex items-center p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
                                    onClick={() => window.open(document.url, '_blank')}
                                >
                                    <div className="w-7 h-7 rounded-sm flex items-center justify-center mr-3 bg-primary  transition-all duration-200 shadow-sm">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                                            {document.type}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {document.fileName}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-2">
                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                                            CV
                                        </span>
                                        <div className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 group-hover:scale-110 transition-transform duration-200">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {showAllResumes && profileData.documents.filter(doc => 
                            doc.type?.toLowerCase().includes('resume') || 
                            doc.type?.toLowerCase().includes('cv') ||
                            doc.fileName?.toLowerCase().includes('resume') ||
                            doc.fileName?.toLowerCase().includes('cv')
                        ).length > 5 && (
                            <div className="mt-3 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Scroll to view all resumes
                                </p>
                            </div>
                        )}
                        
                        {!showAllResumes && profileData.documents.filter(doc => 
                            doc.type?.toLowerCase().includes('resume') || 
                            doc.type?.toLowerCase().includes('cv') ||
                            doc.fileName?.toLowerCase().includes('resume') ||
                            doc.fileName?.toLowerCase().includes('cv')
                        ).length > 3 && (
                            <div className="mt-3 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Showing 3 of {profileData.documents.filter(doc => 
                                        doc.type?.toLowerCase().includes('resume') || 
                                        doc.type?.toLowerCase().includes('cv') ||
                                        doc.fileName?.toLowerCase().includes('resume') ||
                                        doc.fileName?.toLowerCase().includes('cv')
                                    ).length} resumes
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Documents Section */}
                {showDocuments && profileData.documents && Array.isArray(profileData.documents) && getDocumentsToShow().length > 0 && (
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className={`${variant === 'compact' ? 'text-base' : 'text-lg'} font-bold text-gray-900 dark:text-white`}>
                                Documents
                            </h4>
                            {profileData.documents.filter(doc => 
                                !doc.type?.toLowerCase().includes('resume') && 
                                !doc.type?.toLowerCase().includes('cv') &&
                                !doc.fileName?.toLowerCase().includes('resume') &&
                                !doc.fileName?.toLowerCase().includes('cv')
                            ).length > 3 && (
                                <div className="flex items-center">
                                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                                        {profileData.documents.filter(doc => 
                                            !doc.type?.toLowerCase().includes('resume') && 
                                            !doc.type?.toLowerCase().includes('cv') &&
                                            !doc.fileName?.toLowerCase().includes('resume') &&
                                            !doc.fileName?.toLowerCase().includes('cv')
                                        ).length} files
                                    </span>
                                    {!showAllDocuments ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAllDocuments(true)}
                                             className="text-xs h-7 px-3 border-blue-200 text-blue-600 dark:border-blue-700 dark:text-blue-400"
                                        >
                                            View All
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAllDocuments(false)}
                                            className="text-xs h-7 px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            Collapse
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className={getContainerClasses(showAllDocuments, profileData.documents.filter(doc => 
                            !doc.type?.toLowerCase().includes('resume') && 
                            !doc.type?.toLowerCase().includes('cv') &&
                            !doc.fileName?.toLowerCase().includes('resume') &&
                            !doc.fileName?.toLowerCase().includes('cv')
                        ).length)}>
                            {getDocumentsToShow().map((document, index) => (
                                <div 
                                    key={`doc-${document.id || 'doc'}-${index}`} 
                                    className="flex items-center p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
                                    onClick={() => window.open(document.url, '_blank')}
                                >
                                    <div className="w-7 h-7 rounded-sm flex items-center justify-center mr-3 bg-primary transition-all duration-200 shadow-sm">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200 truncate">
                                            {document.type}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {document.fileName}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-2">
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                                            PDF
                                        </span>
                                        <div className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 group-hover:scale-110 transition-transform duration-200">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {showAllDocuments && profileData.documents.filter(doc => 
                            !doc.type?.toLowerCase().includes('resume') && 
                            !doc.type?.toLowerCase().includes('cv') &&
                            !doc.fileName?.toLowerCase().includes('resume') &&
                            !doc.fileName?.toLowerCase().includes('cv')
                        ).length > 5 && (
                            <div className="mt-3 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Scroll to view all documents
                                </p>
                            </div>
                        )}
                        
                        {!showAllDocuments && profileData.documents.filter(doc => 
                            !doc.type?.toLowerCase().includes('resume') && 
                            !doc.type?.toLowerCase().includes('cv') &&
                            !doc.fileName?.toLowerCase().includes('resume') &&
                            !doc.fileName?.toLowerCase().includes('cv')
                        ).length > 3 && (
                            <div className="mt-3 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Showing 3 of {profileData.documents.filter(doc => 
                                        !doc.type?.toLowerCase().includes('resume') && 
                                        !doc.type?.toLowerCase().includes('cv') &&
                                        !doc.fileName?.toLowerCase().includes('resume') &&
                                        !doc.fileName?.toLowerCase().includes('cv')
                                    ).length} documents
                                </p>
                            </div>
                        )}
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
