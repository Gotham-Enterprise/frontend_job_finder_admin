"use client";

import React, { useId, useRef } from "react";
import { Pencil } from "lucide-react";
import Avatar from "@/components/ui/avatar/Avatar";

export interface ProfilePhotoUploadProps {
  displayUrl?: string | null;
  displayName?: string;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  accept?: string;
  /** Highlights the avatar when a new file is staged but not saved. */
  hasPendingUpload?: boolean;
  className?: string;
}

/** Click or hover the avatar to edit; file picker is hidden. */
export function ProfilePhotoUpload({
  displayUrl,
  displayName = "User",
  onFileSelect,
  disabled = false,
  accept = "image/jpeg,image/png,image/jpg",
  hasPendingUpload = false,
  className = "",
}: ProfilePhotoUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = "";
  };

  const hasPhoto = Boolean(displayUrl);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        aria-label={hasPhoto ? "Edit profile photo" : "Upload profile photo"}
        className="group relative block rounded-full focus:outline-hidden focus-visible:ring-3 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div
          className={`relative h-24 w-24 overflow-hidden rounded-full border-2 bg-gray-50 dark:bg-gray-800 ${
            hasPendingUpload
              ? "border-brand-500 ring-2 ring-brand-500/20"
              : "border-gray-200 dark:border-gray-600"
          }`}
        >
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob URLs are not compatible with next/image
            <img src={displayUrl!} alt="Profile photo" className="h-full w-full object-cover" />
          ) : (
            <Avatar
              src={undefined}
              name={displayName}
              size="xxlarge"
              className="!h-full !w-full !max-w-none rounded-full border-0"
            />
          )}

          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/45"
          >
            <Pencil className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </button>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={handleInputChange}
      />
    </div>
  );
}

export default ProfilePhotoUpload;
