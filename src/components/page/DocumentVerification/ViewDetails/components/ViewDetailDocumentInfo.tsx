import { FC } from "react";
import { FileText } from "lucide-react";

import { DocumentVerificationDetailResponse } from "@/services/types/documentVerification";
import Status from "../../components/Status";
import { formatDateTime } from "@/services/utils";

interface Props {
  document: DocumentVerificationDetailResponse["data"];
}

function humanizeCategory(category: string): string {
  return category.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

const ViewDetailDocumentInfo: FC<Props> = ({ document }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">{humanizeCategory(document.category)}</p>
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold">{document.documentName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Submitted {formatDateTime(document.createdAt)}
            </p>
          </div>
          <Status status={document.verificationStatus} />
        </div>

        {document.verificationStatus === "rejected" && document.verificationRejectionReason && (
          <div className="rounded-lg bg-red-50 dark:bg-red-500/10 p-4">
            <p className="text-xs font-medium uppercase text-red-600">Rejection reason</p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">{document.verificationRejectionReason}</p>
          </div>
        )}

        {document.documentUrl ? (
          <a
            href={document.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900 w-fit"
          >
            <FileText className="h-5 w-5 text-emerald-700" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {document.fileName || "View document"}
            </span>
          </a>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No document uploaded</p>
        )}
      </div>
    </div>
  );
};

export default ViewDetailDocumentInfo;
