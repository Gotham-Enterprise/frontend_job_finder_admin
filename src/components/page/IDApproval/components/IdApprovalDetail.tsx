import Image from "next/image";
import { FC, useEffect } from "react";

import Avatar from "@/components/ui/avatar/Avatar";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { IdApprovalStatusUpdate, UseIdApprovalLogic } from "@/services/types/idApproval";

interface Props {
  selected: UseIdApprovalLogic['selected'];
  isUpdating: UseIdApprovalLogic['isUpdating'];
  setSelected: UseIdApprovalLogic['setSelected'];
  onUpdateStatus: UseIdApprovalLogic['onUpdateStatus'];
}

const IdApprovalDetail: FC<Props> = ({ selected, isUpdating, setSelected, onUpdateStatus }) => {
  const { isOpen, openModal, closeModal } = useModal(false);

  useEffect(() => {
    if (selected) {
      openModal();
    } else {
      closeModal();
    }
  }, [selected, openModal, closeModal])

  const handleClose = () => {
    setSelected(null);
  }

  const handleUpdateStatus = (status: IdApprovalStatusUpdate['status']) => {
    if (selected) {
      onUpdateStatus(selected.id, status);
    }
  }

  if (!selected) {
    return null;
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
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-2 items-center">
            <Avatar
              src={selected.profilePicture || undefined}
              alt={selected.fullName}
              name={selected.fullName}
              size="xlarge"
              className="rounded-full"
            />
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl">{selected?.fullName}</h2>
              <p className="text-sm">{selected?.email}</p>
            </div>
          </div>
          {
            (selected.status === 'approved' || selected.status === 'declined') && (
              <div className="border rounded-xl px-4 py-2 bg-white min-md:w-1/4 flex items-center justify-center border-green-800">
                <p className="text-md text-green-900 capitalize">
                  {selected.status}
                </p>
              </div>
            )
          }
        </div>
        <h3 className="text-l font-semibold">Identification</h3>
        <div className="flex flex-row gap-4 mb-4">
          <div className="inline-block border rounded-lg w-full">
            <div className="relative w-full h-64">
              <Image
                src={selected.front}
                alt="Front ID"
                className="object-contain rounded-lg px-4 h-auto"
                fill
                sizes="(min-width: 640px) 100vw, 100vw"
              />
            </div>
          </div>
          <div className="relative inline-block border rounded-lg w-full">
            <div className="relative w-full h-64 px-2">
              <Image
                src={selected.back}
                alt="Back ID"
                className="object-contain rounded-lg px-4 h-auto"
                fill
                sizes="(min-width: 640px) 100vw, 100vw"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-end gap-3">
          <Button variant="ghost" className="font-normal text-green-900" onClick={handleClose}>Cancel</Button>
          { 
            selected.status === 'pending' && (
              <>
                <Button
                  className="font-normal bg-red-700 hover:bg-red-600 text-white"
                  onClick={() => handleUpdateStatus('declined')}
                  disabled={isUpdating}
                >
                  Decline
                </Button>
                <Button
                  className="font-normal bg-green-700 hover:bg-green-600 text-white"
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={isUpdating}
                >
                  Approve
                </Button>
              </>
            )
          }
        </div>
      </div>
    </Modal>
  )
}

export default IdApprovalDetail