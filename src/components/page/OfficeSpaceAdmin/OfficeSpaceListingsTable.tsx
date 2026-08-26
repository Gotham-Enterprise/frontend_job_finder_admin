"use client";

import React from "react";
import { Eye } from "lucide-react";
import Button from "@/components/ui/button/Button";
import OfficeSpaceStatusBadge from "./OfficeSpaceStatusBadge";
import OfficeSpaceEmptyState from "./OfficeSpaceEmptyState";
import {
  OfficeSpaceAdminListingsResponse,
  ListingStatus,
} from "@/services/types/officeSpace";

interface OfficeSpaceListingsTableProps {
  data: OfficeSpaceAdminListingsResponse | undefined;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string }>;
  getStatusBadge: (status: ListingStatus) => { variant: string; label: string };
  onViewDetails: (id: string) => void;
  onStatusChange: (id: string, status: ListingStatus) => void;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "RENTED", label: "Rented" },
  { value: "ARCHIVED", label: "Archived" },
];

const OfficeSpaceListingsTable: React.FC<OfficeSpaceListingsTableProps> = ({
  data,
  isLoading,
  onViewDetails,
  onStatusChange,
}) => {
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
        title="No listings found"
        description="No office space listings match your criteria."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Listing
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rent
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {data.data.map((listing) => (
            <tr
              key={listing.id}
              className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {listing.photos?.[0] && (
                    <img
                      src={listing.photos[0].url}
                      alt={listing.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {listing.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {listing.propertyType}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-900 dark:text-white">
                  {listing.city}, {listing.state}
                </p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-900 dark:text-white">
                  {listing.squareFootage != null
                    ? `${listing.squareFootage.toLocaleString()} sq ft`
                    : "N/A"}
                </p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-900 dark:text-white">
                  {listing.monthlyRent != null
                    ? `$${listing.monthlyRent.toLocaleString()}/mo`
                    : "N/A"}
                </p>
              </td>
              <td className="px-6 py-4">
                <OfficeSpaceStatusBadge status={listing.status} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <select
                    value={listing.status}
                    onChange={(e) =>
                      onStatusChange(
                        listing.id,
                        e.target.value as ListingStatus
                      )
                    }
                    className="text-xs border border-gray-300 rounded px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(listing.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OfficeSpaceListingsTable;
