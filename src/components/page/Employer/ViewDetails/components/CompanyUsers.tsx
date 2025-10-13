"use client";

import { useState, useMemo } from "react";
import Badge from "@/components/ui/badge/Badge";
import NotFoundState from "@/components/common/NotFoundState";
import Pagination from "@/components/tables/Pagination";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";
import { useConfirmation } from "@/hooks/useConfirmation";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import InputModal from "@/components/ui/InputModal";
import { useToast } from "@/context/ToastContext";
import { CompanyUser } from "@/services/types/employer";

interface CompanyUsersProps {
  users: CompanyUser[];
}

const getRoleVariant = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    manager: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    recruiter: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    user: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  };
  return roleMap[role.toLowerCase()] || roleMap.user;
};

const getStatusColor = (status: string): "success" | "warning" | "error" | "primary" => {
  const statusMap: { [key: string]: "success" | "warning" | "error" | "primary" } = {
    active: "success",
    inactive: "warning",
    suspended: "error",
    pending: "warning",
  };
  return statusMap[status.toLowerCase()] || "primary";
};

export default function CompanyUsers({ users }: CompanyUsersProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [resetPasswordLoadingId, setResetPasswordLoadingId] = useState<string | null>(null);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [pendingUserAction, setPendingUserAction] = useState<{ user: CompanyUser; isActive: boolean } | null>(null);
  const { addToast } = useToast();
  const confirmation = useConfirmation();

  const itemsPerPage = 8;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  const initPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleResetPassword = async (user: CompanyUser) => {
    if (!user.email) {
      addToast({
        variant: "error",
        title: "Error",
        message: "User does not have an email address",
        duration: 5000,
      });
      return;
    }

    const userName = `${user.firstName} ${user.lastName}`.trim();

    // Show confirmation dialog
    const confirmed = await confirmation.confirm({
      title: "Reset Password",
      message: `Are you sure you want to send a password reset email to ${userName} (${user.email})?`,
      confirmText: "Yes, Reset Password",
      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    setResetPasswordLoadingId(user.id);
    try {
      const { jobSeekerApi } = await import("@/services/api/jobSeeker");
      await jobSeekerApi.resetPassword(user.email);

      addToast({
        variant: "success",
        title: "Success",
        message: `Password reset email has been sent to ${user.email}`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      addToast({
        variant: "error",
        title: "Error",
        message: error.message || "Failed to send password reset email",
        duration: 5000,
      });
    } finally {
      setResetPasswordLoadingId(null);
    }
  };

  const handleToggleUserStatus = async (user: CompanyUser) => {
    const userName = `${user.firstName} ${user.lastName}`.trim();
    const isActive = user.status.toLowerCase() === "active";
    const action = isActive ? "deactivate" : "reactivate";

    // Show confirmation dialog
    const confirmed = await confirmation.confirm({
      title: `${isActive ? "Deactivate" : "Reactivate"} User`,
      message: `Are you sure you want to ${action} ${userName}?`,
      confirmText: `Yes, ${isActive ? "Deactivate" : "Reactivate"}`,
      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    // Open reason modal
    setPendingUserAction({ user, isActive });
    setReasonModalOpen(true);
  };

  const handleReasonSubmit = async (reason: string) => {
    if (!pendingUserAction) return;

    const { user, isActive } = pendingUserAction;
    const action = isActive ? "deactivate" : "reactivate";

    setReasonModalOpen(false);
    setToggleLoadingId(user.id);

    try {
      const { adminUserManagementApi } = await import("@/services/api/adminUserManagement");

      if (isActive) {
        await adminUserManagementApi.deactivateUser(user.id, { reason });
      } else {
        await adminUserManagementApi.reactivateUser(user.id, { reason });
      }

      addToast({
        variant: "success",
        title: "Success",
        message: `User has been ${isActive ? "deactivated" : "reactivated"} successfully`,
        duration: 5000,
      });

      // Refresh the page to get updated user status
      window.location.reload();
    } catch (error: any) {
      console.error(`${action} user error:`, error);
      addToast({
        variant: "error",
        title: "Error",
        message: error.message || `Failed to ${action} user`,
        duration: 5000,
      });
    } finally {
      setToggleLoadingId(null);
      setPendingUserAction(null);
    }
  };

  const handleReasonCancel = () => {
    setReasonModalOpen(false);
    setPendingUserAction(null);
  };

  const tableColumns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "status", label: "Status" },
      { key: "actions", label: "", className: "text-right" },
    ],
    []
  );

  return (
    <div className="rounded-xl bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Company Users ({users?.length || 0})</h3>
      </div>

      {users && users.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table className="border-collapse">
              <TableHeading columns={tableColumns} />
              <TableBody>
                {currentUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="py-4 px-6">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getRoleVariant(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge color={getStatusColor(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          className="text-brand-400 text-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleResetPassword(user)}
                          disabled={resetPasswordLoadingId === user.id || toggleLoadingId === user.id}
                        >
                          {resetPasswordLoadingId === user.id ? (
                            <span className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-400"></div>
                              Sending...
                            </span>
                          ) : (
                            <>Reset password</>
                          )}
                        </button>
                        |
                        <button
                          className={`text-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                            user.status.toLowerCase() === "active"
                              ? "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              : "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          }`}
                          onClick={() => handleToggleUserStatus(user)}
                          disabled={toggleLoadingId === user.id || resetPasswordLoadingId === user.id}
                        >
                          {toggleLoadingId === user.id ? (
                            <span className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              Processing...
                            </span>
                          ) : (
                            <>{user.status.toLowerCase() === "active" ? "Deactivate" : "Reactivate"}</>
                          )}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 p-6 pt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of {users.length} users
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={initPageChange} />
            </div>
          )}
        </>
      ) : (
        <NotFoundState title="No company users found" message="This employer doesn't have any users yet" />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={confirmation.onClose}
        onConfirm={confirmation.onConfirm}
        onCancel={confirmation.onCancel}
        title={confirmation.config?.title || ""}
        message={confirmation.config?.message || ""}
        confirmText={confirmation.config?.confirmText}
        cancelText={confirmation.config?.cancelText}
        isLoading={resetPasswordLoadingId !== null || toggleLoadingId !== null}
      />

      {/* Reason Input Modal */}
      <InputModal
        isOpen={reasonModalOpen}
        onClose={handleReasonCancel}
        onConfirm={handleReasonSubmit}
        onCancel={handleReasonCancel}
        title={`Provide Reason for ${pendingUserAction?.isActive ? "Deactivation" : "Reactivation"}`}
        message={`Please provide a reason for ${pendingUserAction?.isActive ? "deactivating" : "reactivating"} this user:`}
        placeholder="Enter reason here..."
        confirmText="Submit"
        cancelText="Cancel"
        isLoading={toggleLoadingId !== null}
        inputType="textarea"
        required={true}
      />
    </div>
  );
}
