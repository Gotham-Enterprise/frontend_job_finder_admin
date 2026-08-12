"use client";

import { FC, useEffect, useMemo, useState } from "react";

import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useGetFacilitators } from "@/services/hooks/useAppointments";
import { AppointmentFacilitator } from "@/services/types/appointment";

interface Props {
  isOpen: boolean;
  isSubmitting: boolean;
  currentFacilitatorId?: AppointmentFacilitator["id"] | null;
  onClose: () => void;
  onConfirm: (facilitatorId: AppointmentFacilitator["id"], reason?: string) => void;
}

const ChangeFacilitatorModal: FC<Props> = ({
  isOpen,
  isSubmitting,
  currentFacilitatorId,
  onClose,
  onConfirm,
}) => {
  const [facilitatorId, setFacilitatorId] = useState("");
  const [reason, setReason] = useState("");

  const { data: facilitatorsResponse, isFetching: isLoadingFacilitators } = useGetFacilitators();

  const options = useMemo(
    () =>
      (facilitatorsResponse?.data || [])
        .filter((facilitator) => facilitator.id !== currentFacilitatorId)
        .map((facilitator) => ({
          value: facilitator.id,
          label: `${facilitator.name} — ${facilitator.title}`,
        })),
    [facilitatorsResponse, currentFacilitatorId]
  );

  useEffect(() => {
    if (!isOpen) {
      setFacilitatorId("");
      setReason("");
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isFullscreen={false} className="max-w-md mx-auto mt-20 rounded-xl">
      <div className="rounded-xl bg-white p-6 dark:bg-gray-800">
        <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Change Facilitator</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          The customer, the current facilitator, and the new facilitator will each be notified by email.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Facilitator
            </label>
            {isLoadingFacilitators ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading facilitators...</p>
            ) : options.length > 0 ? (
              <Select
                value={facilitatorId}
                onChange={setFacilitatorId}
                options={options}
                placeholder="Select a facilitator"
                className="w-full"
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No other facilitators are available yet. Add one to the Facilitator table to enable
                reassignment.
              </p>
            )}
          </div>

          <div>
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
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" disabled={isSubmitting} onClick={onClose}>
            Close
          </Button>
          <Button
            variant={!facilitatorId || isSubmitting ? "disabled" : "default"}
            disabled={!facilitatorId || isSubmitting}
            onClick={() => facilitatorId && onConfirm(facilitatorId, reason.trim() || undefined)}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangeFacilitatorModal;
