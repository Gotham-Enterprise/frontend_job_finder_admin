import { FC } from "react";
import { CheckCircle, XCircle, FilePlus, Pencil } from "lucide-react";

import { DocumentVerificationHistoryEntry } from "@/services/types/documentVerification";
import { formatDateTime } from "@/services/utils";
import { fieldLabel, formatFieldValue } from "./documentFieldLabels";

interface Props {
  history: DocumentVerificationHistoryEntry[];
}

const ACTION_COPY: Record<string, string> = {
  WALLET_CREDENTIAL_SUBMITTED: "submitted this document",
  WALLET_CREDENTIAL_UPDATED: "updated this document",
  DOCUMENT_VERIFICATION_APPROVED: "approved this document",
  DOCUMENT_VERIFICATION_REJECTED: "rejected this document",
};

function ActionIcon({ action }: { action: string }) {
  const className = "h-4 w-4";
  switch (action) {
    case "DOCUMENT_VERIFICATION_APPROVED":
      return <CheckCircle className={`${className} text-emerald-600`} />;
    case "DOCUMENT_VERIFICATION_REJECTED":
      return <XCircle className={`${className} text-red-600`} />;
    case "WALLET_CREDENTIAL_SUBMITTED":
      return <FilePlus className={`${className} text-gray-500`} />;
    default:
      return <Pencil className={`${className} text-amber-600`} />;
  }
}

const ViewDetailHistory: FC<Props> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="mb-4 text-xs font-medium uppercase text-gray-500">History</p>
      <ul className="space-y-5">
        {history.map((entry) => (
          <li key={entry.id} className="flex gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <ActionIcon action={entry.action} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">{entry.actor.name || entry.actor.role}</span>{" "}
                {ACTION_COPY[entry.action] ?? entry.action.toLowerCase().replace(/_/g, " ")}
              </p>
              <p className="text-xs text-gray-400">{formatDateTime(entry.timestamp)}</p>

              {entry.details?.rejectionReason && (
                <p className="mt-1.5 text-sm text-red-600">{entry.details.rejectionReason}</p>
              )}

              {entry.details?.changes && entry.details.changes.length > 0 && (
                <div className="mt-2 space-y-1 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                  {entry.details.changes.map((change) => (
                    <p key={change.field} className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {fieldLabel(change.field)}:
                      </span>{" "}
                      {formatFieldValue(change.field, change.from)} →{" "}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatFieldValue(change.field, change.to)}
                      </span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewDetailHistory;
