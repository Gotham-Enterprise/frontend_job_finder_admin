import { FC } from "react";

import Badge from "@/components/ui/badge/Badge";
import { AppointmentStatus } from "@/services/types/appointment";

import { APPOINTMENT_STATUS_LABELS } from "../helpers";

const STATUS_COLORS: Record<AppointmentStatus, "success" | "info" | "primary" | "warning" | "error"> = {
  SCHEDULED: "success",
  RESCHEDULED: "info",
  COMPLETED: "primary",
  NO_SHOW: "warning",
  CANCELLED_BY_USER: "error",
  CANCELLED_BY_ADMIN: "error",
};

interface Props {
  status: AppointmentStatus;
}

const Status: FC<Props> = ({ status }) => {
  return (
    <Badge variant="light" color={STATUS_COLORS[status] || "light"}>
      {APPOINTMENT_STATUS_LABELS[status] || status}
    </Badge>
  );
};

export default Status;
