"use client";

import { Skill } from "@/services/types/jobSeeker";

interface SkillsProps {
    skills?: Skill[];
}

export default function Skills({ skills }: SkillsProps) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-6">
              
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Skills & Expertise</h3>
            </div>
              {skills && skills.length > 0 ? (
                <ul className="space-y-3">
                    {skills.map((skill) => (
                        <li key={skill.id} className="flex items-center">
                            <div className="w-1 h-1 bg-gray-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{skill.skillName}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center">No skills information available</p>
            )}
        </div>
    );
}
