"use client";

import React, { useCallback, useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useToast } from "@/context/ToastContext";
import { employerApi } from "@/services/api/employer";
import { CompanyUser } from "@/services/types/employer";
import { openLoginAsUser } from "@/services/utils/loginAsUser";

interface LoginAsCompanyUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  employerId: string;
  companyName: string;
}

const displayName = (user: CompanyUser) =>
  `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email || "User";

export default function LoginAsCompanyUserModal({
  isOpen,
  onClose,
  employerId,
  companyName,
}: LoginAsCompanyUserModalProps) {
  const { addToast } = useToast();
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<CompanyUser | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await employerApi.getEmployerById(employerId);
      const companyUsers = (response.data?.companyUsers || []).filter((user) => user.userId);
      setUsers(companyUsers);
    } catch (err: any) {
      setError(err.message || "Failed to load company users");
    } finally {
      setIsLoading(false);
    }
  }, [employerId]);

  useEffect(() => {
    if (isOpen && employerId) {
      setPendingUser(null);
      loadUsers();
    }
  }, [isOpen, employerId, loadUsers]);

  const confirmLogin = async () => {
    if (!pendingUser?.userId) return;
    const user = pendingUser;
    setIsStarting(true);
    try {
      await openLoginAsUser(user.userId);
      addToast({
        variant: "success",
        title: "Login as user",
        message: `Opened the app as ${displayName(user)}.`,
        duration: 5000,
      });
      setPendingUser(null);
      onClose();
    } catch (err: any) {
      addToast({
        variant: "error",
        title: "Could not login as user",
        message: err.message || "Failed to open the user's account",
        duration: 5000,
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isFullscreen={false}
        className="max-w-lg w-full rounded-lg"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Login as User</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Choose a user at {companyName}. The app opens in a new tab with that user&apos;s access.
          </p>

          <div className="mt-4 max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="py-6 text-sm text-gray-500 dark:text-gray-400">Loading users...</p>
            ) : error ? (
              <p className="py-6 text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : users.length === 0 ? (
              <p className="py-6 text-sm text-gray-500 dark:text-gray-400">This company has no users to sign in as.</p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <li key={user.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {displayName(user)}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                        {user.role ? ` · ${user.role}` : ""}
                        {user.status ? ` · ${user.status}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingUser(user)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-md border border-brand-500 px-3 py-1.5 text-sm text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-white/5"
                    >
                      <LogIn size={16} />
                      Login as User
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={pendingUser !== null}
        onClose={() => {
          if (!isStarting) setPendingUser(null);
        }}
        onCancel={() => {
          if (!isStarting) setPendingUser(null);
        }}
        onConfirm={confirmLogin}
        title="Login as User"
        message={
          pendingUser
            ? `Open the application as ${displayName(pendingUser)} (${pendingUser.email})? Your admin session stays signed in. Use Exit impersonation in the app to return.`
            : ""
        }
        confirmText="Login as User"
        cancelText="Cancel"
        isLoading={isStarting}
      />
    </>
  );
}
