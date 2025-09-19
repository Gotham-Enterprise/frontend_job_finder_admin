import { FC, useEffect } from "react";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { AccountCheckCircleIcon } from "@/icons";
import { UseIdApprovalDetailLogic } from "@/services/types/idApproval";

interface Props {
  isLocked: UseIdApprovalDetailLogic["isLocked"];
  isLoading: UseIdApprovalDetailLogic["isLoading"];
  isUnlocked: UseIdApprovalDetailLogic["isUnlocked"];
  onUnlockAccount: UseIdApprovalDetailLogic["onUnlockAccount"];
}

const ViewDetailActionUnlock: FC<Props> = ({ isUnlocked, isLocked, isLoading, onUnlockAccount }) => {
  const { isOpen, openModal, closeModal } = useModal(false);

  useEffect(() => {
    if (isUnlocked) {
      openModal();
    } else {
      closeModal();
    }
  }, [isUnlocked, openModal, closeModal]);

  const handleClose = () => {
    closeModal();
  };

  return (
    <>
      {isLocked && (
        <Button
          variant="outline"
          className="border-1 border-green-800 text-green-800"
          disabled={isLoading}
          onClick={onUnlockAccount}
        >
          Unlock Account
        </Button>
      )}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        className="max-w-[680px] p-6 lg:p-10 rounded-2xl z-99999"
        isFullscreen={false}
      >
        <div className="flex flex-col items-center gap-6">
          <AccountCheckCircleIcon />
          <h1 className="text-center text-3xl capitalize text-gray-900 font-semibold">Account successfully unlocked</h1>
          <p className="text-center text-md">
            A confirmation email has been sent to the account with further instructions
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={handleClose}>Done</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ViewDetailActionUnlock;
