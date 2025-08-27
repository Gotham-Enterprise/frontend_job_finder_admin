"use client";

import { useState } from "react";
import { JobPost } from "@/services/types/employer";
import { useTeamMembers } from "@/services/hooks/useTeam";
import JobPosts from "./JobPosts";
import Team from "./Team";

interface JobPostsAndTeamTabsProps {
    jobPosts: JobPost[];
    employerId: string;
    formatDate: (date: string | undefined) => string;
}

export default function JobPostsAndTeamTabs({ jobPosts, employerId, formatDate }: JobPostsAndTeamTabsProps) {
    const [activeTab, setActiveTab] = useState<'jobPosts' | 'team'>('jobPosts');
    const { data: teamData, isLoading: teamLoading } = useTeamMembers(employerId);

    const tabs = [
        {
            id: 'jobPosts' as const,
            label: 'Job Posts',
            count: jobPosts.length
        },
        {
            id: 'team' as const,
            label: 'Team',
            count: teamData?.data?.length || 0
        }
    ];

    return (
        <div className="rounded-xl bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            {tab.label}
                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                                activeTab === tab.id
                                    ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                                    : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="p-0">
                {activeTab === 'jobPosts' && (
                    <JobPosts jobPosts={jobPosts} formatDate={formatDate} />
                )}
                
                {activeTab === 'team' && (
                    <>
                        {teamLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading team members...</span>
                            </div>
                        ) : (
                            <Team 
                                teamMembers={teamData?.data || []} 
                                formatDate={formatDate} 
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
