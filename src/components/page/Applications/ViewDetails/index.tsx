"use client";
import React, { useState } from "react";
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
import { Modal } from "@/components/ui/modal";
import Link from "next/link";

interface ViewDetailsProps {
  id?: string;
}

export default function JobApplicationDetails({ id }: ViewDetailsProps) {
  const params = useParams();
  const applicationId = id || (params?.id as string);

  const { data, isLoading, error } = useJobApplicationDetails(applicationId);
  const [previewFile, setPreviewFile] = useState<{ url: string; filename: string } | null>(null);

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
                  const isFileType = item.questionType === "Upload File" || item.questionType === "File";
                  const hasFileUrl = isFileType && item.fileUrl;

                  return {
                    id: `question-${index}`,
                    trigger: <span className="font-medium text-gray-900 dark:text-white">{item.question}</span>,
                    content: (
                      <div className="text-gray-700 dark:text-gray-300 mt-2">
                        {hasFileUrl ? (
                          <button
                            onClick={() => setPreviewFile({ url: item.fileUrl!, filename: item.answers || 'Document' })}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Document
                          </button>
                        ) : formattedAnswer.type === "date" ? (
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

      {/* File Preview Modal */}
      {previewFile && (
        <Modal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          isFullscreen={false}
          className="max-w-4xl max-h-[90vh] w-full"
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {previewFile.filename}
            </h3>
            {(() => {
              const ext = previewFile.filename.split('.').pop()?.toLowerCase();
              const isOfficeDoc = ['doc', 'docx'].includes(ext || '');
              const srcUrl = isOfficeDoc
                ? `https://docs.google.com/gview?url=${encodeURIComponent(previewFile.url)}&embedded=true`
                : previewFile.url;
              return (
                <iframe
                  src={srcUrl}
                  className="w-full h-[70vh] border border-gray-200 dark:border-gray-700 rounded-lg"
                  title="Document Preview"
                />
              );
            })()}
            <div className="mt-4 flex justify-end">
              <a
                href={previewFile.url}
                download={previewFile.filename}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download
              </a>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
