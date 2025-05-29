"use client";

interface ContactInfoProps {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
}

export default function ContactInfo({ address, city, state, country }: ContactInfoProps) {
    const hasLocationInfo = address || city || state || country;

    if (!hasLocationInfo) {
        return (
            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Location Information</h3>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-400 text-center">No location information available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Location Information</h3>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                <div className="space-y-3">
                    {address && (
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 text-red-500 mt-0.5">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Address</p>
                                <p className="text-gray-700 dark:text-gray-300">{address}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 text-red-500 mt-0.5">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Location</p>
                            <p className="text-gray-700 dark:text-gray-300">
                                {[city, state, country].filter(Boolean).join(', ') || 'Not specified'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
