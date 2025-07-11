"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BackArrowIcon } from '../icons';
import useGoBack from '@/hooks/useGoBack';

interface BackToListButtonProps {
    href?: string;
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    preserveState?: boolean; 
}

export default function BackToListButton({ 
    href, 
    className = "", 
    children = "Back", 
    onClick,
    preserveState = false 
}: BackToListButtonProps) {
    const router = useRouter();
    const goBackWithState = useGoBack({ 
        preserveJobSeekersState: preserveState && href === '/admin/job-seekers',
        preserveEmployersState: preserveState && href === '/admin/employers',
        preserveApplicationsState: preserveState && href === '/admin/applications',
        preserveJobsState: preserveState && href === '/admin/jobs',
        fallbackPath: href || '/'
    });
    
    const baseClasses = "inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-colors";
    
    const combinedClasses = `${baseClasses} ${className}`;

    const getPreservedJobSeekersURL = () => {
        if (typeof window === 'undefined') return '/admin/job-seekers';
        
        const savedState = localStorage.getItem('jobseeker-search-state');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                const params = new URLSearchParams();
                
                if (state.page && state.page > 1) params.set('page', state.page.toString());
                if (state.limit && state.limit !== 100) params.set('limit', state.limit.toString());
                if (state.search) params.set('search', encodeURIComponent(state.search));
                if (state.location) params.set('location', state.location);
                if (state.occupationId) params.set('occupationId', state.occupationId.toString());
                if (state.status) params.set('status', state.status);
                
                return params.toString() ? `/admin/job-seekers?${params.toString()}` : '/admin/job-seekers';
            } catch (error) {
                console.error('Error parsing saved state:', error);
            }
        }
        return '/admin/job-seekers';
    };

    const getPreservedEmployersURL = () => {
        if (typeof window === 'undefined') return '/admin/employers';
        
        const savedState = localStorage.getItem('employerListState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                const params = new URLSearchParams();
                
                if (state.filters) {
                    if (state.filters.page && state.filters.page > 1) params.set('page', state.filters.page.toString());
                    if (state.filters.limit && state.filters.limit !== 100) params.set('limit', state.filters.limit.toString());
                    if (state.filters.name) params.set('name', encodeURIComponent(state.filters.name));
                    if (state.filters.location) params.set('location', state.filters.location);
                    if (state.filters.status) params.set('status', state.filters.status);
                }
                
                return params.toString() ? `/admin/employers?${params.toString()}` : '/admin/employers';
            } catch (error) {
                console.error('Error parsing saved state:', error);
            }
        }
        return '/admin/employers';
    };

    const getPreservedApplicationsURL = () => {
        if (typeof window === 'undefined') return '/admin/applications';
        
        const savedState = localStorage.getItem('jobApplicationsListState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                const params = new URLSearchParams();
                
                if (state.filters) {
                    if (state.filters.page && state.filters.page > 1) params.set('page', state.filters.page.toString());
                    if (state.filters.limit && state.filters.limit !== 100) params.set('limit', state.filters.limit.toString());
                    if (state.filters.name) params.set('name', encodeURIComponent(state.filters.name));
                    if (state.filters.location) params.set('location', state.filters.location);
                    if (state.filters.companyName) params.set('companyName', encodeURIComponent(state.filters.companyName));
                    if (state.filters.status) params.set('status', state.filters.status);
                }
                
                return params.toString() ? `/admin/applications?${params.toString()}` : '/admin/applications';
            } catch (error) {
                console.error('Error parsing saved state:', error);
            }
        }
        return '/admin/applications';
    };

    const getPreservedJobsURL = () => {
        if (typeof window === 'undefined') return '/admin/jobs';
        
        const savedState = localStorage.getItem('jobsAdminListState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                const params = new URLSearchParams();
                
                if (state.filters) {
                    if (state.filters.page && state.filters.page > 1) params.set('page', state.filters.page.toString());
                    if (state.filters.limit && state.filters.limit !== 100) params.set('limit', state.filters.limit.toString());
                    if (state.filters.name) params.set('name', encodeURIComponent(state.filters.name));
                    if (state.filters.state) params.set('state', state.filters.state);
                    if (state.filters.jobStatus) params.set('jobStatus', state.filters.jobStatus);
                    if (state.filters.datePosted) params.set('datePosted', state.filters.datePosted);
                    if (state.filters.occupationId) params.set('occupationId', state.filters.occupationId.toString());
                    if (state.filters.specialtyId) params.set('specialtyId', state.filters.specialtyId.toString());
                }
                
                return params.toString() ? `/admin/jobs?${params.toString()}` : '/admin/jobs';
            } catch (error) {
                console.error('Error parsing saved state:', error);
            }
        }
        return '/admin/jobs';
    };

    const iconSvg = <BackArrowIcon className="w-4 h-4 mr-2" />;

    const content = (
        <>
            {iconSvg}
            {children}
        </>
    );

    if (href) {
        let finalHref = href;
        if (preserveState) {
            if (href === '/admin/job-seekers') {
                finalHref = getPreservedJobSeekersURL();
            } else if (href === '/admin/employers') {
                finalHref = getPreservedEmployersURL();
            } else if (href === '/admin/applications') {
                finalHref = getPreservedApplicationsURL();
            } else if (href === '/admin/jobs') {
                finalHref = getPreservedJobsURL();
            }
        }
            
        return (
            <Link href={finalHref} className={combinedClasses}>
                {content}
            </Link>
        );
    }
    const initClick = () => {
        if (onClick) {
            onClick();
        } else if (preserveState && (href === '/admin/job-seekers' || href === '/admin/employers' || href === '/admin/applications' || href === '/admin/jobs')) {
            // Set preservation flags when navigating back
            if (typeof window !== 'undefined') {
                if (href === '/admin/job-seekers') {
                    sessionStorage.setItem('jobseeker-preserve-state', 'true');
                } else if (href === '/admin/employers') {
                    sessionStorage.setItem('employer-preserve-state', 'true');
                } else if (href === '/admin/applications') {
                    sessionStorage.setItem('jobApplications-preserve-state', 'true');
                } else if (href === '/admin/jobs') {
                    sessionStorage.setItem('jobsAdmin-preserve-state', 'true');
                }
            }
            goBackWithState();
        } else {
            router.back();
        }
    };

    return (
        <button onClick={initClick} className={combinedClasses}>
            {content}
        </button>
    );
}
