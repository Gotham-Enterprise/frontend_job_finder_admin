"use client";

interface JobDescriptionCardProps {
    jobDescription: string;
}

export default function JobDescriptionCard({ jobDescription }: JobDescriptionCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Description</h3>
            <div 
                className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: jobDescription }}
            />
        </div>
    );
}
