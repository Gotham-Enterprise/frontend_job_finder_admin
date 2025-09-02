import Image from "next/image";
import { FC, useEffect, useState } from "react";

import Avatar from "@/components/ui/avatar/Avatar";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { IdApproval, UseIdApprovalDetailLogic } from "@/services/types/idApproval";
import { AccountCheckCircleIcon } from "@/icons";

interface Props {
  isLocked: UseIdApprovalDetailLogic["isLocked"];
  isLoading: UseIdApprovalDetailLogic["isLoading"];
  profile: UseIdApprovalDetailLogic["profile"];
  displayReview: UseIdApprovalDetailLogic["displayReview"];
  isPendingStatus: UseIdApprovalDetailLogic["isPendingStatus"];
  isStatusUpdated: UseIdApprovalDetailLogic["isStatusUpdated"];
  onToggleReview: UseIdApprovalDetailLogic["onToggleReview"];
  onUnlockAccount: UseIdApprovalDetailLogic["onUnlockAccount"];
  onUpdateStatus: UseIdApprovalDetailLogic["onUpdateStatus"];
}

const ResultModal: FC<{
  isStatusUpdated: UseIdApprovalDetailLogic["isStatusUpdated"];
  status: IdApproval["status"];
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
          {status === "approved" ? "Unlock Request Approved" : "Unlock Request Declined"}
        </h1>
        {status === "approved" && (
          <p className="text-center text-md">
            A confirmation email has been sent to the account with further instructions.
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
  profile,
  displayReview,
  isLoading,
  isPendingStatus,
  isStatusUpdated,
  onToggleReview,
  onUpdateStatus,
}) => {
  const { isOpen, openModal, closeModal } = useModal(false);
  const [status, setStatus] = useState<IdApproval["status"]>("pending");

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

  const handleStatusChange = (status: IdApproval["status"]) => {
    setStatus(status);
    onUpdateStatus(status);
  };

  return (
    <>
      <Button onClick={onToggleReview}>Review ID</Button>
      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[720px] p-6 rounded-2xl z-999" isFullscreen={false}>
        <div className="flex flex-col gap-10">
          <h3 className="text-gray-900 text-xl font-semibold">
            Please review the user ID and either approve or decline the account <br /> unlock request.
          </h3>
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-2 items-center">
              <Avatar
                src={profile.picture}
                alt={profile.name}
                name={profile.name}
                size="xlarge"
                className="rounded-full"
              />
              <div className="flex flex-col gap-1">
                <h2 className="text-gray-900 text-xl font-semibold">{profile.name}</h2>
                <p className="text-sm text-gray-900">{profile.email}</p>
              </div>
            </div>
            {/*isLocked && (
              <Button
                variant="outline"
                className="border-1 border-green-800 text-green-800"
                disabled={isLoading}
                onClick={onUnlockAccount}
              >
                Unlock Account
              </Button>
            )*/}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-gray-900 text-xl font-semibold">Identification</h3>
            <div className="flex flex-row gap-4 mb-4">
              <div className="inline-block border rounded-lg w-full">
                <div className="relative w-full h-64">
                  <Image
                    src={profile.front}
                    alt="Front ID"
                    className="object-contain rounded-lg h-auto"
                    fill
                    sizes="(min-width: 640px) 100vw, 100vw"
                  />
                </div>
              </div>
              <div className="relative inline-block border rounded-lg w-full">
                <div className="relative w-full h-64 px-2">
                  <Image
                    src={profile.back}
                    alt="Back ID"
                    className="object-contain rounded-lg h-auto"
                    fill
                    sizes="(min-width: 640px) 100vw, 100vw"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-2 justify-end">
            <Button
              className="bg-red-600 dark:bg-red-800 hover:bg-red-800"
              disabled={isLoading || !isPendingStatus}
              onClick={() => handleStatusChange("declined")}
            >
              Decline
            </Button>
            <Button disabled={isLoading || !isPendingStatus} onClick={() => handleStatusChange("approved")}>
              Approve
            </Button>
          </div>
        </div>
      </Modal>
      <ResultModal isStatusUpdated={isStatusUpdated} status={status} />
    </>
  );
};

export default ViewDetailActionReview;
