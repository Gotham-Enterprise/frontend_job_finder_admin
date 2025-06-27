"use client";

import { Skill } from "@/services/types/jobSeeker";

interface SkillsProps {
    skills?: Skill[];
}

export default function Skills({ skills }: SkillsProps) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-6">
              
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h3>
            </div>            {skills && skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <span 
                            key={skill.id} 
                            className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300"
                        >
                            {skill.skillName}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center">No skills information available</p>
            )}
        </div>
    );
}
