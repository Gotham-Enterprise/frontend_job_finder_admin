"use client";

import { useState } from "react";
import ProfileCard from "@/components/ui/ProfileCard";
import { ProfileData, ContactInfo } from "@/services/types/ProfileCard";
import { JobSeekerDetails } from "@/services/types/jobSeeker";
import { DeactivateUserModal, DeactivationHistoryModal } from "../../components";
import { TrashBinIcon, DocsIcon } from "@/icons";
import { useToast } from "@/context/ToastContext";

interface JobSeekerProfileCardProps {
  jobSeeker: JobSeekerDetails;
  contactInfo: Array<{
    label: string;
    value: string;
    className: string;
  }>;
}

export default function JobSeekerProfileCard({ jobSeeker, contactInfo }: JobSeekerProfileCardProps) {
  const [deactivateModal, setDeactivateModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
  });
  
  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
  });

  const { addToast } = useToast();

  const openDeactivateModal = () => {
    setDeactivateModal({
      isOpen: true,
      userId: jobSeeker.id,
      userName: jobSeeker.name,
    });
  };

  const closeDeactivateModal = () => {
    setDeactivateModal({
      isOpen: false,
      userId: '',
      userName: '',
    });
  };

  const openHistoryModal = () => {
    setHistoryModal({
      isOpen: true,
      userId: jobSeeker.id,
      userName: jobSeeker.name,
    });
  };

  const closeHistoryModal = () => {
    setHistoryModal({
      isOpen: false,
      userId: '',
      userName: '',
    });
  };

  const handleDeactivateSuccess = () => {
    // Refresh the page or redirect back to list
    window.location.reload();
  };

  const profileData: ProfileData = {
    name: jobSeeker.name,
    title: jobSeeker.professionalBackground?.[0]?.jobTitle || "Job Seeker",
    status: jobSeeker.status,
    email: jobSeeker.email,
    profilePicture: jobSeeker.profilePicture
      ? {
          url: jobSeeker.profilePicture.url,
        }
      : undefined,
    documents: jobSeeker.documents,
  };

  const transformedContactInfo: ContactInfo[] = contactInfo.map((info) => ({
    label: info.label,
    value: info.value,
    className: info.className,
  }));

  return (
    <>
      <ProfileCard
        profileData={profileData}
        contactInfo={transformedContactInfo}
        showStatusIndicator={true}
        showDocuments={true}
        showContactInfo={true}
        className="mb-6"
        avatarSize="lg"
        variant="default"
      />
      
      {/* Action Buttons */}
      <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={openHistoryModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <DocsIcon className="w-4 h-4" />
            View History
          </button>
          
          {jobSeeker.status === 'active' && (
            <button
              onClick={openDeactivateModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <TrashBinIcon className="w-4 h-4" />
              Deactivate Account
            </button>
          )}
        </div>
      </div>

      {/* Deactivate Modal */}
      <DeactivateUserModal
        isOpen={deactivateModal.isOpen}
        onClose={closeDeactivateModal}
        userId={deactivateModal.userId}
        userName={deactivateModal.userName}
        onSuccess={handleDeactivateSuccess}
      />

      {/* History Modal */}
      <DeactivationHistoryModal
        isOpen={historyModal.isOpen}
        onClose={closeHistoryModal}
        userId={historyModal.userId}
        userName={historyModal.userName}
      />
    </>
  );
}
