import React, { memo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string) => void;
}

const DEFAULT_IMAGES = [
  'https://images.pexels.com/photos/2383010/pexels-photo-2383010.jpeg?_gl=1*1mrq6t6*_ga*MTM1Mzg3ODAwOS4xNzUyNTU5MTk2*_ga_8JE65Q40S6*czE3NTMwNzI2NTQkbzE4JGcxJHQxNzUzMDcyNjU3JGo1NyRsMCRoMA..',
  'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?_gl=1*17kav5q*_ga*MTM1Mzg3ODAwOS4xNzUyNTU5MTk2*_ga_8JE65Q40S6*czE3NTMwNzI2NTQkbzE4JGcxJHQxNzUzMDcyNjc0JGo0MCRsMCRoMA..',
  'https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg?_gl=1*g6asze*_ga*MTM1Mzg3ODAwOS4xNzUyNTU5MTk2*_ga_8JE65Q40S6*czE3NTMwNzI2NTQkbzE4JGcxJHQxNzUzMDcyNjg5JGoyNSRsMCRoMA..',
  'https://images.pexels.com/photos/1350560/pexels-photo-1350560.jpeg?_gl=1*1wrk7so*_ga*MTM1Mzg3ODAwOS4xNzUyNTU5MTk2*_ga_8JE65Q40S6*czE3NTMwNzI2NTQkbzE4JGcxJHQxNzUzMDcyNzA1JGo5JGwwJGgw',
  'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?_gl=1*13j6icw*_ga*MTM1Mzg3ODAwOS4xNzUyNTU5MTk2*_ga_8JE65Q40S6*czE3NTMwNzI2NTQkbzE4JGcxJHQxNzUzMDcyNzI1JGo1MSRsMCRoMA..',
  'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?_gl=1*qrgp8y*_ga*MTM1Mzg3ODAwOS4xNzUyNTU5MTk2*_ga_8JE65Q40S6*czE3NTMwNzI2NTQkbzE4JGcxJHQxNzUzMDcyNzUxJGoyNSRsMCRoMA..',
  'https://images.pexels.com/photos/5206923/pexels-photo-5206923.jpeg?_gl=1*wc3m04*_ga*MTM1Mzg3ODAwOS4xNzUyNTU5MTk2*_ga_8JE65Q40S6*czE3NTMwNzI2NTQkbzE4JGcxJHQxNzUzMDcyNzY3JGo5JGwwJGgw'
];

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = memo(({ 
  isOpen, 
  onClose, 
  onImageSelect 
}) => {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const escapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', escapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', escapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageUrl)) {
        newSet.delete(imageUrl);
      } else {
        newSet.add(imageUrl);
      }
      return newSet;
    });
  };

  const confirmSelection = () => {
    if (selectedImages.size > 0) {
      const firstSelected = Array.from(selectedImages)[0];
      onImageSelect(firstSelected);
      onClose();
      setSelectedImages(new Set());
    }
  };

  const closeModal = () => {
    onClose();
    setSelectedImages(new Set());
  };

  const imageLoad = (imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
  };

  const imageError = (imageUrl: string) => {
    console.warn(`Failed to load image: ${imageUrl}`);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      <div 
        className="fixed inset-0"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
        onClick={closeModal}
      />
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Images
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Click checkboxes to select images
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {DEFAULT_IMAGES.map((imageUrl, index) => {
                const isSelected = selectedImages.has(imageUrl);
                return (
                  <div
                    key={index}
                    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                      onLoad={() => imageLoad(imageUrl)}
                      onError={() => imageError(imageUrl)}
                      loading="lazy"
                    />
                    
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleImageSelection(imageUrl)}
                        className="w-5 h-5 text-purple-600 bg-white border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                    </div>

                    {isSelected && (
                      <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-purple-500 text-white rounded-full p-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path 
                              fillRule="evenodd" 
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        </div>
                      </div>
                    )}

                    {!loadedImages.has(imageUrl) && (
                      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                        <div className="text-gray-400 dark:text-gray-500">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path 
                              fillRule="evenodd" 
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedImages.size > 0 && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Images ({selectedImages.size}):
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedImages).map((imageUrl, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded border">
                      <img
                        src={imageUrl}
                        alt={`Selected ${index + 1}`}
                        className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-500"
                      />
                      <button
                        onClick={() => toggleImageSelection(imageUrl)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove selection"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSelection}
                disabled={selectedImages.size === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-500 border border-purple-500 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Use Selected Image{selectedImages.size > 1 ? 's' : ''} ({selectedImages.size})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
});

ImageGalleryModal.displayName = 'ImageGalleryModal';

export default ImageGalleryModal;
