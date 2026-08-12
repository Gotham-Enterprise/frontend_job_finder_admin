import { AppointmentStatus } from "@/services/types/appointment";

// All appointments are booked in Eastern Time on the customer site
const APPOINTMENT_TIMEZONE = "America/New_York";

export const formatEasternDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: APPOINTMENT_TIMEZONE,
  }).format(new Date(iso));

export const formatEasternFullDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: APPOINTMENT_TIMEZONE,
  }).format(new Date(iso));

export const formatEasternTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: APPOINTMENT_TIMEZONE,
  }).format(new Date(iso));

export const formatEasternTimeRange = (startAt: string, endAt: string) =>
  `${formatEasternTime(startAt)} - ${formatEasternTime(endAt)}`;

export const formatEasternDateTime = (iso: string) =>
  `${formatEasternDate(iso)}, ${formatEasternTime(iso)}`;

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  RESCHEDULED: "Rescheduled",
  COMPLETED: "Completed",
  NO_SHOW: "No Show",
  CANCELLED_BY_USER: "Cancelled by User",
  CANCELLED_BY_ADMIN: "Cancelled by Admin",
};

export const isActiveAppointmentStatus = (status: AppointmentStatus) =>
  status === "SCHEDULED" || status === "RESCHEDULED";

// All sales appointments are currently facilitated by a single host,
// mirroring the HOST_* constants in the backend's appointment_service.js
export const APPOINTMENT_FACILITATOR = {
  name: "Adam Berkowitz",
  title: "VP of Partnerships",
};
