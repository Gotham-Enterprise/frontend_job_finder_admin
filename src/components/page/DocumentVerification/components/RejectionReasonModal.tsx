import { FC, useState } from "react";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import TextArea from "@/components/form/input/TextArea";

interface Props {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectionReasonModal: FC<Props> = ({ isOpen, isSaving, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[520px] p-6 rounded-2xl" isFullscreen={false}>
      <div className="flex flex-col gap-4">
        <h3 className="text-gray-900 text-xl font-semibold">Reject document(s)</h3>
        <p className="text-sm text-gray-500">
          Let the candidate know what needs to be fixed — this is shown to them and sent by email.
        </p>
        <TextArea
          placeholder="e.g. The scan is blurry, please re-upload a clearer copy."
          rows={4}
          value={reason}
          onChange={setReason}
        />
        <div className="flex flex-row gap-2 justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 dark:bg-red-800 hover:bg-red-800"
            disabled={isSaving || !reason.trim()}
            onClick={handleConfirm}
          >
            Reject
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RejectionReasonModal;
