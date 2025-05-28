"use client";

import { Language } from "@/services/types/jobSeeker";

interface LanguagesProps {
    languages?: Language[];
    getProficiencyLabel: (proficiency: string) => string;
}

export default function Languages({ languages, getProficiencyLabel }: LanguagesProps) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Languages</h3>
            </div>
              {languages && languages.length > 0 ? (
                <div className="space-y-3">
                    {languages.map((language) => (
                        <div key={language.id} className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">{language.languageName}</span>
                                </div>
                                <span className="px-3 py-1 text-xs font-medium text-pink-600 bg-pink-100 rounded-full dark:bg-pink-900 dark:text-pink-300">
                                    {getProficiencyLabel(language.proficiency)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-lg border border-pink-200 dark:border-pink-800">
                    <p className="text-gray-500 dark:text-gray-400 text-center">No language information available</p>
                </div>
            )}
        </div>
    );
}
