"use client";

import Image from "next/image";
import { EmployerDetails } from "@/services/types/employer";
import { ReactNode } from "react";

interface CompanyProfileProps {
    employer: EmployerDetails;
    contactInfo: Array<{
        label: string;
        value: string | ReactNode;
        className: string;
    }>;
}

export default function CompanyProfile({ employer, contactInfo }: CompanyProfileProps) {
    return (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 sm:p-8">
            <div className="flex flex-col items-center">                <div className="relative mb-6 inline-block">
                    <div className="w-30 h-30 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center border-4 border-blue-100 dark:border-blue-900 shadow-lg">
                        <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                            {employer.companyName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                        </span>
                    </div>
                    <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-3 border-white dark:border-gray-800 shadow-sm ${
                        employer.status === 'active' ? 'bg-green-500' : 
                        employer.status === 'inactive' ? 'bg-gray-400' : 'bg-red-500'
                    }`}></div>
                </div>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{employer.companyName}</h2>
                    <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                        Company
                    </span>
                </div>

                <div className="w-full space-y-4 mb-6">                    {contactInfo.map((info, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{info.label}</span>
                            <div className={`text-sm font-semibold ${info.className}`}>{info.value}</div>
                        </div>
                    ))}                </div>
            </div>
        </div>
    );
}
