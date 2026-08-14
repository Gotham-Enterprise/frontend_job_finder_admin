import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { appointmentApi } from "../api/appointment";
import {
  Appointment,
  AppointmentFilters,
  CancelAppointmentPayload,
  ChangeFacilitatorPayload,
  RescheduleAppointmentPayload,
} from "../types/appointment";

export const appointmentQueryKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentQueryKeys.all, "list"] as const,
  list: (filters: AppointmentFilters) => [...appointmentQueryKeys.lists(), filters] as const,
  details: () => [...appointmentQueryKeys.all, "details"] as const,
  detail: (id: string) => [...appointmentQueryKeys.details(), id] as const,
  slots: (date: string) => [...appointmentQueryKeys.all, "slots", date] as const,
  facilitators: () => [...appointmentQueryKeys.all, "facilitators"] as const,
};

const staleTime = 1000 * 60 * 5; // 5 minutes
const retry = (failureCount: number, error: Error) => {
  if (error.message.includes("HTTP 401")) {
    return false;
  }
  return failureCount < 3;
};
const retryDelay = (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000);

export const useGetAppointments = (filters: AppointmentFilters) => {
  return useQuery({
    retry,
    retryDelay,
    staleTime,
    queryKey: appointmentQueryKeys.list(filters),
    queryFn: () => {
      return appointmentApi.getAppointments(filters);
    },
    // Keep the previous rows on screen while a new page/sort/filter loads,
    // so the table doesn't flash the loading row on every change.
    placeholderData: keepPreviousData,
  });
};

export const useGetAppointmentDetails = (id: Appointment["id"]) => {
  return useQuery({
    retry,
    retryDelay,
    staleTime,
    queryKey: appointmentQueryKeys.detail(id),
    queryFn: () => {
      return appointmentApi.getAppointmentDetails(id);
    },
  });
};

// Availability changes as bookings come in, so always fetch fresh slots
export const useGetAvailableSlots = (date: string) => {
  return useQuery({
    retry,
    retryDelay,
    staleTime: 0,
    enabled: Boolean(date),
    queryKey: appointmentQueryKeys.slots(date),
    queryFn: () => {
      return appointmentApi.getAvailableSlots(date);
    },
  });
};

export const useRescheduleAppointment = () => {
  return useMutation({
    mutationFn: (data: RescheduleAppointmentPayload) => appointmentApi.rescheduleAppointment(data),
  });
};

export const useCancelAppointment = () => {
  return useMutation({
    mutationFn: (data: CancelAppointmentPayload) => appointmentApi.cancelAppointment(data),
  });
};

export const useCompleteAppointment = () => {
  return useMutation({
    mutationFn: (id: Appointment["id"]) => appointmentApi.completeAppointment(id),
  });
};

export const useMarkNoShow = () => {
  return useMutation({
    mutationFn: (id: Appointment["id"]) => appointmentApi.markNoShow(id),
  });
};

export const useGetFacilitators = () => {
  return useQuery({
    retry,
    retryDelay,
    staleTime,
    queryKey: appointmentQueryKeys.facilitators(),
    queryFn: () => {
      return appointmentApi.getFacilitators();
    },
  });
};

export const useChangeFacilitator = () => {
  return useMutation({
    mutationFn: (data: ChangeFacilitatorPayload) => appointmentApi.changeFacilitator(data),
  });
};
