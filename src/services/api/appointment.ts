import {
  Appointment,
  AppointmentActionResponse,
  AppointmentDetailResponse,
  AppointmentFilters,
  AppointmentsResponse,
  AvailableSlotsResponse,
  CancelAppointmentPayload,
  ChangeFacilitatorPayload,
  FacilitatorsResponse,
  RescheduleAppointmentPayload,
} from "../types/appointment";
import { apiGet, apiPatch } from "./apiUtils";

export const appointmentApi = {
  async getAppointments(filters: AppointmentFilters): Promise<AppointmentsResponse> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.dateFrom) queryParams.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) queryParams.append("dateTo", filters.dateTo);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

    const endpoint = `/api/admin/appointments?${queryParams.toString()}`;

    return apiGet<AppointmentsResponse>(endpoint);
  },
  async getAppointmentDetails(id: Appointment["id"]): Promise<AppointmentDetailResponse> {
    const endpoint = `/api/admin/appointments/${id}`;

    return apiGet<AppointmentDetailResponse>(endpoint);
  },
  async rescheduleAppointment(data: RescheduleAppointmentPayload): Promise<AppointmentActionResponse> {
    const endpoint = `/api/admin/appointments/${data.id}/reschedule`;

    return apiPatch<AppointmentActionResponse>(endpoint, {
      startAt: data.startAt,
      reason: data.reason || undefined,
    });
  },
  async cancelAppointment(data: CancelAppointmentPayload): Promise<AppointmentActionResponse> {
    const endpoint = `/api/admin/appointments/${data.id}/cancel`;

    return apiPatch<AppointmentActionResponse>(endpoint, { reason: data.reason || undefined });
  },
  async completeAppointment(id: Appointment["id"]): Promise<AppointmentActionResponse> {
    const endpoint = `/api/admin/appointments/${id}/complete`;

    return apiPatch<AppointmentActionResponse>(endpoint);
  },
  async markNoShow(id: Appointment["id"]): Promise<AppointmentActionResponse> {
    const endpoint = `/api/admin/appointments/${id}/no-show`;

    return apiPatch<AppointmentActionResponse>(endpoint);
  },
  async getFacilitators(): Promise<FacilitatorsResponse> {
    const endpoint = `/api/admin/appointments/facilitators`;

    return apiGet<FacilitatorsResponse>(endpoint);
  },
  async changeFacilitator(data: ChangeFacilitatorPayload): Promise<AppointmentActionResponse> {
    const endpoint = `/api/admin/appointments/${data.id}/facilitator`;

    return apiPatch<AppointmentActionResponse>(endpoint, {
      facilitatorId: data.facilitatorId,
      reason: data.reason || undefined,
    });
  },
  // Public endpoint shared with the customer-facing scheduler; used by the admin reschedule modal
  async getAvailableSlots(date: string): Promise<AvailableSlotsResponse> {
    const endpoint = `/api/appointments/available-slots?date=${date}`;

    return apiGet<AvailableSlotsResponse>(endpoint);
  },
};
