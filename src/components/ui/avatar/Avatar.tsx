"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import ImagePreviewModal from "../ImagePreviewModal";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge";
  status?: "online" | "offline" | "busy" | "none";
  className?: string;
  /** When true and an image is shown, clicking the avatar opens a zoomed preview modal */
  enablePreview?: boolean;
}

const sizeClasses = {
  xsmall: "h-6 w-6 max-w-6",
  small: "h-8 w-8 max-w-8",
  medium: "h-10 w-10 max-w-10",
  large: "h-12 w-12 max-w-12",
  xlarge: "h-14 w-14 max-w-14",
  xxlarge: "h-16 w-16 max-w-16",
};

const statusSizeClasses = {
  xsmall: "h-1.5 w-1.5 max-w-1.5",
  small: "h-2 w-2 max-w-2",
  medium: "h-2.5 w-2.5 max-w-2.5",
  large: "h-3 w-3 max-w-3",
  xlarge: "h-3.5 w-3.5 max-w-3.5",
  xxlarge: "h-4 w-4 max-w-4",
};

const statusColorClasses = {
  online: "bg-success-500",
  offline: "bg-error-400",
  busy: "bg-warning-500",
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User Avatar",
  name = "Unknown User",
  size = "medium",
  status = "none",
  className = "",
  enablePreview = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const getInitials = (displayName: string): string => {
    const parts = displayName
      .trim()
      .split(/\s+/)
      .filter((part) => part.length > 0)
      .map((part) => part.charAt(0));
    if (parts.length === 0) return "?";
    return parts.join("").substring(0, 2).toUpperCase();
  };

  const showImage = Boolean(src) && !imageFailed;
  const clickable = enablePreview && showImage;

  const avatar = (
    <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      {showImage ? (
        <Image
          width={48}
          height={48}
          src={src!}
          alt={alt}
          className="object-cover w-full h-full rounded-full"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium text-sm">
          {getInitials(name)}
        </div>
      )}

      {status !== "none" && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-[1.5px] border-white dark:border-gray-900 ${
            statusSizeClasses[size]
          } ${statusColorClasses[status] || ""}`}
        ></span>
      )}
    </div>
  );

  if (!clickable) return avatar;

  return (
    <>
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="block cursor-pointer rounded-full transition-opacity hover:opacity-90"
        aria-label={`View ${name}'s photo`}
        title="Click to view photo"
      >
        {avatar}
      </button>
      <ImagePreviewModal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} src={src!} alt={name} />
    </>
  );
};

export default Avatar;
