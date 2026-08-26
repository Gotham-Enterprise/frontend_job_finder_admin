"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { OfficeSpacePhoto } from "@/services/types/officeSpace";

interface OfficeSpacePhotoGalleryProps {
  photos: OfficeSpacePhoto[] | null;
  className?: string;
}

const OfficeSpacePhotoGallery: React.FC<OfficeSpacePhotoGalleryProps> = ({
  photos,
  className,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const sortedPhotos = [...(photos || [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
  const primaryPhoto = sortedPhotos.find((p) => p.isPrimary) || sortedPhotos[0];

  const getPhotoUrl = (photo: OfficeSpacePhoto) => {
    if (photo.url) return photo.url;
    return "";
  };

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      selectedIndex > 0 ? selectedIndex - 1 : sortedPhotos.length - 1
    );
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      selectedIndex < sortedPhotos.length - 1 ? selectedIndex + 1 : 0
    );
  };

  const handleClose = () => setSelectedIndex(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
  };

  if (sortedPhotos.length === 0) {
    return (
      <div
        className={`bg-gray-100 rounded-lg h-48 flex items-center justify-center ${className || ""}`}
      >
        <span className="text-gray-400 text-sm">No photos available</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div
          className="md:col-span-2 relative h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => {
            const idx = sortedPhotos.findIndex(
              (p) => p.id === primaryPhoto?.id
            );
            setSelectedIndex(idx >= 0 ? idx : 0);
          }}
        >
          {primaryPhoto && (
            <img
              src={getPhotoUrl(primaryPhoto)}
              alt={primaryPhoto.caption || "Office space photo"}
              className="w-full h-full object-cover"
            />
          )}
          {sortedPhotos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              1 / {sortedPhotos.length}
            </div>
          )}
        </div>

        <div className="hidden md:grid grid-rows-2 gap-2">
          {sortedPhotos.slice(1, 3).map((photo, idx) => (
            <div
              key={photo.id}
              className="relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedIndex(idx + 1)}
            >
              <img
                src={getPhotoUrl(photo)}
                alt={photo.caption || `Photo ${idx + 2}`}
                className="w-full h-full object-cover"
              />
              {idx === 1 && sortedPhotos.length > 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    +{sortedPhotos.length - 3} more
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-2 overflow-x-auto pb-2 md:hidden">
        {sortedPhotos.map((photo, idx) => (
          <div
            key={photo.id}
            className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-colors"
            onClick={() => setSelectedIndex(idx)}
          >
            <img
              src={getPhotoUrl(photo)}
              alt={photo.caption || `Photo ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={handleClose}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:text-white/80 z-10"
            onClick={handleClose}
          >
            <X className="w-6 h-6" />
          </Button>

          <button
            className="absolute left-4 text-white hover:text-white/80 z-10 p-2"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div
            className="max-w-4xl max-h-[80vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getPhotoUrl(sortedPhotos[selectedIndex])}
              alt={
                sortedPhotos[selectedIndex].caption ||
                `Photo ${selectedIndex + 1}`
              }
              className="max-w-full max-h-[70vh] object-contain rounded"
            />
            {sortedPhotos[selectedIndex].caption && (
              <p className="text-white text-center mt-2 text-sm">
                {sortedPhotos[selectedIndex].caption}
              </p>
            )}
            <p className="text-white/60 text-center mt-1 text-xs">
              {selectedIndex + 1} / {sortedPhotos.length}
            </p>
          </div>

          <button
            className="absolute right-4 text-white hover:text-white/80 z-10 p-2"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};

export default OfficeSpacePhotoGallery;
