import { useState } from 'react';

interface UseConfirmationProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<UseConfirmationProps | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = (props: UseConfirmationProps): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig(props);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    closeDialog();
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    closeDialog();
  };

  const closeDialog = () => {
    setIsOpen(false);
    setConfig(null);
    setResolvePromise(null);
  };

  return {
    isOpen,
    config,
    confirm,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
    onClose: closeDialog
  };
}
