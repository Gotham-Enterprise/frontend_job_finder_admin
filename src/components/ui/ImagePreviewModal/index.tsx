"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "../modal";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

type DownloadFormat = "jpg" | "png";

export default function ImagePreviewModal({ isOpen, onClose, src, alt }: ImagePreviewModalProps) {
  const [downloading, setDownloading] = useState<DownloadFormat | null>(null);

  const triggerDownload = (blob: Blob, format: DownloadFormat) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${alt.trim().toLowerCase().replace(/\s+/g, "-") || "profile-photo"}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (format: DownloadFormat) => {
    if (downloading) return;
    setDownloading(format);
    try {
      // Cross-origin images (e.g. S3) don't send CORS headers, so route
      // them through our same-origin proxy
      const isCrossOrigin = /^https?:\/\//.test(src) && !src.startsWith(window.location.origin);
      const fetchUrl = isCrossOrigin ? `/api/image-proxy?url=${encodeURIComponent(src)}` : src;
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`Image fetch failed (${response.status})`);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      if (format === "jpg") {
        // JPEG has no transparency, so flatten onto white
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bitmap, 0, 0);

      canvas.toBlob(
        (converted) => {
          if (converted) triggerDownload(converted, format);
          setDownloading(null);
        },
        format === "jpg" ? "image/jpeg" : "image/png",
        0.92,
      );
    } catch (error) {
      console.error("Failed to download image:", error);
      setDownloading(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isFullscreen={false} className="max-w-lg rounded-2xl p-6">
      <div className="flex flex-col items-center gap-4">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={800}
          className="w-full h-auto max-h-[70vh] rounded-lg object-contain"
          unoptimized={src.startsWith("data:") || src.startsWith("blob:")}
        />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{alt}</p>
        <div className="flex items-center gap-3">
          {(["jpg", "png"] as DownloadFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => handleDownload(format)}
              disabled={downloading !== null}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                />
              </svg>
              {downloading === format ? "Downloading..." : `Download ${format.toUpperCase()}`}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
