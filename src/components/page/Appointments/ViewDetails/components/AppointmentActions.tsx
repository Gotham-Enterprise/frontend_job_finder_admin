"use client";

import { FC } from "react";

import Button from "@/components/ui/button/Button";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { UseAppointmentDetailLogic } from "@/services/hooks/useAppointmentDetailLogic";
import { AppointmentDetail } from "@/services/types/appointment";

import { formatEasternDateTime } from "../../helpers";
import CancelModal from "./CancelModal";
import ChangeFacilitatorModal from "./ChangeFacilitatorModal";
import RescheduleModal from "./RescheduleModal";

interface Props {
  appointment: AppointmentDetail;
  logic: UseAppointmentDetailLogic;
}

const AppointmentActions: FC<Props> = ({ appointment, logic }) => {
  const {
    activeModal,
    isBusy,
    onOpenModal,
    onCloseModal,
    onReschedule,
    onCancel,
    onComplete,
    onMarkNoShow,
    onChangeFacilitator,
  } = logic;

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
        <Button variant="outlinePrimary" disabled={isBusy} onClick={() => onOpenModal("reschedule")}>
          Reschedule
        </Button>
        <Button variant="outlinePrimary" disabled={isBusy} onClick={() => onOpenModal("facilitator")}>
          Change Facilitator
        </Button>
        <Button variant="default" disabled={isBusy} onClick={() => onOpenModal("complete")}>
          Mark Completed
        </Button>
        <Button variant="warning" disabled={isBusy} onClick={() => onOpenModal("no-show")}>
          Mark No-Show
        </Button>
        <Button variant="destructive" disabled={isBusy} onClick={() => onOpenModal("cancel")}>
          Cancel Appointment
        </Button>
      </div>

      <RescheduleModal
        isOpen={activeModal === "reschedule"}
        isSubmitting={isBusy}
        currentStartAt={appointment.startAt}
        onClose={onCloseModal}
        onConfirm={onReschedule}
      />

      <CancelModal
        isOpen={activeModal === "cancel"}
        isSubmitting={isBusy}
        onClose={onCloseModal}
        onConfirm={onCancel}
      />

      <ChangeFacilitatorModal
        isOpen={activeModal === "facilitator"}
        isSubmitting={isBusy}
        currentFacilitatorId={appointment.facilitator?.id}
        onClose={onCloseModal}
        onConfirm={onChangeFacilitator}
      />

      <ConfirmationDialog
        isOpen={activeModal === "complete"}
        onClose={onCloseModal}
        onCancel={onCloseModal}
        onConfirm={onComplete}
        title="Mark as Completed"
        message={`Mark the appointment with ${appointment.firstName} ${appointment.lastName} on ${formatEasternDateTime(appointment.startAt)} ET as completed?`}
        confirmText="Mark Completed"
        isLoading={isBusy}
      />

      <ConfirmationDialog
        isOpen={activeModal === "no-show"}
        onClose={onCloseModal}
        onCancel={onCloseModal}
        onConfirm={onMarkNoShow}
        title="Mark as No-Show"
        message={`Mark the appointment with ${appointment.firstName} ${appointment.lastName} on ${formatEasternDateTime(appointment.startAt)} ET as a no-show?`}
        confirmText="Mark No-Show"
        isLoading={isBusy}
      />
    </>
  );
};

export default AppointmentActions;
