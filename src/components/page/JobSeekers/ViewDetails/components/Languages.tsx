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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Languages</h3>
            </div>
              {languages && languages.length > 0 ? (
                <div className="space-y-3">
                    {languages.map((language) => (
                        <div key={language.id}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">{language.languageName}</span>
                                </div>
                                <span className="px-3 py-1 text-xs font-medium text-pink-600 bg-pink-100 rounded-full dark:bg-pink-900 dark:text-pink-300">
                                Proficiency: {getProficiencyLabel(language.proficiency)}
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
