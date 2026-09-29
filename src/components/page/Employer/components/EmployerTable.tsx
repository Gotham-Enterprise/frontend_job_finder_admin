import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatDateTimeEST } from "@/services/utils/dateUtils";
import { Table, TableBody, TableCell, TableRow } from "../../../ui/table";
import Badge from "../../../ui/badge/Badge";
import Button from "../../../ui/button/Button";
import TableHeading from "../../../tables/tableHeader";
import Checkbox from "../../../form/input/Checkbox";
import { TimeIcon } from "@/icons";
import { EmployerTableProps } from "@/services/types/EmployerTypes";
import Avatar from "../../../ui/avatar/Avatar";
import { EditEmployerModal } from "./EditEmployerModal";
import { CompanyUserVerificationModal, CompanyUserVerificationAction } from "./CompanyUserVerificationModal";
import EmployerRowActions from "./EmployerRowActions";
import { useToast } from "@/context/ToastContext";
import { usePermissions } from "@/hooks/usePermissions";
import OptionsDropdown from "../../../ui/OptionsDropdown";
import type { DropdownOption } from "../../../ui/OptionsDropdown";

const EmployerTable: React.FC<EmployerTableProps> = ({
  data,
  isLoading,
  tableColumns,
  getStatusVariant,
  onViewEmployer,
  onViewSubscription,
  selectedEmployerId,
  onEmployerSelect,
  onRefresh,
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployerIdForEdit, setSelectedEmployerIdForEdit] = useState<string | null>(null);
  const [verificationTarget, setVerificationTarget] = useState<{
    id: string;
    companyName: string;
    action: CompanyUserVerificationAction;
  } | null>(null);
  const { addToast } = useToast();
  const { hasPermission } = usePermissions();
  const router = useRouter();

  // Check if user has permission to add jobs (needed for checkbox selection)
  const canCreateJobs = hasPermission("employers", "add");

  const openEditModal = (employerId: string) => {
    setSelectedEmployerIdForEdit(employerId);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedEmployerIdForEdit(null);
  };

  const refreshData = (showSuccessToast = false) => {
    if (showSuccessToast) {
      addToast({
        variant: "success",
        title: "Success",
        message: "Employer has been updated successfully",
        duration: 5000,
      });
    }

    if (onRefresh) {
      onRefresh();
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
  };
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeading columns={tableColumns} />
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="text-center py-8 px-3" colSpan={canCreateJobs ? 12 : 11}>
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : !data?.success || !data?.data?.length ? (
            <TableRow>
              <TableCell className="text-center py-8 px-3" colSpan={canCreateJobs ? 12 : 11}>
                <p className="text-gray-500 dark:text-gray-400">No employers found</p>
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((employer: any) => (
              <TableRow
                key={employer.id}
                data-item-id={employer.id}
                data-employer-id={employer.id}
                className="group border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <TableCell className="py-4 px-3 text-center">
                  {canCreateJobs ? (
                    <Checkbox
                      checked={selectedEmployerId === employer.id}
                      onChange={(checked) => onEmployerSelect(employer.id, checked)}
                    />
                  ) : (
                    <div className="w-4 h-4"></div> // Empty space to maintain column alignment
                  )}
                </TableCell>
                <TableCell className="py-4 px-3 text-sm max-w-xs">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={employer.avatarUrl}
                      name={employer.companyName}
                      size="medium"
                      className="flex-shrink-0"
                      enablePreview
                    />
                    <div className="min-w-0 flex-1 max-w-48">
                      <p className="font-medium text-gray-900 dark:text-white truncate" title={employer.companyName}>
                        {employer.companyName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{employer.jobPostCount} job posts</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4 px-3">
                  <p className="text-sm text-gray-900 dark:text-white truncate max-w-[200px]" title={employer.email}>
                    {employer.email}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-3">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {employer.city && employer.state
                      ? `${employer.city}, ${employer.state}`
                      : employer.city || employer.state || "Not specified"}
                  </p>
                </TableCell>
                <TableCell className="py-4 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{employer.jobPostCount}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-3 text-sm max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1 max-w-48">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{employer.totalJobViews}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-3 text-sm max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1 max-w-48">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{employer.totalApplications}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-3 whitespace-nowrap">
                  {employer.dateJoined ? (
                    (() => {
                      const dateJoined = formatDateTimeEST(employer.dateJoined);
                      if (typeof dateJoined === "string") {
                        return <p className="text-sm text-gray-900 dark:text-white">{dateJoined}</p>;
                      }
                      return (
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div>{dateJoined.date}</div>
                          <div className="flex items-center mt-1">
                            <TimeIcon className="mr-1" />
                            <span>{dateJoined.time}</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-3 whitespace-nowrap">
                  {employer.lastActivity ? (
                    (() => {
                      const lastActivity = formatDateTimeEST(employer.lastActivity);
                      if (typeof lastActivity === "string") {
                        return <p className="text-sm text-gray-900 dark:text-white">{lastActivity}</p>;
                      }
                      return (
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div>{lastActivity.date}</div>
                          <div className="flex items-center mt-1">
                            <TimeIcon className="mr-1" />
                            <span>{lastActivity.time}</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">No activity</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-3">
                  <Badge variant={getStatusVariant(employer.status)}>{employer.status}</Badge>
                </TableCell>
                <TableCell className="py-4 px-3">
                  <span
                    onClick={() => onViewSubscription(employer.id)}
                    className="cursor-pointer inline-block hover:opacity-80 transition-opacity"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onViewSubscription(employer.id);
                      }
                    }}
                  >
                    <Badge
                      variant="light"
                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700"
                    >
                      {employer.currentPlan === "Free Plan" ? "No Active Subscription" : employer.currentPlan}
                    </Badge>
                  </span>
                </TableCell>
                {/* Sticky so the actions stay reachable when the table scrolls horizontally */}
                <TableCell className="py-4 px-3 text-right sticky right-0 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800">
                  <EmployerRowActions
                    onView={() => onViewEmployer(employer.id)}
                    onEdit={() => openEditModal(employer.id)}
                    onVerifyUsers={() =>
                      setVerificationTarget({ id: employer.id, companyName: employer.companyName, action: "approve" })
                    }
                    onResendVerification={() =>
                      setVerificationTarget({ id: employer.id, companyName: employer.companyName, action: "resend" })
                    }
                    // Unknown count (older API) keeps the actions visible
                    showVerificationActions={(employer.unverifiedUserCount ?? 1) > 0}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {verificationTarget && (
        <CompanyUserVerificationModal
          isOpen={!!verificationTarget}
          onClose={() => setVerificationTarget(null)}
          employerId={verificationTarget.id}
          companyName={verificationTarget.companyName}
          action={verificationTarget.action}
          onVerified={() => onRefresh?.()}
        />
      )}

      {selectedEmployerIdForEdit && (
        <EditEmployerModal
          isOpen={editModalOpen}
          onClose={closeEditModal}
          employerId={selectedEmployerIdForEdit}
          onUpdate={() => refreshData(true)}
        />
      )}
    </div>
  );
};

export default EmployerTable;
