"use client";
import React from 'react';
import { formatDate } from '@/services/utils/dateUtils';
import { ApplicantAdditionalInfoData, ApplicantAdditionalInfoProps } from '@/services/types/applicant';

type FieldConfig = {
    label: string;
    value?: string | null;
    format?: boolean;
};

type InfoFieldProps = {
    label: string;
    value?: string | null;
};

const InfoField = ({ label, value }: InfoFieldProps) => {
    if (!value) return null;
    
    return (
        <div className="flex flex-col sm:flex-row sm:items-baseline mb-2">
            <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">{label}:</span>
            <span className="text-gray-900 dark:text-gray-100 ml-0 sm:ml-2">{value}</span>
        </div>
    );
};

const renderFieldGroup = (fields: FieldConfig[]) => {
    return fields.map((field, index) => (
        <InfoField 
            key={index} 
            label={field.label} 
            value={field.format && field.value ? formatDate(field.value) : field.value} 
        />
    ));
};

const getAddressFields = (applicant: ApplicantAdditionalInfoData): FieldConfig[] => [
    { label: 'Address', value: applicant.address },
    { label: 'City', value: applicant.city },
    { label: 'State', value: applicant.state },
    { label: 'ZIP Code', value: applicant.zipCode },
    { label: 'Country', value: applicant.country }
];


const getTimelineFields = (applicant: ApplicantAdditionalInfoData): FieldConfig[] => [
    { label: 'Applied', value: applicant.dateApplied || applicant.appliedAt, format: true },
    { label: 'Joined', value: applicant.dateJoined, format: true },
    { label: 'Last Updated', value: applicant.updatedAt, format: true },
    { label: 'Available From', value: applicant.availabilityDate, format: true }
];

const getProfessionalFields = (applicant: ApplicantAdditionalInfoData): FieldConfig[] => [
    { label: 'Job Title', value: applicant.jobTitle },
    { label: 'Company', value: applicant.companyName },
    { label: 'State Licenses', value: applicant.stateLicenses },
    { label: 'Work Authorization', value: applicant.workAuthorization },
    { label: 'References', value: applicant.references }
];

export default function ApplicantAdditionalInfo({ applicant }: ApplicantAdditionalInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Additional Information</h2>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Address Details
                    </h3>
                    <div className="pl-2">
                        {renderFieldGroup(getAddressFields(applicant))}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Application Timeline
                    </h3>
                    <div className="pl-2">
                        {renderFieldGroup(getTimelineFields(applicant))}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Professional Information
                    </h3>
                    <div className="pl-2">
                        {renderFieldGroup(getProfessionalFields(applicant))}
                    </div>
                </div>
            </div>
        </div>
    );
}
