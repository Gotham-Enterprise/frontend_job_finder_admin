"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useJobApplicationDetails } from "@/services/hooks/useJobApplications";
import { formatDateTimeEST } from "@/services/utils/dateUtils";
import { openFileInNewTab } from "@/services/utils/fileUtils";
import { sanitizeJobDescriptionHtml } from "@/services/utils/htmlUtils";
import { getEmployerJobUrl } from "@/services/utils/employerUtils";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import ErrorState from "@/components/common/ErrorState";
import BackToListButton from "@/components/ui/BackToListButton";
import ProfileCard from "@/components/ui/ProfileCard";
import { Accordion } from "@/components/ui/accordion";
import Link from "next/link";

interface ViewDetailsProps {
  id?: string;
}

export default function JobApplicationDetails({ id }: ViewDetailsProps) {
  const params = useParams();
  const applicationId = id || (params?.id as string);

  const { data, isLoading, error } = useJobApplicationDetails(applicationId);

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading application details..." />;
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/applications" className="mb-6" preserveState={true}>
          Back to Applications
        </BackToListButton>
        <ErrorState message={`Error loading application details: ${error.message}`} />
      </div>
    );
  }

  if (!data?.success || !data?.data) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/applications" className="mb-6" preserveState={true}>
          Back to Applications
        </BackToListButton>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Application not found</p>
        </div>
      </div>
    );
  }

  const application = data.data;

  const handleViewResume = () => {
    if (application.resumeUrl) {
      openFileInNewTab(application.resumeUrl, application.resumeFilename);
    }
  };

  const contactInfo = [
    {
      label: "Company",
      value: application.companyName,
      className: "text-gray-900 dark:text-white",
    },
    {
      label: "Job Title",
      value: application.jobTitle,
      className: "text-gray-900 dark:text-white",
      href: application.jobId ? getEmployerJobUrl(application.jobId) : undefined,
    },
    {
      label: "Location",
      value: `${application.jobLocationCity}, ${application.jobLocationState}`,
      className: "text-gray-900 dark:text-white",
    },
    {
      label: "Application Date",
      value: (() => {
        const applicationDate = formatDateTimeEST(application.applicationDate);
        if (typeof applicationDate === "string") {
          return applicationDate;
        }
        return `${applicationDate.date} ${applicationDate.time}`;
      })(),
      className: "text-gray-900 dark:text-white",
    },
  ];

  console.log({ application });

  const profileData = {
    name: application.name,
    title: application.jobTitle,
    status: application.status,
    avatarUrl: application.avatarUrl,
    email: application.email,
    documents: application.documents,
  };

  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/applications" preserveState={true}>
          Back to Applications
        </BackToListButton>
      </div>

      <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
        <div className="col-span-full xl:col-auto">
          <ProfileCard profileData={profileData} contactInfo={contactInfo} />
        </div>

        <div className="col-span-2 min-w-0 space-y-6">
          <div className="rounded-xl bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Application Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Job Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Company:</span>
                    <p className="text-gray-900 dark:text-white">{application.companyName}</p>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Job Title:</span>
                    {application.jobId ? (
                      <Link
                        href={getEmployerJobUrl(application.jobId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        {application.jobTitle}
                      </Link>
                    ) : (
                      <p className="text-gray-900 dark:text-white">{application.jobTitle}</p>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                    <p className="text-gray-900 dark:text-white">
                      {application.jobLocationCity}, {application.jobLocationState}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <p className="text-gray-900 dark:text-white">{application.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employer Questions Section */}
          {application.employerQuestion && application.employerQuestion.length > 0 && (
            <div className="rounded-xl bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Employer Questions</h2>
              <Accordion
                items={application.employerQuestion.map((item, index) => {
                  const formatAnswer = (answer: string) => {
                    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
                    if (dateRegex.test(answer)) {
                      const formattedDate = formatDateTimeEST(answer);
                      if (typeof formattedDate === "string") {
                        return { type: "text" as const, content: formattedDate };
                      }
                      return {
                        type: "date" as const,
                        content: {
                          date: formattedDate.date,
                          time: formattedDate.time,
                        },
                      };
                    }
                    return { type: "text" as const, content: answer };
                  };

                  const formattedAnswer = formatAnswer(item.answers);

                  return {
                    id: `question-${index}`,
                    trigger: <span className="font-medium text-gray-900 dark:text-white">{item.question}</span>,
                    content: (
                      <div className="text-gray-700 dark:text-gray-300 mt-2">
                        {formattedAnswer.type === "date" ? (
                          <>
                            <div>{(formattedAnswer.content as { date: string; time: string }).date}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {(formattedAnswer.content as { date: string; time: string }).time}
                            </div>
                          </>
                        ) : (
                          (formattedAnswer.content as string)
                        )}
                      </div>
                    ),
                  };
                })}
                type="single"
                collapsible={true}
                defaultValue="question-0"
                className="mt-4"
              />
            </div>
          )}

          {/* Job Description Section */}
          {application.jobDescription && (
            <div className="rounded-xl bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Job Description</h2>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 break-words [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800"
                dangerouslySetInnerHTML={{
                  __html: sanitizeJobDescriptionHtml(application.jobDescription),
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
