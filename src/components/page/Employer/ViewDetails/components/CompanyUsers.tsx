"use client";

import { useState, useMemo } from "react";
import Badge from "@/components/ui/badge/Badge";
import NotFoundState from "@/components/common/NotFoundState";
import Pagination from "@/components/tables/Pagination";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";
import { useConfirmation } from "@/hooks/useConfirmation";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useToast } from "@/context/ToastContext";

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

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

    // Show confirmation dialog
    const confirmed = await confirmation.confirm({
      title: "Reset Password",
      message: `Are you sure you want to send a password reset email to ${user.name} (${user.email})?`,
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
                      <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
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
                      <button
                        className="flex gap-2 text-brand-400 text-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleResetPassword(user)}
                        disabled={resetPasswordLoadingId === user.id}
                      >
                        {resetPasswordLoadingId === user.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-400"></div>
                            Sending...
                          </>
                        ) : (
                          <>Reset password</>
                        )}
                      </button>
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
        isLoading={resetPasswordLoadingId !== null}
      />
    </div>
  );
}
