"use client";
import React from "react";
import Link from "next/link";
import { formatDate } from "@/services/utils/dateUtils";

// Sample job data - this would come from an API in real implementation
const getSampleJobData = (id: string) => ({
  id,
  title: "Senior Frontend Developer",
  companyName: "Tech Innovations Inc.",
  employmentType: "Full-time",
  salaryRange: "$80,000 - $120,000",
  location: "San Francisco, CA",
  experienceLevel: "Senior Level",
  status: "Active",
  description: "We are seeking a highly skilled Senior Frontend Developer to join our dynamic team. The ideal candidate will have extensive experience with React, TypeScript, and modern frontend development practices. You will be responsible for building responsive, user-friendly web applications and collaborating with cross-functional teams to deliver high-quality software solutions.",
  requirements: [
    "5+ years of experience in frontend development",
    "Proficiency in React, TypeScript, and JavaScript",
    "Experience with modern CSS frameworks (Tailwind, Styled Components)",
    "Knowledge of state management libraries (Redux, Zustand)",
    "Familiarity with testing frameworks (Jest, React Testing Library)",
    "Strong understanding of responsive design principles"
  ],
  benefits: [
    "Competitive salary and equity package",
    "Comprehensive health, dental, and vision insurance",
    "Flexible working hours and remote work options",
    "Professional development budget",
    "401(k) with company matching",
    "Unlimited PTO policy"
  ],
  postedDate: "2024-12-15",
  applicationDeadline: "2025-01-15"
});

// Sample applicant data
const getSampleApplicants = () => [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    appliedDate: "2024-12-20",
    status: "Under Review",
    experience: "6 years",
    location: "San Francisco, CA"
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    appliedDate: "2024-12-19",
    status: "Interview Scheduled",
    experience: "8 years",
    location: "Remote"
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    appliedDate: "2024-12-18",
    status: "Rejected",
    experience: "4 years",
    location: "Oakland, CA"
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    appliedDate: "2024-12-17",
    status: "Shortlisted",
    experience: "7 years",
    location: "Berkeley, CA"
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david.wilson@email.com",
    appliedDate: "2024-12-16",
    status: "Under Review",
    experience: "5 years",
    location: "San Jose, CA"
  }
];

interface ViewDetailsProps {
    id: string;
}

export default function ViewDetails({ id }: ViewDetailsProps) {
    const jobData = getSampleJobData(id);
    const applicants = getSampleApplicants();

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'under review':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'interview scheduled':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'shortlisted':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'hired':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getJobStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'closed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'paused':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <>            <div className="px-4 pt-4 pb-2">
                <Link 
                    href="/admin/jobs"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Jobs
                </Link>
            </div>

            <div className="p-6 space-y-6">
                {/* Job Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {jobData.title}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                                {jobData.companyName}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getJobStatusVariant(jobData.status)}`}>
                                {jobData.status}
                            </span>
                            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                {jobData.employmentType}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Job Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Company Details */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Employment Type</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{jobData.employmentType}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Salary Range</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{jobData.salaryRange}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{jobData.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Experience Level</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{jobData.experienceLevel}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Job Summary */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Summary</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                {jobData.description}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Requirements</h4>
                                    <ul className="space-y-2">
                                        {jobData.requirements.map((req, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Benefits</h4>
                                    <ul className="space-y-2">
                                        {jobData.benefits.map((benefit, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                                </svg>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Applicants Table */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Applicants ({applicants.length})
                                </h3>
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {applicants.map((applicant) => (
                                    <div key={applicant.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {applicant.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                                                    {applicant.email}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusVariant(applicant.status)}`}>
                                                    {applicant.status}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Experience:</span>
                                                <span className="text-xs text-gray-900 dark:text-white">
                                                    {applicant.experience}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Location:</span>
                                                <span className="text-xs text-gray-900 dark:text-white">
                                                    {applicant.location}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Applied:</span>
                                                <span className="text-xs text-gray-900 dark:text-white">
                                                    {formatDate(applicant.appliedDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {applicants.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Applications will appear here when received</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
