"use client";

interface JobDescriptionCardProps {
    jobDescription: string;
}

export default function JobDescriptionCard({ jobDescription }: JobDescriptionCardProps) {
    // Job descriptions are stored with &nbsp; between words, which prevents
    // the browser from wrapping lines and makes the text overflow the card.
    const normalizedDescription = jobDescription.replace(/&nbsp;| /g, " ");

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Description</h3>
            <div
                className="text-gray-700 dark:text-gray-300 leading-relaxed flex-col gap-10 prose prose-sm max-w-none dark:prose-invert break-words"
                dangerouslySetInnerHTML={{ __html: normalizedDescription }}
            />
        </div>
    );
}
