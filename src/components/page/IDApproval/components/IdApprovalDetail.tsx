import Image from "next/image";
import { FC, useEffect } from "react";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { UseIdApprovalLogic } from "@/services/types/idApproval";

interface Props {
  selected: UseIdApprovalLogic['selected'];
  setSelected: UseIdApprovalLogic['setSelected'];
}

const IdApprovalDetail: FC<Props> = ({ selected, setSelected }) => {
  const { isOpen, openModal, closeModal } = useModal(false);

  useEffect(() => {
    if (selected) {
      openModal();
    }
  }, [selected, openModal])

  const handleClose = () => {
    closeModal();
    setSelected(null);
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[700px] p-6 lg:p-10 rounded-2xl"
      isFullscreen={false}
      showCloseButton={false}
    >
      <div className="flex flex-col gap-6 text-gray-900">
        <h3 className="text-l font-semibold">Manage User</h3>
        <div className="">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl">{selected?.fullName}</h2>
            <p className="text-sm">{selected?.email}</p>
          </div>
        </div>
        <h3 className="text-l font-semibold">Identification</h3>
        <div className="flex flex-row gap-4 mb-4">
          <div className="relative inline-block border rounded-lg w-full">
            <div className="w-full h-64">
              <Image src={selected?.front || ''} alt="Front ID" className="object-contain rounded-lg px-4" fill />
            </div>
          </div>
          <div className="relative inline-block border rounded-lg w-full">
            <div className="w-full h-64 px-2">
              <Image src={selected?.back || ''} alt="Back ID" className="object-contain rounded-lg px-4" fill />
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-end gap-3">
          <Button variant="ghost" className="font-normal text-green-900" onClick={handleClose}>Cancel</Button>
          <Button className="font-normal bg-red-700 hover:bg-red-600 text-white">Decline</Button>
          <Button className="font-norma text-white">Approve</Button>
        </div>
      </div>
    </Modal>
  )
}

export default IdApprovalDetail