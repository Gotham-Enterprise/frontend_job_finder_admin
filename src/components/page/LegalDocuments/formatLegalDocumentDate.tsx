import React from "react";
import { formatDateTimeEST } from "@/services/utils/dateUtils";

export const formatLegalDocumentDateLabel = (
  dateString: string | undefined | null,
): string => {
  const formatted = formatDateTimeEST(dateString);
  if (typeof formatted === "string") {
    return formatted;
  }
  return `${formatted.date} at ${formatted.time}`;
};

export const LegalDocumentDateCell: React.FC<{
  dateString: string | undefined | null;
}> = ({ dateString }) => {
  const formatted = formatDateTimeEST(dateString);

  if (typeof formatted === "string") {
    return <span>{formatted}</span>;
  }

  return (
    <div>
      <div>{formatted.date}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{formatted.time}</div>
    </div>
  );
};
