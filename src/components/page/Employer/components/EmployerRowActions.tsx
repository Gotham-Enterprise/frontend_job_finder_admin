"use client";

import React, { useRef, useState } from "react";
import { Eye, Mail, MailCheck, MoreVertical, Pencil } from "lucide-react";
import { Dropdown } from "../../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../../ui/dropdown/DropdownItem";
import PermissionWrapper from "@/components/common/PermissionWrapper";

const iconProps = { size: 16, className: "shrink-0" } as const;
const itemClass = "flex items-center gap-2 dark:text-gray-300 dark:hover:bg-white/[0.05]";

interface EmployerRowActionsProps {
  onView: () => void;
  onEdit: () => void;
  onVerifyUsers: () => void;
  onResendVerification: () => void;
  showVerificationActions: boolean;
}

const EmployerRowActions: React.FC<EmployerRowActionsProps> = ({
  onView,
  onEdit,
  onVerifyUsers,
  onResendVerification,
  showVerificationActions,
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

      <Dropdown isOpen={open} onClose={close} referenceElement={buttonRef.current} className="min-w-56 py-1">
        <PermissionWrapper module="employers" action="view">
          <DropdownItem tag="button" className={itemClass} onClick={run(onView)}>
            <Eye {...iconProps} /> View Details
          </DropdownItem>
        </PermissionWrapper>

        <PermissionWrapper module="employers" action="edit">
          <DropdownItem tag="button" className={itemClass} onClick={run(onEdit)}>
            <Pencil {...iconProps} /> Edit
          </DropdownItem>
        </PermissionWrapper>

        {showVerificationActions && (
          <>
            <PermissionWrapper module="employers" action="edit">
              <DropdownItem tag="button" className={itemClass} onClick={run(onVerifyUsers)}>
                <MailCheck {...iconProps} /> Verify Users
              </DropdownItem>
            </PermissionWrapper>

            <PermissionWrapper module="employers" action="edit">
              <DropdownItem tag="button" className={itemClass} onClick={run(onResendVerification)}>
                <Mail {...iconProps} /> Resend Verification Email
              </DropdownItem>
            </PermissionWrapper>
          </>
        )}
      </Dropdown>
    </div>
  );
};

export default EmployerRowActions;
