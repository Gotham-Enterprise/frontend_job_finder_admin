"use client";

import { FC, useEffect, useState } from "react";

import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";

import AdminSchedulerPanel from "../../components/AdminSchedulerPanel";
import { useAdminScheduler } from "../../components/useAdminScheduler";

interface Props {
  isOpen: boolean;
  isSubmitting: boolean;
  currentStartAt: string;
  onClose: () => void;
  onConfirm: (startAt: string, reason?: string) => void;
}

const RescheduleModal: FC<Props> = ({ isOpen, isSubmitting, currentStartAt, onClose, onConfirm }) => {
  const scheduler = useAdminScheduler();
  const { selectedSlot, reset } = scheduler;
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      // Prefetch the first week and land on the first open day, like the public site
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isFullscreen={false} className="max-w-xl mx-auto mt-10 rounded-xl">
      <div className="rounded-xl bg-white p-6 dark:bg-gray-800">
        <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Reschedule Appointment</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Pick a new day and time. The customer will receive an email with the updated schedule.
        </p>

        <AdminSchedulerPanel scheduler={scheduler} currentAppointmentStartAt={currentStartAt} />

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason (optional)
          </label>
          <TextArea
            placeholder="Recorded in the appointment history"
            rows={3}
            value={reason}
            onChange={setReason}
            maxLength={1000}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" disabled={isSubmitting} onClick={onClose}>
            Close
          </Button>
          <Button
            variant={!selectedSlot || isSubmitting ? "disabled" : "default"}
            disabled={!selectedSlot || isSubmitting}
            onClick={() => selectedSlot && onConfirm(selectedSlot.startAt, reason.trim() || undefined)}
          >
            {isSubmitting ? "Rescheduling..." : "Reschedule"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RescheduleModal;
