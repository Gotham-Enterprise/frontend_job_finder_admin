"use client";

interface PersonalSummaryProps {
    personalSummary?: string;
}

export default function PersonalSummary({ personalSummary }: PersonalSummaryProps) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">About Me</h3>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {personalSummary || 'No personal summary provided'}
                </p>
        </div>
    );
}
