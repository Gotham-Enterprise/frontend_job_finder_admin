"use client";

import React, { useRef, useState } from "react";
import { Eye, EyeOff, Mail, MoreVertical, Pencil } from "lucide-react";
import { Dropdown } from "../../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../../ui/dropdown/DropdownItem";
import { Supervisee } from "@/services/types/supervisee";

const iconProps = { size: 16, className: "shrink-0" } as const;
const itemClass = "flex items-center gap-2 dark:text-gray-300 dark:hover:bg-white/[0.05]";

interface SuperviseeRowActionsProps {
  supervisee: Supervisee;
  onView: (id: string) => void;
  onEdit: (id: string, name: string) => void;
  onResendVerification: (id: string, name: string) => void;
  onToggleHideProfile: (id: string, name: string, currentlyHidden: boolean) => void;
}

const SuperviseeRowActions: React.FC<SuperviseeRowActionsProps> = ({
  supervisee,
  onView,
  onEdit,
  onResendVerification,
  onToggleHideProfile,
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const name = supervisee.fullName || supervisee.email;
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
          onClick={run(() => onView(supervisee.id))}
        >
          <Eye {...iconProps} /> View details
        </DropdownItem>

        {!supervisee.emailVerified && (
          <DropdownItem
            tag="button"
            className={itemClass}
            onClick={run(() => onResendVerification(supervisee.id, name))}
          >
            <Mail {...iconProps} /> Resend verification email
          </DropdownItem>
        )}

        <DropdownItem
          tag="button"
          className={itemClass}
          onClick={run(() => onEdit(supervisee.id, name))}
        >
          <Pencil {...iconProps} /> Edit
        </DropdownItem>

        <DropdownItem
          tag="button"
          className={itemClass}
          onClick={run(() => onToggleHideProfile(supervisee.id, name, supervisee.hideProfile))}
        >
          {supervisee.hideProfile ? (
            <>
              <Eye {...iconProps} /> Show profile
            </>
          ) : (
            <>
              <EyeOff {...iconProps} /> Hide profile
            </>
          )}
        </DropdownItem>
      </Dropdown>
    </div>
  );
};

export default SuperviseeRowActions;
