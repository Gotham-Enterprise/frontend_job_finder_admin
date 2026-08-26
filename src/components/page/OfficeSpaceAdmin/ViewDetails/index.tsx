"use client";

import React from "react";
import {
  Building2,
  MapPin,
  DollarSign,
  Ruler,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useOfficeSpaceDetail,
  useUpdateListingStatus,
} from "@/services/hooks/useOfficeSpaceAdmin";
import OfficeSpaceStatusBadge from "../OfficeSpaceStatusBadge";
import OfficeSpacePhotoGallery from "../OfficeSpacePhotoGallery";
import BackToListButton from "@/components/ui/BackToListButton";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import ErrorState from "@/components/common/ErrorState";
import { formatDate } from "@/services/utils/dateUtils";
import { showToast } from "@/services/utils/toast";

interface ViewDetailsProps {
  id: string;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "RENTED", label: "Rented" },
  { value: "ARCHIVED", label: "Archived" },
];

const AMENITY_LIST = [
  { key: "isFurnished", label: "Furnished" },
  { key: "hasReception", label: "Reception" },
  { key: "hasWaitingRoom", label: "Waiting Room" },
  { key: "hasKitchen", label: "Kitchen" },
  { key: "hasStorage", label: "Storage" },
];

export default function OfficeSpaceViewDetails({ id }: ViewDetailsProps) {
  const { data, isLoading, error, refetch } = useOfficeSpaceDetail(id);
  const updateStatusMutation = useUpdateListingStatus();

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading listing details..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={`Error loading listing: ${(error as Error).message}`}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data?.success || !data.data) {
    return <ErrorState message="Listing not found" showRetryButton={false} />;
  }

  const listing = data.data;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      showToast.success("Status Updated", "Listing status updated successfully");
    } catch {
      showToast.error("Update Failed", "Failed to update listing status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToListButton href="/admin/office-spaces" preserveState />
        <div className="flex items-center gap-3">
          <OfficeSpaceStatusBadge status={listing.status} />
          <select
            value={listing.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {listing.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
          <MapPin className="w-4 h-4" />
          {listing.address}, {listing.city}, {listing.state} {listing.zipCode}
        </p>
      </div>

      {listing.photos && listing.photos.length > 0 && (
        <OfficeSpacePhotoGallery photos={listing.photos} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Property Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <DetailItem
                icon={<Building2 className="w-4 h-4" />}
                label="Type"
                value={listing.propertyType}
              />
              <DetailItem
                icon={<Ruler className="w-4 h-4" />}
                label="Size"
                value={
                  listing.squareFootage != null
                    ? `${listing.squareFootage.toLocaleString()} sq ft`
                    : "N/A"
                }
              />
              <DetailItem
                icon={<DollarSign className="w-4 h-4" />}
                label="Monthly Rent"
                value={
                  listing.monthlyRent != null
                    ? `$${listing.monthlyRent.toLocaleString()}`
                    : "N/A"
                }
              />
              {listing.leaseTermMin && (
                <DetailItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Lease Term"
                  value={listing.leaseTermMax ? `${listing.leaseTermMin}-${listing.leaseTermMax} months` : `${listing.leaseTermMin} months`}
                />
              )}
              {listing.numExamRooms != null && (
                <DetailItem label="Exam Rooms" value={String(listing.numExamRooms)} />
              )}
              {listing.numOffices != null && (
                <DetailItem label="Offices" value={String(listing.numOffices)} />
              )}
              {listing.numRestrooms != null && (
                <DetailItem label="Restrooms" value={String(listing.numRestrooms)} />
              )}
              {listing.numParkingSpots != null && (
                <DetailItem label="Parking" value={`${listing.numParkingSpots} spots`} />
              )}
              {listing.availableFrom && (
                <DetailItem
                  label="Available"
                  value={formatDate(listing.availableFrom)}
                />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Amenities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITY_LIST.map(({ key, label }) => {
                const value = listing[
                  key as keyof typeof listing
                ] as boolean;
                return (
                  <div key={key} className="flex items-center gap-2">
                    {value ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                    <span
                      className={`text-sm ${
                        value
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {listing.amenities && listing.amenities.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Amenities & Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <OfficeSpaceStatusBadge status={listing.status} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Listed</span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(listing.createdAt)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(listing.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Landlord
            </h3>
            <p className="text-sm text-gray-500">ID: {listing.landlordId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      {icon && (
        <div className="mt-0.5 text-gray-400">{icon}</div>
      )}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
