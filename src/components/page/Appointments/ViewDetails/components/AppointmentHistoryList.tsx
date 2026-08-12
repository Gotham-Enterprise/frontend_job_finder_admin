import { FC } from "react";

import { AppointmentHistory } from "@/services/types/appointment";

import { formatEasternDateTime } from "../../helpers";

interface Props {
  histories: AppointmentHistory[];
}

const formatAction = (action: string) =>
  action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const AppointmentHistoryList: FC<Props> = ({ histories }) => {
  if (!histories || histories.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No history entries.</p>;
  }

  return (
    <ul className="space-y-4">
      {histories.map((entry) => (
        <li key={entry.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatAction(entry.action)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatEasternDateTime(entry.createdAt)} ET</p>
          </div>
          <div className="mt-1 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
            {entry.previousStartAt && entry.newStartAt && (
              <p>
                {formatEasternDateTime(entry.previousStartAt)} &rarr; {formatEasternDateTime(entry.newStartAt)} ET
              </p>
            )}
            {!entry.previousStartAt && entry.newStartAt && <p>Booked for {formatEasternDateTime(entry.newStartAt)} ET</p>}
            {entry.reason && <p>Reason: {entry.reason}</p>}
            <p>By: {entry.actor}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default AppointmentHistoryList;
