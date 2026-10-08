import React from "react";
import { Mail, MailCheck, Pause, Play } from "lucide-react";
import { BulkRowAction } from "@/components/common/BulkActionsBar";
import { supervisionUserApi } from "@/services/api/supervisionUser";

interface SupervisionUserRow {
  emailVerified: boolean;
  hideProfile: boolean;
}

const iconClass = "h-4 w-4";

/** Bulk actions shared by the supervisor and supervisee lists (both are supervision users). */
export function supervisionUserBulkActions<T extends SupervisionUserRow>(
  selectedIdsWhere: (predicate: (row: T) => boolean) => string[],
): BulkRowAction[] {
  return [
    {
      key: "resend-verification",
      label: "Resend Verification",
      icon: <Mail className={iconClass} />,
      ids: selectedIdsWhere((row) => !row.emailVerified),
      skipReason: "already verified",
      run: supervisionUserApi.bulkResendVerificationEmail,
      confirmTitle: "Resend Verification Emails",
      confirmMessage: (target) => `Resend the email verification link to ${target}?`,
      doneMessage: "Verification email resent to",
    },
    {
      key: "approve-verification",
      label: "Approve Verification",
      icon: <MailCheck className={iconClass} />,
      ids: selectedIdsWhere((row) => !row.emailVerified),
      skipReason: "already verified",
      run: supervisionUserApi.bulkApproveEmailVerification,
      confirmTitle: "Approve Email Verification",
      confirmMessage: (target) =>
        `Mark the emails of ${target} as verified? This bypasses the verification email and verifies their accounts immediately.`,
      doneMessage: "Email verified for",
      refreshAfter: true,
      primary: true,
    },
    {
      key: "pause",
      label: "Pause Account",
      icon: <Pause className={iconClass} />,
      ids: selectedIdsWhere((row) => !row.hideProfile),
      skipReason: "already paused",
      run: (ids) => supervisionUserApi.bulkSetHideProfile(ids, true),
      confirmTitle: "Pause Accounts",
      confirmMessage: (target) =>
        `Pause ${target}? Their profiles will no longer appear in public listings until you resume them.`,
      doneMessage: "Paused",
      refreshAfter: true,
    },
    {
      key: "resume",
      label: "Resume Account",
      icon: <Play className={iconClass} />,
      ids: selectedIdsWhere((row) => row.hideProfile),
      skipReason: "not paused",
      run: (ids) => supervisionUserApi.bulkSetHideProfile(ids, false),
      confirmTitle: "Resume Accounts",
      confirmMessage: (target) => `Resume ${target}? Their profiles will reappear in public listings.`,
      doneMessage: "Resumed",
      refreshAfter: true,
    },
  ];
}
