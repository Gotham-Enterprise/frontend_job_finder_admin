"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface PermanentDeletionProps {
  jobSeekerId: string;
  jobSeekerName: string;
  jobSeekerEmail: string;
  isAlreadyDeleted?: boolean;
}

interface PermanentDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  jobSeekerName: string;
  jobSeekerEmail: string;
  isLoading: boolean;
}

const PermanentDeletionModal: React.FC<PermanentDeletionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  jobSeekerName,
  jobSeekerEmail,
  isLoading,
}) => {
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const confirmationText = "PERMANENTLY DELETE";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmText !== confirmationText) {
      alert(`Please type "${confirmationText}" to confirm`);
      return;
    }
    
    if (!adminPassword.trim()) {
      alert("Admin password is required");
      return;
    }
    
    onConfirm(adminPassword);
  };

  const isFormValid = confirmText === confirmationText && adminPassword.trim() !== "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Permanent Account Deletion
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              This action will permanently delete the job seeker account and mask all personal identifiable information. This action cannot be undone.
            </p>
          </div>

          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">
                  Account to be deleted:
                </h4>
                <div className="mt-1 text-sm text-red-700">
                  <p><strong>Name:</strong> {jobSeekerName}</p>
                  <p><strong>Email:</strong> {jobSeekerEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700">
                Type "{confirmationText}" to confirm:
              </label>
              <input
                type="text"
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder={confirmationText}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                Enter your admin password:
              </label>
              <input
                type="password"
                id="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder="Your admin password"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function PermanentDeletion({
  jobSeekerId,
  jobSeekerName,
  jobSeekerEmail,
  isAlreadyDeleted = false,
}: PermanentDeletionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePermanentDeletion = async (adminPassword: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/jobseekers/${jobSeekerId}/permanent-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ adminPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Job seeker account permanently deleted successfully");
        setIsModalOpen(false);
        
        // Redirect to job seekers list after successful deletion
        setTimeout(() => {
          router.push("/admin/job-seekers");
        }, 2000);
      } else {
        alert(result.message || "Failed to delete job seeker account");
      }
    } catch (error) {
      console.error("Error deleting job seeker:", error);
      alert("An error occurred while deleting the account");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAlreadyDeleted) {
    return (
      <div className="rounded-md bg-gray-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Account Already Deleted
            </h3>
            <div className="mt-1 text-sm text-gray-600">
              <p>This job seeker account has been permanently deleted and all personal information has been masked.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="border-l-4 border-red-400 bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Danger Zone
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Permanently delete this job seeker account. This action will mask all personal identifiable information
                  and cannot be undone. The user will be notified via email.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  Permanently Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PermanentDeletionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handlePermanentDeletion}
        jobSeekerName={jobSeekerName}
        jobSeekerEmail={jobSeekerEmail}
        isLoading={isLoading}
      />
    </>
  );
}
