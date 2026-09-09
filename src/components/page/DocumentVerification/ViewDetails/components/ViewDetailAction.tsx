import { FC, useEffect, useState } from "react";

import Avatar from "@/components/ui/avatar/Avatar";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { AccountCheckCircleIcon } from "@/icons";
import { DocumentVerificationDetailResponse, UseDocumentVerificationDetailLogic } from "@/services/types/documentVerification";
import RejectionReasonModal from "../../components/RejectionReasonModal";
import { displayableFieldEntries, fieldLabel, formatFieldValue } from "./documentFieldLabels";

interface Props {
  document: UseDocumentVerificationDetailLogic["document"];
  isLoading: UseDocumentVerificationDetailLogic["isLoading"];
  displayReview: UseDocumentVerificationDetailLogic["displayReview"];
  isPendingStatus: UseDocumentVerificationDetailLogic["isPendingStatus"];
  isStatusUpdated: UseDocumentVerificationDetailLogic["isStatusUpdated"];
  onToggleReview: UseDocumentVerificationDetailLogic["onToggleReview"];
  onUpdateStatus: UseDocumentVerificationDetailLogic["onUpdateStatus"];
}

const ResultModal: FC<{
  isStatusUpdated: UseDocumentVerificationDetailLogic["isStatusUpdated"];
  status: "verified" | "rejected";
}> = ({ isStatusUpdated, status }) => {
  const { isOpen, openModal, closeModal } = useModal(false);

  useEffect(() => {
    if (isStatusUpdated) {
      openModal();
    } else {
      closeModal();
    }
  }, [isStatusUpdated, openModal, closeModal]);

  const handleClose = () => {
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[680px] p-6 lg:p-10 rounded-2xl" isFullscreen={false}>
      <div className="flex flex-col gap-4 items-center">
        <AccountCheckCircleIcon />
        <h1 className="text-center text-3xl capitalize text-gray-900 font-semibold">
          {status === "verified" ? "Document Approved" : "Document Rejected"}
        </h1>
        {status === "verified" && (
          <p className="text-center text-md">
            A confirmation email has been sent to the candidate with further instructions.
          </p>
        )}
        <div className="flex items-center justify-center gap-4">
          <Button onClick={handleClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
};

const ViewDetailActionReview: FC<Props> = ({
  document,
  displayReview,
  isLoading,
  isPendingStatus,
  isStatusUpdated,
  onToggleReview,
  onUpdateStatus,
}) => {
  const { isOpen, openModal, closeModal } = useModal(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [status, setStatus] = useState<"verified" | "rejected">("verified");

  useEffect(() => {
    if (displayReview) {
      openModal();
    } else {
      closeModal();
    }
  }, [displayReview, openModal, closeModal]);

  const handleClose = () => {
    onToggleReview();
  };

  const handleApprove = () => {
    setStatus("verified");
    onUpdateStatus("verified");
  };

  const handleRejectConfirm = (reason: string) => {
    setStatus("rejected");
    setShowRejectModal(false);
    onUpdateStatus("rejected", reason);
  };

  return (
    <>
      <Button onClick={onToggleReview}>Review Document</Button>
      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[720px] p-6 rounded-2xl z-999" isFullscreen={false}>
        <div className="flex flex-col gap-10">
          <h3 className="text-gray-900 text-xl font-semibold">
            Please review the document and either approve or reject it.
          </h3>
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-2 items-center">
              <Avatar
                alt={document.candidate.name}
                name={document.candidate.name}
                size="xlarge"
                className="rounded-full"
              />
              <div className="flex flex-col gap-1">
                <h2 className="text-gray-900 text-xl font-semibold">{document.candidate.name}</h2>
                <p className="text-sm text-gray-900">{document.candidate.email}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-gray-900 text-xl font-semibold">{document.documentName}</h3>
            {displayableFieldEntries(document.fields).length > 0 && (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg bg-gray-50 p-4">
                {displayableFieldEntries(document.fields).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs font-medium uppercase text-gray-500">{fieldLabel(key)}</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatFieldValue(key, value)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {document.documentUrl ? (
              <a
                href={document.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border rounded-lg p-4 text-center text-brand-500 underline w-fit"
              >
                Open document in a new tab
              </a>
            ) : (
              <p className="text-sm text-gray-500">No document uploaded</p>
            )}
          </div>
          <div className="flex flex-row gap-2 justify-end">
            <Button
              className="bg-red-600 dark:bg-red-800 hover:bg-red-800"
              disabled={isLoading || !isPendingStatus}
              onClick={() => setShowRejectModal(true)}
            >
              Reject
            </Button>
            <Button disabled={isLoading || !isPendingStatus} onClick={handleApprove}>
              Approve
            </Button>
          </div>
        </div>
      </Modal>
      <RejectionReasonModal
        isOpen={showRejectModal}
        isSaving={isLoading}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
      />
      <ResultModal isStatusUpdated={isStatusUpdated} status={status} />
    </>
  );
};

export default ViewDetailActionReview;
