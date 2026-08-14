export type AppointmentStatus =
  | "SCHEDULED"
  | "RESCHEDULED"
  | "CANCELLED_BY_USER"
  | "CANCELLED_BY_ADMIN"
  | "COMPLETED"
  | "NO_SHOW";

export interface AppointmentFacilitator {
  id: string;
  name: string;
  title: string;
  email: string;
  isDefault?: boolean;
}

export interface Appointment {
  id: string;
  referenceNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  companyName: string | null;
  appointmentPurpose: string;
  notes: string | null;
  startAt: string;
  endAt: string;
  previousStartAt: string | null;
  previousEndAt: string | null;
  timezone: string;
  status: AppointmentStatus;
  zoomLink: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  createdAt: string;
  facilitator?: AppointmentFacilitator | null;
}

export interface AppointmentHistory {
  id: string;
  action: string;
  previousStartAt: string | null;
  previousEndAt: string | null;
  newStartAt: string | null;
  newEndAt: string | null;
  previousStatus: string | null;
  newStatus: string | null;
  reason: string | null;
  actor: string;
  createdAt: string;
}

export interface AppointmentDetail extends Appointment {
  histories: AppointmentHistory[];
}

export interface AppointmentFilters {
  page: number;
  limit: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AppointmentsResponse {
  success: boolean;
  data: {
    items: Appointment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AppointmentDetailResponse {
  success: boolean;
  data: AppointmentDetail;
}

export interface AppointmentActionResponse {
  success: boolean;
  message: string;
  data: Appointment;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  displayTime: string;
  startAt: string;
  endAt: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  success: boolean;
  data: {
    date: string;
    timezone: string;
    timezoneLabel: string;
    durationMinutes: number;
    slots: AvailableSlot[];
  };
}

export interface RescheduleAppointmentPayload {
  id: Appointment["id"];
  startAt: string;
  reason?: string;
}

export interface CancelAppointmentPayload {
  id: Appointment["id"];
  reason?: string;
}

export interface FacilitatorsResponse {
  success: boolean;
  data: AppointmentFacilitator[];
}

export interface ChangeFacilitatorPayload {
  id: Appointment["id"];
  facilitatorId: AppointmentFacilitator["id"];
  reason?: string;
}
