"use client";

import { FC, useEffect, useState } from "react";

import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";

interface Props {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

const CancelModal: FC<Props> = ({ isOpen, isSubmitting, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("");
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isFullscreen={false} className="max-w-md mx-auto mt-20 rounded-xl">
      <div className="rounded-xl bg-white p-6 dark:bg-gray-800">
        <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Cancel Appointment</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          The customer will receive a cancellation email. This cannot be undone.
        </p>

        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Reason (optional)</label>
        <TextArea
          placeholder="Included in the cancellation record"
          rows={3}
          value={reason}
          onChange={setReason}
          maxLength={1000}
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" disabled={isSubmitting} onClick={onClose}>
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            disabled={isSubmitting}
            onClick={() => onConfirm(reason.trim() || undefined)}
          >
            {isSubmitting ? "Cancelling..." : "Yes, Cancel It"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelModal;
