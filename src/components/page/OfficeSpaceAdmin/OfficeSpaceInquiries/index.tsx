"use client";

import React from "react";
import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/button/Button";
import OfficeSpaceStatusBadge from "../OfficeSpaceStatusBadge";
import OfficeSpaceEmptyState from "../OfficeSpaceEmptyState";
import {
  useOfficeSpaceInquiries,
} from "@/services/hooks/useOfficeSpaceAdmin";
import { formatDate } from "@/services/utils/dateUtils";

interface OfficeSpaceInquiriesListProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  GENERAL: "General",
  TOUR_REQUEST: "Tour Request",
  APPLICATION: "Application",
  QUESTION: "Question",
};

const OfficeSpaceInquiriesList: React.FC<OfficeSpaceInquiriesListProps> = ({
  currentPage,
  onPageChange,
}) => {
  const { data, isLoading } = useOfficeSpaceInquiries(currentPage, 10);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <OfficeSpaceEmptyState
        title="No inquiries found"
        description="Inquiries from potential tenants will appear here."
      />
    );
  }

  const { metaData } = data;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {data.data.map((inquiry) => (
          <div
            key={inquiry.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {inquiry.senderName}
                    </h3>
                    <OfficeSpaceStatusBadge status={inquiry.status} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {inquiry.senderEmail}
                  </p>
                  {inquiry.senderPhone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {inquiry.senderPhone}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Type: {INQUIRY_TYPE_LABELS[inquiry.inquiryType] || inquiry.inquiryType}{" "}
                    &middot; Listing: {inquiry.listingId.slice(0, 8)}...
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap line-clamp-3">
                    {inquiry.message}
                  </p>
                  {inquiry.response && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm dark:bg-gray-800">
                      <p className="font-medium text-xs text-gray-500 mb-1">
                        Response:
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {inquiry.response}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatDate(inquiry.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {metaData && metaData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {metaData.page} of {metaData.totalPages} ({metaData.totalCount} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              startIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= metaData.totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              endIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeSpaceInquiriesList;
