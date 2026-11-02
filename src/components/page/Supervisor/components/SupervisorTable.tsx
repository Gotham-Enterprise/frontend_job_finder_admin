import React, { useMemo } from "react";
import { formatDate, formatDateTimeLocal } from "@/services/utils/dateUtils";
import { TimeIcon } from "@/icons";
import {
  formatUsStateCodeForDisplay,
  resolveUsStateAbbreviation,
} from "@/services/utils/formatUsStateLicensure";
import { formatUSPhoneNationalDisplay } from "@/services/utils/phoneNumberUtils";
import { Table, TableBody, TableCell, TableRow } from "../../../ui/table";
import Avatar from "../../../ui/avatar/Avatar";
import TableHeading, { TableHeaderColumn } from "../../../tables/tableHeader";
import Checkbox from "../../../form/input/Checkbox";
import BulkActionsBar from "@/components/common/BulkActionsBar";
import { supervisionUserBulkActions } from "@/components/common/supervisionUserBulkActions";
import { useRowSelection } from "@/hooks/useRowSelection";
import { Supervisor } from "@/services/types/supervisor";
import EmailVerifiedBadge from "../../../ui/badge/EmailVerifiedBadge";
import VisibilityBadge from "../../../ui/badge/VisibilityBadge";
import SupervisorStatusBadge from "./SupervisorStatusBadge";
import SupervisorRowActions from "./SupervisorRowActions";
import SubscriptionCell from "./SubscriptionCell";
import { SupervisorTableProps } from "@/services/types/SupervisorTypes";

/** "Jane Smith, Ph.D., NCC" — no comma when either part is missing. */
function formatNameWithCredentials(
  fullName: string | null | undefined,
  credentials: string | null | undefined,
) {
  return [fullName?.trim(), credentials?.trim()].filter(Boolean).join(", ");
}

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

const getSupervisorId = (supervisor: Supervisor) => supervisor.id;

const PAYOUT_BADGE: Record<NonNullable<Supervisor["payoutStatus"]>, { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  pending: { label: "Onboarding", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  none: { label: "Not set up", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

/** "$1,000/mo" from the listed fee (dollars); other cadences say so. */
function formatListedFee(supervisor: Supervisor) {
  if (supervisor.supervisionFeeAmount == null) return <span className="text-gray-400 italic">—</span>;
  const amount = `$${supervisor.supervisionFeeAmount.toLocaleString("en-US")}`;
  const type = supervisor.supervisionFeeType?.toUpperCase();
  return type === "MONTHLY" ? `${amount}/mo` : type === "HOURLY" ? `${amount}/hr` : amount;
}

/** Medical Directors page: board certs, listed fee, payout account, active clients. */
function MedicalDirectorCells({ supervisor }: { supervisor: Supervisor }) {
  const payout = PAYOUT_BADGE[supervisor.payoutStatus ?? "none"];
  return (
    <>
      {/* Board certifications */}
      <TableCell className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {supervisor.boardCertificationCount || <span className="text-gray-400 italic">None</span>}
      </TableCell>

      {/* Listed monthly fee */}
      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {formatListedFee(supervisor)}
      </TableCell>

      {/* In-app payout account (needed to send a monthly agreement) */}
      <TableCell className="px-4 py-3 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${payout.className}`}>
          {payout.label}
        </span>
      </TableCell>

      {/* Clients with an accepted or active hire */}
      <TableCell className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {supervisor.activeClientCount ?? 0}
      </TableCell>
    </>
  );
}

const SupervisorTable: React.FC<SupervisorTableProps> = ({
  mode = "supervisors",
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
  onApproveEmailVerification,
  onToggleHideProfile,
  onRefresh,
}) => {
  const selection = useRowSelection(data?.data, getSupervisorId);
  const { selectableIds, allSelected, toggleAll } = selection;

  // Leading checkbox column for selecting rows for bulk actions.
  const columns = useMemo<TableHeaderColumn[]>(
    () => [
      {
        key: "select",
        className: "w-10",
        label: selectableIds.length ? <Checkbox checked={allSelected} onChange={toggleAll} /> : null,
      },
      ...tableColumns,
    ],
    [tableColumns, selectableIds.length, allSelected, toggleAll]
  );

  return (
    <>
      <BulkActionsBar
        selectedCount={selection.selectedIds.length}
        itemNoun="supervisor"
        actions={supervisionUserBulkActions(selection.selectedIdsWhere)}
        onClearSelection={selection.clear}
        onRefresh={() => onRefresh?.()}
      />
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeading
            columns={columns}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          />
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
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
                  colSpan={columns.length}
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
                  <TableCell className="px-6 py-3">
                    <Checkbox
                      checked={selection.isSelected(supervisor.id)}
                      onChange={(checked) => selection.toggle(supervisor.id, checked)}
                    />
                  </TableCell>
                  {/* Name + Avatar (with email and phone stacked beneath) */}
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={supervisor.profilePhotoUrl || undefined}
                        name={supervisor.fullName || "?"}
                        size="small"
                        enablePreview
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[220px]">
                          {formatNameWithCredentials(
                            supervisor.fullName,
                            supervisor.professionalCredentials,
                          ) || "—"}
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

                  {/* State: abbreviation only to keep the column narrow; full name on hover */}
                  <TableCell className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {supervisor.state?.trim() ? (
                      <span title={formatUsStateCodeForDisplay(supervisor.state) ?? undefined}>
                        {resolveUsStateAbbreviation(supervisor.state) ?? supervisor.state.trim()}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </TableCell>

                  {/* Role: supervisor type + occupation · specialty (wraps so long occupations don't widen the column) */}
                  <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-[220px]">
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
                      {mode === "medicalDirectors" && !!supervisor.offerings?.length && (
                        <p className="mt-1 text-xs text-brand-600 dark:text-brand-400">
                          Also offers {supervisor.offerings.join(", ")}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {mode === "medicalDirectors" && <MedicalDirectorCells supervisor={supervisor} />}

                  {mode !== "medicalDirectors" && (
                  <>
                  {/* License Type */}
                  <TableCell className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {renderOptionalCredential(supervisor.licenseType)}
                  </TableCell>

                  {/* Degree Type */}
                  <TableCell className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
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
                  </>
                  )}

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

                  {/* Subscription: paid/free, plan, current billing period */}
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <SubscriptionCell subscription={supervisor.subscription} />
                  </TableCell>

                  {/* Submitted date */}
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {supervisor.createdAt ? (
                      (() => {
                        const registered = formatDateTimeLocal(supervisor.createdAt);
                        if (typeof registered === "string") {
                          return <p>{registered}</p>;
                        }
                        return (
                          <div>
                            <div>{registered.date}</div>
                            <div className="flex items-center mt-1">
                              <TimeIcon className="mr-1" />
                              <span>{registered.time}</span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      formatDate(supervisor.createdAt)
                    )}
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
                        onApproveEmailVerification={onApproveEmailVerification}
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
    </>
  );
};

export default SupervisorTable;
