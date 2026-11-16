"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  useDeactivateEmployer,
  useEmployerDetails,
  useReactivateEmployer,
} from "@/services/hooks/useEmployers";
import { formatDate, formatDateTimeEST } from "@/services/utils/dateUtils";
import ErrorState from "../../../common/ErrorState";
import FullScreenSpinner from "../../../ui/FullScreenSpinner";
import { CompanyProfile, JobPosts, CompanyUsers } from "./components";
import BackToListButton from "@/components/ui/BackToListButton";
import PermissionWrapper from "@/components/common/PermissionWrapper";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useConfirmation } from "@/hooks/useConfirmation";

interface ViewDetailsProps {
  id: string;
}

export default function ViewDetails({ id }: ViewDetailsProps) {
  const router = useRouter();
  const confirmation = useConfirmation();
  const { data, isLoading, error } = useEmployerDetails(id);
  const deactivateEmployer = useDeactivateEmployer(id);
  const reactivateEmployer = useReactivateEmployer(id);
  const isUpdatingStatus = deactivateEmployer.isPending || reactivateEmployer.isPending;

  const seeReviews = () => {
    router.push(`/admin/company-reviews?id=${id}`);
  };

  const handleDeactivate = async () => {
    const confirmed = await confirmation.confirm({
      title: "Deactivate Company",
      message:
        "The public employer page will show as not found. Published job posts will be unpublished and will not come back automatically if you reactivate this company.",
      confirmText: "Deactivate",
      cancelText: "Cancel",
    });

    if (!confirmed) return;
    deactivateEmployer.mutate();
  };

  const handleReactivate = async () => {
    const confirmed = await confirmation.confirm({
      title: "Reactivate Company",
      message:
        "The public employer profile will be visible again. Job posts stay unpublished until someone republishes them.",
      confirmText: "Reactivate",
      cancelText: "Cancel",
    });

    if (!confirmed) return;
    reactivateEmployer.mutate();
  };

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading employer details..." />;
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/employers" className="mb-6" preserveState={true}>
          Back to Employers
        </BackToListButton>

        <ErrorState message={`Error loading employer details: ${error.message}`} />
      </div>
    );
  }

  if (!data?.success || !data?.data) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/employers" className="mb-6" preserveState={true}>
          Back to Employers
        </BackToListButton>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Employer not found</p>
        </div>
      </div>
    );
  }
  const employer = data.data;
  const isDeactivated = Boolean(employer.deactivatedAt);
  const deactivatedLabel = (() => {
    if (!employer.deactivatedAt) return null;
    const formatted = formatDateTimeEST(employer.deactivatedAt);
    if (typeof formatted === "string") return formatted;
    return `${formatted.date} ${formatted.time} ET`;
  })();

  const contactInfo = [
    {
      label: "Job Posts",
      value: `${employer.jobPostCount} ${employer.jobPostCount === 1 ? "Post" : "Posts"}`,
      className: "text-gray-900 dark:text-white",
    },
    {
      label: "Employees",
      value: `${employer.employeeCount}`,
      className: "text-gray-900 dark:text-white",
    },
    {
      label: "Total Applications",
      value: `${employer.totalApplicants}`,
      className: "text-gray-900 dark:text-white",
    },
    {
      label: "Email",
      value: employer.email,
      className: "text-gray-900 dark:text-white break-all",
    },
    {
      label: "Phone",
      value: employer.phoneNumber || "Not specified",
      className: "text-gray-900 dark:text-white",
    },
    {
      label: "Location",
      value: [employer.city, employer.state].filter(Boolean).join(", ") || employer.state || "Not specified",
      className: "text-gray-900 dark:text-white text-right",
    },
    {
      label: "Joined",
      value: formatDate(employer.dateJoined),
      className: "text-gray-900 dark:text-white",
    },
    {
      label: "Last Active",
      value: (() => {
        const lastActivity = formatDateTimeEST(employer.lastActivity);
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <BackToListButton href="/admin/employers" preserveState={true}>
            Back to Employers
          </BackToListButton>

          <div className="flex flex-wrap items-center gap-3">
            {isDeactivated && (
              <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                Deactivated {deactivatedLabel}
              </span>
            )}
            <PermissionWrapper module="employers" action="edit">
              <button
                type="button"
                onClick={isDeactivated ? handleReactivate : handleDeactivate}
                disabled={isUpdatingStatus}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 ${
                  isDeactivated
                    ? "text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                    : "text-yellow-700 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                }`}
              >
                {isUpdatingStatus
                  ? isDeactivated
                    ? "Reactivating..."
                    : "Deactivating..."
                  : isDeactivated
                    ? "Reactivate Company"
                    : "Deactivate Company"}
              </button>
            </PermissionWrapper>
          </div>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="col-span-full xl:col-auto">
          <CompanyProfile
            employer={employer}
            contactInfo={contactInfo}
            onSeeReviews={seeReviews}
            overview={employer.overview}
          />
        </div>

        <div className="col-span-2 space-y-6">
          <JobPosts jobPosts={employer.jobPost || []} formatDate={formatDate} />

          <CompanyUsers users={employer.companyUsers || []} />
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={confirmation.onClose}
        onConfirm={confirmation.onConfirm}
        onCancel={confirmation.onCancel}
        title={confirmation.config?.title || ""}
        message={confirmation.config?.message || ""}
        confirmText={confirmation.config?.confirmText}
        cancelText={confirmation.config?.cancelText}
      />
    </>
  );
}
