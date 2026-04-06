"use client";
import React, { useState } from "react";
import { useJobSeekerDetails } from "@/services/hooks/useJobSeekers";
import { formatDate, formatDateTimeEST } from "@/services/utils/dateUtils";
import ErrorState from "../../../common/ErrorState";
import FullScreenSpinner from "../../../ui/FullScreenSpinner";
import {
  ProfileCard,
  WorkExperience,
  PersonalSummary,
  EducationBackground,
  Certifications,
  Languages,
  Skills,
  PermanentDeletion,
} from "./components";
import { DeactivateUserModal, DeactivationHistoryModal } from "../components";
import BackToListButton from "@/components/ui/BackToListButton";
import { DocsIcon } from "@/icons";
import { MdOutlineLock } from "react-icons/md";
import PermissionWrapper from "@/components/common/PermissionWrapper";
import AdminCreateApplicationModal from "@/components/admin/AdminCreateApplicationModal";
interface ViewDetailsProps {
  id: string;
}

export default function ViewDetails({ id }: ViewDetailsProps) {
  const { data, isLoading, error } = useJobSeekerDetails(id);

  const [deactivateModal, setDeactivateModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: "",
    userName: "",
  });

  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: "",
    userName: "",
  });

  const [isCreateAppModalOpen, setIsCreateAppModalOpen] = useState(false);

  const openDeactivateModal = () => {
    if (data?.data) {
      setDeactivateModal({
        isOpen: true,
        userId: data.data.id,
        userName: data.data.name,
      });
    }
  };

  const closeDeactivateModal = () => {
    setDeactivateModal({
      isOpen: false,
      userId: "",
      userName: "",
    });
  };

  const openHistoryModal = () => {
    if (data?.data) {
      setHistoryModal({
        isOpen: true,
        userId: data.data.id,
        userName: data.data.name,
      });
    }
  };

  const closeHistoryModal = () => {
    setHistoryModal({
      isOpen: false,
      userId: "",
      userName: "",
    });
  };

  const handleDeactivateSuccess = () => {
    // Refresh the page or redirect back to list
    window.location.reload();
  };

  const getProficiencyLabel = (proficiency: string) => {
    if (!proficiency || proficiency.trim() === "" || proficiency.toLowerCase() === "null") {
      return "Not specified";
    }

    switch (proficiency.toLowerCase()) {
      case "basic":
        return "Basic";
      case "intermediate":
        return "Intermediate";
      case "advanced":
        return "Advanced";
      case "native":
        return "Native";
      case "fluent":
        return "Fluent";
      case "conversational":
        return "Conversational";
      case "beginner":
        return "Beginner";
      case "elementary":
        return "Elementary";
      case "proficient":
        return "Proficient";
      default:
        return proficiency.charAt(0).toUpperCase() + proficiency.slice(1).toLowerCase();
    }
  };

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading job seeker details..." />;
  }
  if (error) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/job-seekers" className="mb-6" preserveState={true}>
          Back to Job Seekers
        </BackToListButton>
        <ErrorState message={`Error loading job seeker details: ${error.message}`} />
      </div>
    );
  }
  if (!data?.success || !data?.data) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/job-seekers" className="mb-6" preserveState={true}>
          Back to Job Seekers
        </BackToListButton>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Job seeker not found</p>
        </div>
      </div>
    );
  }

  const jobSeeker = data.data;

  const contactInfo = [
    {
      label: "Phone",
      value: jobSeeker.phoneNumber || "Not provided",
      className: "text-gray-900 dark:text-white",
    },
    {
      label: "Email",
      value: jobSeeker.email,
      className: "text-gray-900 dark:text-white break-all",
    },
    {
      label: "Location",
      value: [jobSeeker.city, jobSeeker.state].filter(Boolean).join(", ") || "Not specified",
      className: "text-gray-900 dark:text-white text-right",
    },
    {
      label: "Experience",
      value: `${jobSeeker.professionalBackground?.length || 0} ${jobSeeker.professionalBackground?.length === 1 ? "Year" : "Year(s)"}`,
      className: "text-gray-900 dark:text-white",
    },
    {
      label: "Joined",
      value: formatDate(jobSeeker.joined),
      className: "text-gray-900 dark:text-white",
    },
    {
      label: "Last Active",
      value: (() => {
        const lastActivity = formatDateTimeEST(jobSeeker.lastActivity);
        if (typeof lastActivity === "string") {
          return lastActivity;
        }
        return `${lastActivity.date} ${lastActivity.time}`;
      })(),
      className: "text-gray-900 dark:text-white",
    },
  ];

  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <BackToListButton href="/admin/job-seekers" preserveState={true}>
            Back to Job Seekers
          </BackToListButton>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* <button
              onClick={openHistoryModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <DocsIcon className="w-4 h-4" />
              View History
            </button> */}

            <button
              onClick={() => setIsCreateAppModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30 rounded-lg transition-colors"
            >
              Create Application
            </button>

            {jobSeeker.status === "active" && (
              <PermissionWrapper module="jobseekers" action="edit">
                <button
                  onClick={openDeactivateModal}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                >
                  <MdOutlineLock className="w-4 h-4 text-yellow-600" />
                  Deactivate Account
                </button>
              </PermissionWrapper>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
        <div className="col-span-full xl:col-auto">
          <ProfileCard jobSeeker={jobSeeker} contactInfo={contactInfo} />
        </div>

        <div className="col-span-2 space-y-6">
          <PersonalSummary personalSummary={jobSeeker.personalSummary} />

          <WorkExperience professionalBackground={jobSeeker.professionalBackground} formatDate={formatDate} />

          <EducationBackground educations={jobSeeker.educations} formatDate={formatDate} />

          <Certifications licenses={jobSeeker.licenses} formatDate={formatDate} />

          <Skills skills={jobSeeker.skills} />

          <Languages languages={jobSeeker.languages} getProficiencyLabel={getProficiencyLabel} />

          <PermissionWrapper module="jobseekers" action="edit">
            <PermanentDeletion
              jobSeekerId={id}
              jobSeekerName={jobSeeker.name}
              jobSeekerEmail={jobSeeker.email}
              isAlreadyDeleted={jobSeeker.status === "deleted" || jobSeeker.isPermanentlyDeleted}
            />
          </PermissionWrapper>
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

      <AdminCreateApplicationModal
        isOpen={isCreateAppModalOpen}
        onClose={() => setIsCreateAppModalOpen(false)}
        onSuccess={() => setIsCreateAppModalOpen(false)}
        preSelectedCandidate={{ id: jobSeeker.id, name: jobSeeker.name }}
      />
    </>
  );
}
