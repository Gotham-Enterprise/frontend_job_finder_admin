"use client";

import React, { useRef, useState } from "react";
import { Check, Eye, Mail, MoreVertical, Pencil, X } from "lucide-react";
import { Dropdown } from "../../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../../ui/dropdown/DropdownItem";
import { Supervisor } from "@/services/types/supervisor";

const iconProps = { size: 16, className: "shrink-0" } as const;
const itemClass = "flex items-center gap-2 dark:text-gray-300 dark:hover:bg-white/[0.05]";

interface SupervisorRowActionsProps {
  supervisor: Supervisor;
  onView: (id: string) => void;
  onEdit: (id: string, name: string) => void;
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
  onResendVerification: (id: string, name: string) => void;
}

const SupervisorRowActions: React.FC<SupervisorRowActionsProps> = ({
  supervisor,
  onView,
  onEdit,
  onApprove,
  onReject,
  onResendVerification,
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const name = supervisor.fullName || supervisor.email;
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

      <Dropdown
        isOpen={open}
        onClose={close}
        referenceElement={buttonRef.current}
        className="min-w-48 py-1"
      >
        <DropdownItem
          tag="button"
          className={itemClass}
          onClick={run(() => onView(supervisor.id))}
        >
          <Eye {...iconProps} /> View details
        </DropdownItem>

        {supervisor.emailVerified === false && (
          <DropdownItem
            tag="button"
            className={itemClass}
            onClick={run(() => onResendVerification(supervisor.id, name))}
          >
            <Mail {...iconProps} /> Resend verification email
          </DropdownItem>
        )}

        <DropdownItem
          tag="button"
          className={itemClass}
          onClick={run(() => onEdit(supervisor.id, name))}
        >
          <Pencil {...iconProps} /> Edit
        </DropdownItem>

        {supervisor.verificationStatus !== "APPROVED" && (
          <DropdownItem
            tag="button"
            className={itemClass}
            onClick={run(() => onApprove(supervisor.id, name))}
          >
            <Check {...iconProps} /> Approve
          </DropdownItem>
        )}

        {supervisor.verificationStatus !== "REJECTED" && (
          <DropdownItem
            tag="button"
            className={itemClass}
            onClick={run(() => onReject(supervisor.id, name))}
          >
            <X {...iconProps} /> Reject
          </DropdownItem>
        )}
      </Dropdown>
    </div>
  );
};

export default SupervisorRowActions;
