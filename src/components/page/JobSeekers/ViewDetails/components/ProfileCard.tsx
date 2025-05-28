"use client";

import Image from "next/image";
import { JobSeekerDetails } from "@/services/types/jobSeeker";

interface ProfileCardProps {
    jobSeeker: JobSeekerDetails;
    contactInfo: Array<{
        label: string;
        value: string;
        className: string;
    }>;
}

export default function ProfileCard({ jobSeeker, contactInfo }: ProfileCardProps) {
    return (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 sm:p-8">
            <div className="flex flex-col items-center">
                <div className="relative mb-6 inline-block">
                    {jobSeeker.profilePicture?.url ? (
                        <Image
                            width={120}
                            height={120}
                            src={jobSeeker.profilePicture.url}
                            alt={jobSeeker.name}
                            className="rounded-full object-cover border-4 border-blue-100 dark:border-blue-900 shadow-lg"
                        />
                    ) : (
                        <div className="w-30 h-30 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center border-4 border-blue-100 dark:border-blue-900 shadow-lg">
                            <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                                {jobSeeker.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                            </span>
                        </div>
                    )}
                    <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-3 border-white dark:border-gray-800 shadow-sm ${
                        jobSeeker.status === 'active' ? 'bg-green-500' : 
                        jobSeeker.status === 'inactive' ? 'bg-gray-400' : 'bg-red-500'
                    }`}></div>
                </div>
                
                
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{jobSeeker.name}</h2>
                    <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                        {jobSeeker.professionalBackground?.[0]?.title || 'Job Seeker'}
                    </span>
                </div>

              
                <div className="w-full space-y-4 mb-6">
                    {contactInfo.map((info, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{info.label}</span>
                            <span className={`text-sm font-semibold ${info.className}`}>{info.value}</span>
                        </div>
                    ))}
                </div>

     
                <div className="w-full">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Documents</h4>
                    <div className="space-y-3">
                        {jobSeeker.documents?.length > 0 ? (
                            jobSeeker.documents.map((document, index) => (
                                <div key={document.id} className={`flex items-center p-3 rounded-lg border ${
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
                            ))
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
