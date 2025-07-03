import { ReactNode } from "react";

export interface ContactInfo {
    label: string;
    value: string;
    className?: string;
    icon?: ReactNode;
}

export interface Document {
    id?: string;
    type: string;
    fileName: string;
    url: string;
    objectKey?: string;
    expiresAt?: string;
}

export interface ProfileData {
    name: string;
    title?: string;
    specialty?: string;
    status?: string;
    profilePicture?: {
        url: string;
    };
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    yearsOfExperience?: number;
    preferredSalary?: string;
    stateLicenses?: string;
    documents?: Document[];
}

export interface ProfileCardProps {
    profileData: ProfileData;
    contactInfo?: ContactInfo[];
    showStatusIndicator?: boolean;
    showDocuments?: boolean;
    showContactInfo?: boolean;
    className?: string;
    avatarSize?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'compact';
}
