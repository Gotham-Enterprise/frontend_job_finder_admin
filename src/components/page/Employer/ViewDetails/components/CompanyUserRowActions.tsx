"use client";

import React, { useRef, useState } from "react";
import { KeyRound, Mail, MailCheck, MoreVertical, UserCheck, UserX } from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

const iconProps = { size: 16, className: "shrink-0" } as const;
const itemClass = "flex items-center gap-2 dark:text-gray-300 dark:hover:bg-white/[0.05]";

interface CompanyUserRowActionsProps {
  isActive: boolean;
  isBusy: boolean;
  showVerificationActions: boolean;
  onResendVerification: () => void;
  onApproveVerification: () => void;
  onResetPassword: () => void;
  onToggleStatus: () => void;
}

const CompanyUserRowActions: React.FC<CompanyUserRowActionsProps> = ({
  isActive,
  isBusy,
  showVerificationActions,
  onResendVerification,
  onApproveVerification,
  onResetPassword,
  onToggleStatus,
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const close = () => setOpen(false);
  const run = (fn: () => void) => () => {
    close();
    fn();
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isBusy}
        title="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="dropdown-toggle p-1.5 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 rounded transition-colors disabled:cursor-not-allowed"
      >
        {isBusy ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-400"></div>
        ) : (
          <MoreVertical {...iconProps} />
        )}
      </button>

      <Dropdown isOpen={open} onClose={close} referenceElement={buttonRef.current} className="min-w-52 py-1">
        {showVerificationActions && (
          <>
            <DropdownItem tag="button" className={itemClass} onClick={run(onResendVerification)}>
              <Mail {...iconProps} /> Resend Verification Email
            </DropdownItem>
            <DropdownItem tag="button" className={itemClass} onClick={run(onApproveVerification)}>
              <MailCheck {...iconProps} /> Approve Email Verification
            </DropdownItem>
          </>
        )}

        <DropdownItem tag="button" className={itemClass} onClick={run(onResetPassword)}>
          <KeyRound {...iconProps} /> Reset Password
        </DropdownItem>

        <DropdownItem
          tag="button"
          className={`flex items-center gap-2 dark:hover:bg-white/[0.05] ${
            isActive ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
          }`}
          onClick={run(onToggleStatus)}
        >
          {isActive ? <UserX {...iconProps} /> : <UserCheck {...iconProps} />}
          {isActive ? "Deactivate" : "Reactivate"}
        </DropdownItem>
      </Dropdown>
    </div>
  );
};

export default CompanyUserRowActions;
