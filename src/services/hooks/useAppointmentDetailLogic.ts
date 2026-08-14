import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { showToast } from "@/services/utils/toast";

import { AppointmentDetail, AppointmentFacilitator } from "../types/appointment";
import {
  appointmentQueryKeys,
  useCancelAppointment,
  useChangeFacilitator,
  useCompleteAppointment,
  useMarkNoShow,
  useRescheduleAppointment,
} from "./useAppointments";

export type AppointmentActionModal =
  | "reschedule"
  | "cancel"
  | "complete"
  | "no-show"
  | "facilitator"
  | null;

export interface UseAppointmentDetailLogic {
  activeModal: AppointmentActionModal;
  isBusy: boolean;
  onOpenModal: (modal: AppointmentActionModal) => void;
  onCloseModal: () => void;
  onReschedule: (startAt: string, reason?: string) => void;
  onCancel: (reason?: string) => void;
  onComplete: () => void;
  onMarkNoShow: () => void;
  onChangeFacilitator: (facilitatorId: AppointmentFacilitator["id"], reason?: string) => void;
}

export const useAppointmentDetailLogic = (appointment: AppointmentDetail): UseAppointmentDetailLogic => {
  const queryClient = useQueryClient();

  const [activeModal, setActiveModal] = useState<AppointmentActionModal>(null);

  const { mutate: reschedule, isPending: isRescheduling } = useRescheduleAppointment();
  const { mutate: cancel, isPending: isCancelling } = useCancelAppointment();
  const { mutate: complete, isPending: isCompleting } = useCompleteAppointment();
  const { mutate: markNoShow, isPending: isMarkingNoShow } = useMarkNoShow();
  const { mutate: changeFacilitator, isPending: isChangingFacilitator } = useChangeFacilitator();

  const isBusy =
    isRescheduling || isCancelling || isCompleting || isMarkingNoShow || isChangingFacilitator;

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: appointmentQueryKeys.detail(appointment.id) });
    queryClient.invalidateQueries({ queryKey: appointmentQueryKeys.lists() });
  }, [queryClient, appointment.id]);

  const onOpenModal = useCallback((modal: AppointmentActionModal) => {
    setActiveModal(modal);
  }, []);
  const onCloseModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const onReschedule = useCallback(
    (startAt: string, reason?: string) => {
      reschedule(
        { id: appointment.id, startAt, reason },
        {
          onSuccess: (data) => {
            setActiveModal(null);
            refresh();
            showToast.success("Appointment Rescheduled", data.message);
          },
          onError: (error) => {
            showToast.error("Reschedule Failed", error.message);
          },
        }
      );
    },
    [appointment.id, reschedule, refresh]
  );

  const onCancel = useCallback(
    (reason?: string) => {
      cancel(
        { id: appointment.id, reason },
        {
          onSuccess: (data) => {
            setActiveModal(null);
            refresh();
            showToast.success("Appointment Cancelled", data.message);
          },
          onError: (error) => {
            showToast.error("Cancellation Failed", error.message);
          },
        }
      );
    },
    [appointment.id, cancel, refresh]
  );

  const onComplete = useCallback(() => {
    complete(appointment.id, {
      onSuccess: (data) => {
        setActiveModal(null);
        refresh();
        showToast.success("Appointment Completed", data.message);
      },
      onError: (error) => {
        showToast.error("Update Failed", error.message);
      },
    });
  }, [appointment.id, complete, refresh]);

  const onMarkNoShow = useCallback(() => {
    markNoShow(appointment.id, {
      onSuccess: (data) => {
        setActiveModal(null);
        refresh();
        showToast.success("Marked as No-Show", data.message);
      },
      onError: (error) => {
        showToast.error("Update Failed", error.message);
      },
    });
  }, [appointment.id, markNoShow, refresh]);

  const onChangeFacilitator = useCallback(
    (facilitatorId: AppointmentFacilitator["id"], reason?: string) => {
      changeFacilitator(
        { id: appointment.id, facilitatorId, reason },
        {
          onSuccess: (data) => {
            setActiveModal(null);
            refresh();
            showToast.success("Facilitator Updated", data.message);
          },
          onError: (error) => {
            showToast.error("Facilitator Update Failed", error.message);
          },
        }
      );
    },
    [appointment.id, changeFacilitator, refresh]
  );

  return {
    activeModal,
    isBusy,
    onOpenModal,
    onCloseModal,
    onReschedule,
    onCancel,
    onComplete,
    onMarkNoShow,
    onChangeFacilitator,
  };
};
