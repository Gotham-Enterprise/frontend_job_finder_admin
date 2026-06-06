"use client";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useSupervisionReviewDetails,
  useDeleteSupervisionReview,
} from "@/services/hooks/useSupervisionReviews";
import { formatDate } from "@/services/utils/dateUtils";
import ErrorState from "../../../common/ErrorState";
import FullScreenSpinner from "../../../ui/FullScreenSpinner";
import BackToListButton from "@/components/ui/BackToListButton";
import Avatar from "@/components/ui/avatar/Avatar";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { StarRating } from "../components";

interface ViewDetailsProps {
  id: string;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-44 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-white flex-1">
        {value || <span className="text-gray-400 italic">Not specified</span>}
      </span>
    </div>
  );
}

const HireStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    COMPLETED:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    ACTIVE:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    CANCELLED:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    PENDING:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
};

export default function ViewDetails({ id }: ViewDetailsProps) {
  const router = useRouter();
  const { data, isLoading, error } = useSupervisionReviewDetails(id);
  const { mutateAsync: deleteReview, isPending: isDeleting } =
    useDeleteSupervisionReview();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteReview(id);
    setDeleteDialogOpen(false);
    router.push("/admin/supervision-reviews");
  };

  if (isLoading) {
    return (
      <FullScreenSpinner isVisible={true} message="Loading review details..." />
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/supervision-reviews" className="mb-6">
          Back to Reviews
        </BackToListButton>
        <ErrorState
          message={`Error loading review details: ${error.message}`}
        />
      </div>
    );
  }

  if (!data?.success || !data?.data) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/supervision-reviews" className="mb-6">
          Back to Reviews
        </BackToListButton>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Review not found</p>
        </div>
      </div>
    );
  }

  const review = data.data;

  return (
    <>
      <div className="px-4 pt-4 pb-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <BackToListButton href="/admin/supervision-reviews">
            Back to Reviews
          </BackToListButton>

          <button
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-error-700 bg-error-50 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            Delete Review
          </button>
        </div>

        {/* Hero rating card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Supervisee */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar
                src={review.supervisee?.profilePhotoUrl || undefined}
                name={review.supervisee?.fullName || "?"}
                size="xlarge"
              />
              <div className="min-w-0">
                <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
                  Supervisee
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {review.supervisee?.fullName || "—"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {review.supervisee?.email}
                </p>
              </div>
            </div>

            {/* Arrow divider */}
            <div className="hidden sm:flex items-center self-center text-gray-300 dark:text-gray-600">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>

            {/* Supervisor */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar
                src={review.supervisor?.profilePhotoUrl || undefined}
                name={review.supervisor?.fullName || "?"}
                size="xlarge"
              />
              <div className="min-w-0">
                <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
                  Supervisor
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {review.supervisor?.fullName || "—"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {review.supervisor?.email}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex flex-col items-start sm:items-end gap-1 self-center">
              <p className="text-xs text-gray-400 uppercase font-medium">
                Rating
              </p>
              <StarRating rating={review.rating} />
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 uppercase font-medium mb-2">
                Comment
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                {review.comment}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Hire details */}
          {review.hire && (
            <SectionCard title="Hire Details">
              <FieldRow
                label="Status"
                value={<HireStatusBadge status={review.hire.status} />}
              />
              <FieldRow
                label="Start Date"
                value={formatDate(review.hire.startDate)}
              />
              <FieldRow
                label="End Date"
                value={formatDate(review.hire.endDate)}
              />
              <FieldRow
                label="Hired On"
                value={formatDate(review.hire.createdAt)}
              />
            </SectionCard>
          )}

          {/* Supervisee info */}
          <SectionCard title="Supervisee Info">
            <FieldRow
              label="Full Name"
              value={review.supervisee?.fullName}
            />
            <FieldRow label="Email" value={review.supervisee?.email} />
            <FieldRow
              label="Location"
              value={
                [review.supervisee?.city, review.supervisee?.state]
                  .filter(Boolean)
                  .join(", ") || null
              }
            />
            <FieldRow
              label="Occupation"
              value={review.supervisee?.occupation?.name}
            />
          </SectionCard>

          {/* Supervisor info */}
          <SectionCard title="Supervisor Info">
            <FieldRow
              label="Full Name"
              value={review.supervisor?.fullName}
            />
            <FieldRow label="Email" value={review.supervisor?.email} />
          </SectionCard>

          {/* Review metadata */}
          <SectionCard title="Review Metadata">
            <FieldRow label="Review ID" value={review.id} />
            <FieldRow label="Submitted" value={formatDate(review.createdAt)} />
            <FieldRow label="Last Updated" value={formatDate(review.updatedAt)} />
          </SectionCard>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </>
  );
}
