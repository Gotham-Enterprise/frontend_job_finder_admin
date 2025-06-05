import React from 'react';

interface NotFoundStateProps {
    title?: string;
    message?: string;
    className?: string;
}

export default function NotFoundState({ 
    title = "Job not found",
    message = "The requested job could not be found.",
    className = ""
}: NotFoundStateProps) {
    return (
        <div className={`p-6 ${className}`}>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="text-center">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        {title}
                    </h3>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}
