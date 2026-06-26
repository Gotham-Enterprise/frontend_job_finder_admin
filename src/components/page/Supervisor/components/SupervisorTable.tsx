import React from "react";
import { formatDate } from "@/services/utils/dateUtils";
import { formatUsStateCodeForDisplay } from "@/services/utils/formatUsStateLicensure";
import { formatUSPhoneNationalDisplay } from "@/services/utils/phoneNumberUtils";
import { Table, TableBody, TableCell, TableRow } from "../../../ui/table";
import Avatar from "../../../ui/avatar/Avatar";
import TableHeading from "../../../tables/tableHeader";
import EmailVerifiedBadge from "../../../ui/badge/EmailVerifiedBadge";
import VisibilityBadge from "../../../ui/badge/VisibilityBadge";
import SupervisorStatusBadge from "./SupervisorStatusBadge";
import SupervisorRowActions from "./SupervisorRowActions";
import { SupervisorTableProps } from "@/services/types/SupervisorTypes";

function renderOptionalCredential(value: string | null | undefined) {
  return value?.trim() ? (
    value
  ) : (
    <span className="text-gray-400 italic">N/A</span>
  );
}

// Join the secondary role details (occupation, specialty) into a single
// muted sub-line; renders nothing when none are present.
function renderRoleSubtext(values: Array<string | null | undefined>) {
  const parts = values.map((v) => v?.trim()).filter(Boolean);
  if (!parts.length) return null;
  return (
    <p className="text-xs text-gray-500 dark:text-gray-400">
      {parts.join(" · ")}
    </p>
  );
}

const SupervisorTable: React.FC<SupervisorTableProps> = ({
  data,
  isLoading,
  tableColumns,
  sortBy,
  sortOrder,
  onSort,
  onViewSupervisor,
  onEditSupervisor,
  onApproveSupervisor,
  onRejectSupervisor,
  onResendVerification,
  onToggleHideProfile,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeading
          columns={tableColumns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        />
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={tableColumns.length}
                className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                  Loading supervisors...
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>No supervisors found</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((supervisor) => (
              <TableRow
                key={supervisor.id}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Name + Avatar (with email and phone stacked beneath) */}
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={supervisor.profilePhotoUrl || undefined}
                      name={supervisor.fullName || "?"}
                      size="small"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[220px]">
                        {supervisor.fullName || "—"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
                        {supervisor.email}
                      </p>
                      {supervisor.contactNumber && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatUSPhoneNationalDisplay(supervisor.contactNumber)}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* State: full name (abbr) */}
                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {formatUsStateCodeForDisplay(supervisor.state) || (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </TableCell>

                {/* Role: supervisor type + occupation · specialty */}
                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {supervisor.supervisorType || (
                        <span className="font-normal text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </p>
                    {renderRoleSubtext([
                      supervisor.supervisorOccupation,
                      supervisor.supervisorSpecialty,
                    ])}
                  </div>
                </TableCell>

                {/* License Type */}
                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {renderOptionalCredential(supervisor.licenseType)}
                </TableCell>

                {/* Degree Type */}
                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {renderOptionalCredential(supervisor.degreeType)}
                </TableCell>

                {/* Years of Experience */}
                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {supervisor.yearsOfExperience ? (
                    `${supervisor.yearsOfExperience} yrs`
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </TableCell>

                {/* Verification Status */}
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <SupervisorStatusBadge status={supervisor.verificationStatus} />
                </TableCell>

                {/* Email Verified */}
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <EmailVerifiedBadge verified={supervisor.emailVerified} />
                </TableCell>

                {/* Visibility in Find a Supervisor app */}
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <VisibilityBadge hidden={supervisor.hideProfile} />
                </TableCell>

                {/* Submitted date */}
                <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(supervisor.createdAt)}
                </TableCell>

                {/* Actions */}
                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end">
                    <SupervisorRowActions
                      supervisor={supervisor}
                      onView={onViewSupervisor}
                      onEdit={onEditSupervisor}
                      onApprove={onApproveSupervisor}
                      onReject={onRejectSupervisor}
                      onResendVerification={onResendVerification}
                      onToggleHideProfile={onToggleHideProfile}
                    />
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

export default SupervisorTable;
