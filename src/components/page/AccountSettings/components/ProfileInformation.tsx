'use client';

import Button from '@/components/ui/button/Button';
import { User } from '@/services/types/auth';
import { PencilIcon } from '@/icons';
import { FC } from 'react';

interface ProfileInformationProps {
    user: User | null;
    onEdit: () => void;
    userInitials: string;
    displayName: string;
}

const ProfileInformation: FC<ProfileInformationProps> = ({
    user,
    onEdit,
    userInitials,
    displayName
}) => {
    const contactInfo = [
        {
            label: 'Full Name',
            value: displayName || 'Not available',
            className: 'text-gray-900 dark:text-white'
        },
        {
            label: 'Email',
            value: user?.email || 'Not available',
            className: 'text-blue-600 dark:text-blue-400'
        },
        {
            label: 'Role',
            value: user?.role || 'Not available',
            className: 'text-purple-600 dark:text-purple-400'
        },
        {
            label: 'Status',
            value: user?.status || 'inactive',
            className: `${user?.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`
        }
    ];

    return (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>                  
                <Button
                    onClick={onEdit}
                    variant="ghost"
                    size="sm"
                    className="whitespace-nowrap px-4 py-2 dark:text-white text-primary flex items-center"
                >
                    <PencilIcon className="flex-shrink-0" />
                    Edit Profile
                </Button>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {userInitials || '?'}
                        </span>
                    </div>
                </div>

                <div className="w-full space-y-3">
                    {contactInfo.map((info, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{info.label}</span>
                            <span className={`text-sm font-semibold ${info.className}`}>{info.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileInformation;
