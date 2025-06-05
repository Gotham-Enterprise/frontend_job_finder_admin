"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BackArrowIcon } from '../icons';

interface BackToListButtonProps {
    href?: string;
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
}

export default function BackToListButton({ 
    href, 
    className = "", 
    children = "Back", 
    onClick 
}: BackToListButtonProps) {
    const router = useRouter();
    
    const baseClasses = "inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-colors";
    
    const combinedClasses = `${baseClasses} ${className}`;    const iconSvg = <BackArrowIcon className="w-4 h-4 mr-2" />;

    const content = (
        <>
            {iconSvg}
            {children}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={combinedClasses}>
                {content}
            </Link>
        );
    }
    const initClick = () => {
        if (onClick) {
            onClick();
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
