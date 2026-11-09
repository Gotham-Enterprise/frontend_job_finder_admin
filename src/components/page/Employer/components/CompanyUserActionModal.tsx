import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MailCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import EmailVerifiedBadge from "@/components/ui/badge/EmailVerifiedBadge";
import { employerApi } from "@/services/api/employer";
import { jobSeekerApi } from "@/services/api/jobSeeker";
import { CompanyUser } from "@/services/types/employer";
import { useToast } from "@/context/ToastContext";

export type CompanyUserAction = "approve" | "resend" | "reset";

interface CompanyUserActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employerId: string;
  companyName: string;
  action: CompanyUserAction;
  /** Called after at least one user was marked verified, so the list can refresh */
  onVerified?: () => void;
}

const getUserName = (user: CompanyUser) => `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;

const isUnverified = (user: CompanyUser) => !user.emailVerified && !!user.userId;

const verificationSummary = (users: CompanyUser[]) => {
  const unverifiedCount = users.filter((u) => !u.emailVerified).length;
  return `${unverifiedCount} of ${users.length} ${users.length === 1 ? "user has" : "users have"} an unverified email`;
};

// The bulk endpoint answers 200 and lists per-id failures in the body, so surface them as errors
const sendPasswordReset = async (user: CompanyUser) => {
  const response = await jobSeekerApi.bulkSendPasswordReset([user.userId]);
  const failure = response.data?.failed?.[0];
  if (failure) throw new Error(failure.message);
};

const ACTIONS = {
  approve: {
    title: "Verify Company Users",
    isActionable: isUnverified,
    summary: verificationSummary,
    selectAllLabel: "Select all unverified",
    showVerifiedBanner: true,
    rowLabel: "Approve",
    busyLabel: "Approving...",
    bulkLabel: "Approve selected",
    confirmLabel: "Yes, Approve",
    confirmOne: (user: CompanyUser) => `Mark ${getUserName(user)}'s email (${user.email}) as verified?`,
    confirmMany: (count: number) => `Mark ${count} users' emails as verified?`,
    confirmNote:
      "This bypasses the standard verification email and immediately verifies their account on their behalf.",
    run: (user: CompanyUser) => jobSeekerApi.approveEmailVerification(user.userId),
    successOne: (email: string) => `Email verification has been approved for ${email}`,
    successMany: (count: number) => `Email verification has been approved for ${count} users`,
    failure: "Failed to approve email verification for",
    marksVerified: true,
  },
  resend: {
    title: "Resend Verification Email",
    isActionable: isUnverified,
    summary: verificationSummary,
    selectAllLabel: "Select all unverified",
    showVerifiedBanner: true,
    rowLabel: "Resend",
    busyLabel: "Sending...",
    bulkLabel: "Resend to selected",
    confirmLabel: "Yes, Resend Email",
    confirmOne: (user: CompanyUser) => `Resend the email verification link to ${getUserName(user)} (${user.email})?`,
    confirmMany: (count: number) => `Resend the email verification link to ${count} users?`,
    confirmNote: "They'll receive a new email prompting them to confirm their address.",
    run: (user: CompanyUser) => jobSeekerApi.sendEmailVerificationReminder(user.userId),
    successOne: (email: string) => `Email verification reminder has been sent to ${email}`,
    successMany: (count: number) => `Email verification reminder has been sent to ${count} users`,
    failure: "Failed to send email verification reminder to",
    marksVerified: false,
  },
  reset: {
    title: "Reset User Passwords",
    isActionable: (user: CompanyUser) => !!user.userId,
    summary: (users: CompanyUser[]) => `${users.length} ${users.length === 1 ? "user" : "users"}`,
    selectAllLabel: "Select all",
    showVerifiedBanner: false,
    rowLabel: "Reset",
    busyLabel: "Sending...",
    bulkLabel: "Reset selected",
    confirmLabel: "Yes, Reset Password",
    confirmOne: (user: CompanyUser) => `Send a password reset email to ${getUserName(user)} (${user.email})?`,
    confirmMany: (count: number) => `Send a password reset email to ${count} users?`,
    confirmNote: "They'll receive an email with a link to set a new password.",
    run: sendPasswordReset,
    successOne: (email: string) => `Password reset email has been sent to ${email}`,
    successMany: (count: number) => `Password reset email has been sent to ${count} users`,
    failure: "Failed to send password reset email to",
    marksVerified: false,
  },
} as const;

const Spinner = ({ className = "border-white" }: { className?: string }) => (
  <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${className}`}></div>
);

export const CompanyUserActionModal: React.FC<CompanyUserActionModalProps> = ({
  isOpen,
  onClose,
  employerId,
  companyName,
  action,
  onVerified,
}) => {
  const config = ACTIONS[action];
  const { addToast } = useToast();
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Users awaiting the admin's confirmation before the action is sent
  const [pendingUsers, setPendingUsers] = useState<CompanyUser[] | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const isProcessing = processingIds.size > 0;

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await employerApi.getEmployerById(employerId);
      if (response.success && response.data) {
        setUsers(response.data.companyUsers || []);
      } else {
        setError("Failed to load company users");
      }
    } catch (err: any) {
      console.error("Load company users error:", err);
      setError(err.message || "Failed to load company users");
    } finally {
      setIsLoading(false);
    }
  }, [employerId]);

  useEffect(() => {
    if (isOpen && employerId) {
      setSelectedIds(new Set());
      setPendingUsers(null);
      loadUsers();
    }
  }, [isOpen, employerId, loadUsers]);

  const { isActionable } = config;

  // Actionable users first so they're the first thing the admin sees
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => Number(!isActionable(a)) - Number(!isActionable(b))),
    [users, isActionable]
  );
  const actionableUsers = useMemo(() => users.filter(isActionable), [users, isActionable]);
  const allSelected = actionableUsers.length > 0 && actionableUsers.every((u) => selectedIds.has(u.id));

  const toggleSelected = (userId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(actionableUsers.map((u) => u.id)) : new Set());
  };

  const handleClose = () => {
    if (isProcessing) return;
    setUsers([]);
    setError(null);
    setSelectedIds(new Set());
    setPendingUsers(null);
    onClose();
  };

  const confirmAction = async () => {
    if (!pendingUsers?.length) return;

    const targets = pendingUsers;
    setPendingUsers(null);
    setError(null);
    setProcessingIds(new Set(targets.map((u) => u.id)));

    const results = await Promise.allSettled(targets.map((u) => config.run(u)));

    const succeededIds = new Set<string>();
    const failed: CompanyUser[] = [];
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        succeededIds.add(targets[i].id);
      } else {
        console.error(`${config.title} error:`, result.reason);
        failed.push(targets[i]);
      }
    });

    if (config.marksVerified && succeededIds.size > 0) {
      setUsers((prev) => prev.map((u) => (succeededIds.has(u.id) ? { ...u, emailVerified: true } : u)));
      onVerified?.();
    }
    setSelectedIds((prev) => new Set([...prev].filter((id) => !succeededIds.has(id))));
    setProcessingIds(new Set());

    if (succeededIds.size > 0) {
      addToast({
        variant: "success",
        title: "Success",
        message:
          succeededIds.size === 1
            ? config.successOne(targets.find((u) => succeededIds.has(u.id))?.email ?? "")
            : config.successMany(succeededIds.size),
        duration: 5000,
      });
    }

    if (failed.length > 0) {
      setError(`${config.failure}: ${failed.map((u) => u.email).join(", ")}`);
    }
  };

  const confirmMessage = pendingUsers
    ? pendingUsers.length === 1
      ? config.confirmOne(pendingUsers[0])
      : config.confirmMany(pendingUsers.length)
    : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isFullscreen={false}
      className="max-w-3xl mx-auto mt-8 mb-8 rounded-lg shadow-xl max-h-[90vh] overflow"
    >
      <div className="flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{config.title}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {companyName}
            {!isLoading && users.length > 0 && <> &middot; {config.summary(users)}</>}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          ) : users.length === 0 ? (
            !error && (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                This employer doesn&apos;t have any users yet
              </p>
            )
          ) : (
            <>
              {config.showVerifiedBanner && users.every((u) => u.emailVerified) && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-md bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400">
                  <MailCheck size={16} className="shrink-0" />
                  <p className="text-sm">All users of this employer have verified emails.</p>
                </div>
              )}

              <div className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                {actionableUsers.length > 0 && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                    <Checkbox checked={allSelected} onChange={toggleAll} disabled={isProcessing} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {config.selectAllLabel} ({actionableUsers.length})
                    </span>
                  </div>
                )}

                {sortedUsers.map((user) => {
                  const actionable = isActionable(user);
                  const isRowProcessing = processingIds.has(user.id);
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 px-4 py-3 ${actionable ? "" : "opacity-60"}`}
                    >
                      <div className="w-5 flex-shrink-0">
                        {actionable && (
                          <Checkbox
                            checked={selectedIds.has(user.id)}
                            onChange={(checked) => toggleSelected(user.id, checked)}
                            disabled={isProcessing}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{getUserName(user)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {user.role}
                      </span>
                      <EmailVerifiedBadge verified={!!user.emailVerified} />
                      <div className="w-24 flex justify-end">
                        {actionable && (
                          <button
                            type="button"
                            className="text-brand-400 text-sm text-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setPendingUsers([user])}
                            disabled={isProcessing}
                          >
                            {isRowProcessing ? (
                              <span className="flex items-center gap-2">
                                <Spinner className="border-brand-400" />
                                {config.busyLabel}
                              </span>
                            ) : (
                              config.rowLabel
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {pendingUsers ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                {confirmMessage} {config.confirmNote}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setPendingUsers(null)}>
                  Cancel
                </Button>
                <Button variant="default" type="button" onClick={confirmAction}>
                  {config.confirmLabel}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={handleClose} disabled={isProcessing}>
                Close
              </Button>
              <Button
                variant="default"
                type="button"
                onClick={() => setPendingUsers(actionableUsers.filter((u) => selectedIds.has(u.id)))}
                disabled={selectedIds.size === 0 || isProcessing || isLoading}
              >
                {isProcessing ? (
                  <>
                    <Spinner className="border-white mr-2" />
                    {config.busyLabel}
                  </>
                ) : (
                  `${config.bulkLabel} (${selectedIds.size})`
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
