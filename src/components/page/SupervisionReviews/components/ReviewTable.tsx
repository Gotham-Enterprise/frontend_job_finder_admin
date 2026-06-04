"use client";
import React from "react";
import { Eye, Trash2 } from "lucide-react";
import { formatDate } from "@/services/utils/dateUtils";
import { Table, TableBody, TableCell, TableRow } from "../../../ui/table";
import Avatar from "../../../ui/avatar/Avatar";
import TableHeading from "../../../tables/tableHeader";
import StarRating from "./StarRating";
import {
  SupervisionReview,
  SupervisionReviewsResponse,
} from "@/services/types/supervisionReview";

const ACTION_ICON_PX = 16;
const actionIconProps = {
  size: ACTION_ICON_PX,
  className: "shrink-0",
} as const;

interface ReviewTableProps {
  data: SupervisionReviewsResponse | undefined;
  isLoading: boolean;
  tableColumns: { key: string; label: string; className?: string }[];
  onViewReview: (reviewId: string) => void;
  onDeleteReview: (reviewId: string, comment: string | null) => void;
}

const HireStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    ACTIVE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
};

const ReviewTable: React.FC<ReviewTableProps> = ({
  data,
  isLoading,
  tableColumns,
  onViewReview,
  onDeleteReview,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeading columns={tableColumns} />
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={tableColumns.length}
                className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                  Loading reviews...
                </div>
              </TableCell>
            </TableRow>
          ) : !data?.data?.length ? (
            <TableRow>
              <TableCell
                colSpan={tableColumns.length}
                className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="h-10 w-10 text-gray-300 dark:text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                  <span>No reviews found</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((review: SupervisionReview) => (
              <TableRow
                key={review.id}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Supervisee */}
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={review.supervisee?.profilePhotoUrl || undefined}
                      name={review.supervisee?.fullName || "?"}
                      size="small"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[140px]">
                        {review.supervisee?.fullName || "—"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                        {review.supervisee?.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Supervisor */}
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={review.supervisor?.profilePhotoUrl || undefined}
                      name={review.supervisor?.fullName || "?"}
                      size="small"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[140px]">
                        {review.supervisor?.fullName || "—"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                        {review.supervisor?.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Rating */}
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <StarRating rating={review.rating} />
                </TableCell>

                {/* Comment */}
                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-[220px]">
                  {review.comment ? (
                    <p className="truncate" title={review.comment}>
                      {review.comment}
                    </p>
                  ) : (
                    <span className="text-gray-400 italic text-xs">
                      No comment
                    </span>
                  )}
                </TableCell>

                {/* Hire Status */}
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  {review.hire ? (
                    <HireStatusBadge status={review.hire.status} />
                  ) : (
                    <span className="text-gray-400 italic text-xs">—</span>
                  )}
                </TableCell>

                {/* Submitted */}
                <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(review.createdAt)}
                </TableCell>

                {/* Actions */}
                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewReview(review.id)}
                      title="View details"
                      className="p-1.5 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 rounded transition-colors"
                    >
                      <Eye {...actionIconProps} />
                    </button>
                    <button
                      onClick={() => onDeleteReview(review.id, review.comment)}
                      title="Delete review"
                      className="p-1.5 text-gray-500 hover:text-error-600 dark:text-gray-400 dark:hover:text-error-400 rounded transition-colors"
                    >
                      <Trash2 {...actionIconProps} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReviewTable;
