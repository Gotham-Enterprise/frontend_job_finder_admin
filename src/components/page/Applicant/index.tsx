"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useApplicantDetails } from "@/services/hooks/useEmployers";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import ErrorState from "@/components/common/ErrorState";
import BackButton from "@/components/ui/BackButton";
import ApplicantProfileCard from "./ApplicantProfileCard";
import ApplicantQuestions from "./ApplicantQuestions";
import ApplicantAdditionalInfo from "./ApplicantAdditionalInfo";
import { jobApplicationApi } from "@/services/api/jobApplication";
import { formatDateCustom } from "@/services/utils/dateUtils";
import { ApplicantDetailsProps } from "@/services/types/applicant";

export default function ApplicantDetails({ id }: ApplicantDetailsProps) {
  const params = useParams();
  const applicantId = id || (params?.id as string);
  const [isViewingResume, setIsViewingResume] = useState(false);

  const { data, isLoading, error } = useApplicantDetails(applicantId);

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading applicant details..." />;
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackButton className="mb-6" />
        <ErrorState message={`Error loading applicant details: ${error.message}`} />
      </div>
    );
  }

  if (!data?.success || !data?.data) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackButton className="mb-6" />
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Applicant not found</p>
        </div>
      </div>
    );
  }

  const applicant = data.data;

  const formattedLocation = [applicant.city, applicant.state].filter(Boolean).join(", ") || "Not specified";

  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const formattedDateJoined = formatDateCustom(applicant.dateJoined, dateFormatOptions);

  const lastActiveDate = applicant.dateApplied ? new Date(applicant.dateApplied) : null;
  const formattedLastActive = lastActiveDate
    ? `${formatDateCustom(applicant.dateApplied, dateFormatOptions)} ${lastActiveDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`
    : "Not specified";

  const enhancedApplicant = {
    ...applicant,
    location: formattedLocation,
    joinedDate: formattedDateJoined,
    lastActiveDate: formattedLastActive,
    coverLetterFilename: applicant.coverLetterFilename,
    introductionFilename: applicant.introductionFilename,
    companyName: applicant.companyName,
    jobTitle: applicant.jobTitle,
    stateLicenses: applicant.stateLicenses,
    resume: applicant.resume
      ? {
          fileUrl: applicant.resume.fileUrl,
          fileName: applicant.resume.filename || "Resume",
          fileObjectKey: applicant.resume.fileObjectKey,
        }
      : undefined,
  };

  const initViewDocument = async (url: string, fileObjectKey?: string, fileName?: string) => {
    if (fileObjectKey) {
      setIsViewingResume(true);
      try {
        const response = await jobApplicationApi.viewResume(fileObjectKey);
        if (response?.success && response?.data?.fileUrl) {
          // Import the file opening utility function that handles DOC files with Google Docs viewer
          const { openFileInNewTab } = await import("../../../services/utils/fileUtils");
          openFileInNewTab(response.data.fileUrl, fileName);
        } else {
          if (url) {
            const { openFileInNewTab } = await import("../../../services/utils/fileUtils");
            openFileInNewTab(url, fileName);
          }
        }
      } catch (error) {
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      } finally {
        setIsViewingResume(false);
      }
    } else {
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
        <div className="col-span-full xl:col-auto">
          <ApplicantProfileCard
            applicant={enhancedApplicant}
            onViewDocument={initViewDocument}
            isViewingResume={isViewingResume}
          />
        </div>
        <div className="col-span-2 space-y-6">
          <ApplicantAdditionalInfo applicant={applicant} />
          <ApplicantQuestions employerQuestions={applicant.employerQuestion || []} />
        </div>
      </div>

      <FullScreenSpinner isVisible={isViewingResume} message="Opening resume..." />
    </>
  );
}
