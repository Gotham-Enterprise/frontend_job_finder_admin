"use client";

import React, { useRef, useState } from "react";
import { Eye, MoreVertical, Pencil } from "lucide-react";

import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Appointment } from "@/services/types/appointment";

import { isActiveAppointmentStatus } from "../helpers";

const iconProps = { size: 16, className: "shrink-0" } as const;
const itemClass = "flex items-center gap-2 dark:text-gray-300 dark:hover:bg-white/[0.05]";

interface AppointmentRowActionsProps {
  appointment: Appointment;
  onView: (id: Appointment["id"]) => void;
  onEdit: (appointment: Appointment) => void;
}

const AppointmentRowActions: React.FC<AppointmentRowActionsProps> = ({ appointment, onView, onEdit }) => {
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
        <DropdownItem tag="button" className={itemClass} onClick={run(() => onView(appointment.id))}>
          <Eye {...iconProps} /> View
        </DropdownItem>

        {isActiveAppointmentStatus(appointment.status) && (
          <DropdownItem tag="button" className={itemClass} onClick={run(() => onEdit(appointment))}>
            <Pencil {...iconProps} /> Edit
          </DropdownItem>
        )}
      </Dropdown>
    </div>
  );
};

export default AppointmentRowActions;
