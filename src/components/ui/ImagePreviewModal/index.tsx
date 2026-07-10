"use client";

import Image from "next/image";
import { Modal } from "../modal";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

export default function ImagePreviewModal({ isOpen, onClose, src, alt }: ImagePreviewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isFullscreen={false} className="max-w-lg rounded-2xl p-6">
      <div className="flex flex-col items-center gap-4">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={800}
          className="w-full h-auto max-h-[70vh] rounded-lg object-contain"
        />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{alt}</p>
      </div>
    </Modal>
  );
}
