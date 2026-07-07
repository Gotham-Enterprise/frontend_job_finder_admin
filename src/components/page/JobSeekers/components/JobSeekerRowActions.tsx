"use client";

import React, { useRef, useState } from "react";
import { Eye, KeyRound, Mail, MoreVertical, Pencil } from "lucide-react";
import { Dropdown } from "../../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../../ui/dropdown/DropdownItem";
import PermissionWrapper from "@/components/common/PermissionWrapper";

const iconProps = { size: 16, className: "shrink-0" } as const;
const itemClass = "flex items-center gap-2 dark:text-gray-300 dark:hover:bg-white/[0.05]";

interface JobSeekerRowActionsProps {
  onView: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
  onResendVerification: () => void;
  showResendVerification: boolean;
}

const JobSeekerRowActions: React.FC<JobSeekerRowActionsProps> = ({
  onView,
  onEdit,
  onResetPassword,
  onResendVerification,
  showResendVerification,
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
        title="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="dropdown-toggle p-1.5 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 rounded transition-colors"
      >
        <MoreVertical {...iconProps} />
      </button>

      <Dropdown isOpen={open} onClose={close} referenceElement={buttonRef.current} className="min-w-48 py-1">
        <PermissionWrapper module="jobseekers" action="view">
          <DropdownItem tag="button" className={itemClass} onClick={run(onView)}>
            <Eye {...iconProps} /> View details
          </DropdownItem>
        </PermissionWrapper>

        <PermissionWrapper module="jobseekers" action="edit">
          <DropdownItem tag="button" className={itemClass} onClick={run(onEdit)}>
            <Pencil {...iconProps} /> Edit
          </DropdownItem>
        </PermissionWrapper>

        <DropdownItem tag="button" className={itemClass} onClick={run(onResetPassword)}>
          <KeyRound {...iconProps} /> Reset password
        </DropdownItem>

        {showResendVerification && (
          <DropdownItem tag="button" className={itemClass} onClick={run(onResendVerification)}>
            <Mail {...iconProps} /> Resend verification email
          </DropdownItem>
        )}
      </Dropdown>
    </div>
  );
};

export default JobSeekerRowActions;
