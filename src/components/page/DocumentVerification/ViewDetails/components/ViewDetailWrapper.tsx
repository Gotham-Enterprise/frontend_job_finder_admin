import { FC } from "react";

import { useDocumentVerificationDetailLogic } from "@/services/hooks/useDocumentVerificationDetailLogic";
import { DocumentVerificationDetailResponse } from "@/services/types/documentVerification";

import { CandidateInfo, DocumentInfo, Actions, History } from ".";

interface Props {
  data: DocumentVerificationDetailResponse;
}

const DetailWrapper: FC<Props> = ({ data }) => {
  const { document, isLoading, isPendingStatus, isStatusUpdated, displayReview, onToggleReview, onUpdateStatus } =
    useDocumentVerificationDetailLogic(data);

  return (
    <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
      <div className="col-span-full xl:col-auto">
        <CandidateInfo candidate={document.candidate} />
      </div>
      <div className="col-span-2 space-y-6">
        <DocumentInfo document={document} />
        <History history={document.history} />
        <Actions
          document={document}
          isLoading={isLoading}
          displayReview={displayReview}
          isPendingStatus={isPendingStatus}
          isStatusUpdated={isStatusUpdated}
          onToggleReview={onToggleReview}
          onUpdateStatus={onUpdateStatus}
        />
      </div>
    </div>
  );
};

export default DetailWrapper;
