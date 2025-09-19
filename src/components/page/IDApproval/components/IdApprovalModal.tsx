import { FC, useEffect } from "react";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { AccountCheckCircleIcon } from "@/icons";
import { UseIdApprovalLogic } from "@/services/types/idApproval";

interface Props {
  showModal: UseIdApprovalLogic["showModal"];
  modalData: UseIdApprovalLogic["modalData"];
  onToggleModal: UseIdApprovalLogic["onToggleModal"];
}

const IdApprovalModal: FC<Props> = ({ showModal, modalData, onToggleModal }) => {
  const { isOpen, openModal, closeModal } = useModal(showModal);

  useEffect(() => {
    if (showModal) {
      openModal();
    } else {
      closeModal();
    }
  }, [showModal, openModal, closeModal]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onToggleModal}
      className="max-w-[680px] p-6 lg:p-10 rounded-2xl"
      isFullscreen={false}
      showCloseButton={false}
    >
      <div className="flex flex-col items-center gap-6">
        <AccountCheckCircleIcon />
        <h1 className="text-center text-3xl capitalize text-gray-900 font-semibold">{modalData?.title}</h1>
        <p className="text-center text-md">
          {modalData?.subtitle}
          <br />
          {modalData?.subtitle2}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={onToggleModal}>Done</Button>
        </div>
      </div>
    </Modal>
  );
};

export default IdApprovalModal;
