"use client";

import { FC } from "react";

import { AppointmentDetail } from "@/services/types/appointment";
import { useAppointmentDetailLogic } from "@/services/hooks/useAppointmentDetailLogic";

import {
  APPOINTMENT_FACILITATOR,
  APPOINTMENT_STATUS_LABELS,
  formatEasternDateTime,
  formatEasternFullDate,
  formatEasternTimeRange,
  isActiveAppointmentStatus,
} from "../../helpers";
import Status from "../../components/Status";
import AppointmentActions from "./AppointmentActions";
import AppointmentHistoryList from "./AppointmentHistoryList";

interface Props {
  appointment: AppointmentDetail;
}

const InfoRow: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <div className="text-sm font-medium text-gray-900 dark:text-white">{children}</div>
  </div>
);

const DetailWrapper: FC<Props> = ({ appointment }) => {
  const logic = useAppointmentDetailLogic(appointment);
  const isActive = isActiveAppointmentStatus(appointment.status);

  return (
    <div className="grid grid-cols-1 gap-6 px-4 pt-6 pb-10 xl:grid-cols-3">
      {/* Customer details */}
      <div className="col-span-full xl:col-auto">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Customer</h3>
          <div className="space-y-4">
            <InfoRow label="Name">
              {appointment.firstName} {appointment.lastName}
            </InfoRow>
            {appointment.companyName && <InfoRow label="Company">{appointment.companyName}</InfoRow>}
            <InfoRow label="Email">
              <a href={`mailto:${appointment.email}`} className="text-brand-500 hover:underline">
                {appointment.email}
              </a>
            </InfoRow>
            {appointment.phoneNumber && <InfoRow label="Phone">{appointment.phoneNumber}</InfoRow>}
            <InfoRow label="Purpose">{appointment.appointmentPurpose}</InfoRow>
            {appointment.notes && (
              <InfoRow label="Notes">
                <p className="whitespace-pre-wrap font-normal">{appointment.notes}</p>
              </InfoRow>
            )}
            <InfoRow label="Submitted">{formatEasternDateTime(appointment.createdAt)} ET</InfoRow>
          </div>
        </div>
      </div>

      {/* Schedule + actions + history */}
      <div className="col-span-full space-y-6 xl:col-span-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Appointment</h3>
            <Status status={appointment.status} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow label="Reference">{appointment.referenceNumber}</InfoRow>
            <InfoRow label="Facilitator">
              {appointment.facilitator?.name || APPOINTMENT_FACILITATOR.name}
              <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                {appointment.facilitator?.title || APPOINTMENT_FACILITATOR.title}
              </span>
            </InfoRow>
            <InfoRow label="Timezone">Eastern Time (US &amp; Canada)</InfoRow>
            <InfoRow label="Date">{formatEasternFullDate(appointment.startAt)}</InfoRow>
            <InfoRow label="Time">{formatEasternTimeRange(appointment.startAt, appointment.endAt)} ET</InfoRow>
            {appointment.previousStartAt && (
              <InfoRow label="Previous Schedule">{formatEasternDateTime(appointment.previousStartAt)} ET</InfoRow>
            )}
            {appointment.zoomLink && (
              <InfoRow label="Zoom Link">
                <a
                  href={appointment.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-500 hover:underline break-all"
                >
                  {appointment.zoomLink}
                </a>
              </InfoRow>
            )}
            {appointment.cancellationReason && (
              <InfoRow label={`Cancellation Reason${appointment.cancelledBy ? ` (${appointment.cancelledBy})` : ""}`}>
                <p className="whitespace-pre-wrap font-normal">{appointment.cancellationReason}</p>
              </InfoRow>
            )}
          </div>

          {isActive ? (
            <AppointmentActions appointment={appointment} logic={logic} />
          ) : (
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              This appointment is {APPOINTMENT_STATUS_LABELS[appointment.status].toLowerCase()} and can no longer be
              updated.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">History</h3>
          <AppointmentHistoryList histories={appointment.histories} />
        </div>
      </div>
    </div>
  );
};

export default DetailWrapper;
