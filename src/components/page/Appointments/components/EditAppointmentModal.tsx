"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import {
  appointmentQueryKeys,
  useChangeFacilitator,
  useGetFacilitators,
  useRescheduleAppointment,
} from "@/services/hooks/useAppointments";
import { Appointment } from "@/services/types/appointment";
import { showToast } from "@/services/utils/toast";

import { formatEasternDate, formatEasternTimeRange } from "../helpers";
import AdminSchedulerPanel from "./AdminSchedulerPanel";
import { useAdminScheduler } from "./useAdminScheduler";

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
}

const EditAppointmentModal: FC<Props> = ({ appointment, onClose }) => {
  const isOpen = Boolean(appointment);
  const queryClient = useQueryClient();

  const scheduler = useAdminScheduler();
  const { selectedSlot, reset } = scheduler;
  const [facilitatorId, setFacilitatorId] = useState("");
  const [reason, setReason] = useState("");

  const { data: facilitatorsResponse, isFetching: isLoadingFacilitators } = useGetFacilitators();
  const { mutateAsync: rescheduleAsync, isPending: isRescheduling } = useRescheduleAppointment();
  const { mutateAsync: changeFacilitatorAsync, isPending: isChangingFacilitator } = useChangeFacilitator();

  const isSaving = isRescheduling || isChangingFacilitator;

  const facilitatorOptions = useMemo(
    () =>
      (facilitatorsResponse?.data || []).map((facilitator) => ({
        value: facilitator.id,
        label: `${facilitator.name} — ${facilitator.title}`,
      })),
    [facilitatorsResponse]
  );

  useEffect(() => {
    if (appointment) {
      setFacilitatorId(appointment.facilitator?.id || "");
      setReason("");
      // Prefetch the first week and land on the first open day, like the public site
      reset();
    }
  }, [appointment, reset]);

  if (!appointment) {
    return null;
  }

  const hasFacilitatorChange = Boolean(facilitatorId) && facilitatorId !== (appointment.facilitator?.id || "");
  const hasScheduleChange = Boolean(selectedSlot);
  const hasChanges = hasFacilitatorChange || hasScheduleChange;

  const onSave = async () => {
    if (!hasChanges) return;

    try {
      if (selectedSlot) {
        const response = await rescheduleAsync({
          id: appointment.id,
          startAt: selectedSlot.startAt,
          reason: reason.trim() || undefined,
        });
        showToast.success("Appointment Rescheduled", response.message);
      }

      if (hasFacilitatorChange) {
        const response = await changeFacilitatorAsync({
          id: appointment.id,
          facilitatorId,
          reason: reason.trim() || undefined,
        });
        showToast.success("Facilitator Updated", response.message);
      }

      queryClient.invalidateQueries({ queryKey: appointmentQueryKeys.all });
      onClose();
    } catch (error) {
      showToast.error("Update Failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isFullscreen={false} className="max-w-xl mx-auto mt-10 rounded-xl">
      <div className="rounded-xl bg-white p-6 dark:bg-gray-800">
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Edit Appointment</h3>
        <div className="mb-4 space-y-0.5 text-sm">
          <p className="font-medium text-gray-700 dark:text-gray-300">{appointment.referenceNumber}</p>
          <p className="text-gray-500 dark:text-gray-400">
            {appointment.firstName} {appointment.lastName}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Current schedule: {formatEasternDate(appointment.startAt)},{" "}
            {formatEasternTimeRange(appointment.startAt, appointment.endAt)} ET
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Facilitator</label>
            {isLoadingFacilitators ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading facilitators...</p>
            ) : (
              <Select
                value={facilitatorId}
                onChange={setFacilitatorId}
                options={facilitatorOptions}
                placeholder="Select a facilitator"
                className="w-full"
              />
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Schedule (optional — pick a time only if you want to reschedule)
            </label>
            <AdminSchedulerPanel scheduler={scheduler} currentAppointmentStartAt={appointment.startAt} />
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

          {hasChanges && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The customer{hasFacilitatorChange ? " and the affected sales reps" : ""} will be notified by email.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" disabled={isSaving} onClick={onClose}>
            Close
          </Button>
          <Button
            variant={!hasChanges || isSaving ? "disabled" : "default"}
            disabled={!hasChanges || isSaving}
            onClick={onSave}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditAppointmentModal;
