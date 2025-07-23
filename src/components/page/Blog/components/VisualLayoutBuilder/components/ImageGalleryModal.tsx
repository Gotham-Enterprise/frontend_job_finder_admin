import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useMedia } from '@/hooks/useMedia';
import { MediaItem } from '@/services/types/mediaTypes';
import { validateMediaType, createObjectUrl, revokeObjectUrl, formatFileSize, isValidImageType } from '@/utils/mediaUtils';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string, file?: File) => void;
}

interface UploadPreview {
  file: File;
  url: string;
  selected: boolean;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = memo(({ 
  isOpen, 
  onClose, 
  onImageSelect 
}) => {
  const { images, loading, error, uploadMedia, deleteMediaItem, refreshMedia } = useMedia({
    initialFilters: { type: 'IMAGE', limit: 50 },
    autoFetch: false,
  });

  const [selectedGalleryImage, setSelectedGalleryImage] = useState<MediaItem | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
  const [uploadPreviews, setUploadPreviews] = useState<UploadPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedUploadedFiles, setSelectedUploadedFiles] = useState<Set<File>>(new Set());
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      refreshMedia();
    }
  }, [isOpen, refreshMedia]);

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

  useEffect(() => {
    return () => {
      uploadPreviews.forEach(preview => {
        revokeObjectUrl(preview.url);
      });
    };
  }, [uploadPreviews]);

  const toggleImageSelection = useCallback((image: MediaItem) => {
    setSelectedGalleryImage(prev => 
      prev?.id === image.id ? null : image
    );
  }, []);

  const confirmSelection = useCallback(async () => {
    if (activeTab === 'gallery' && selectedGalleryImage) {
      onImageSelect(selectedGalleryImage.url);
      closeModal();
    } else if (activeTab === 'upload' && selectedUploadedFiles.size > 0) {
      const firstFile = Array.from(selectedUploadedFiles)[0];
      const fileName = `upload-${Date.now()}`;
      setUploadingFiles(prev => new Set(prev).add(fileName));
      
      try {
        const uploadedMedia = await uploadMedia(firstFile, 'IMAGE');
        if (uploadedMedia) {
          onImageSelect(uploadedMedia.url, firstFile);
          closeModal();
        }
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileName);
          return newSet;
        });
      }
    }
  }, [activeTab, selectedGalleryImage, selectedUploadedFiles, uploadMedia, onImageSelect]);

  const closeModal = useCallback(() => {
    onClose();
    setSelectedGalleryImage(null);
    resetUploadState();
  }, [onClose]);

  const resetUploadState = useCallback(() => {
    uploadPreviews.forEach(preview => revokeObjectUrl(preview.url));
    setUploadPreviews([]);
    setSelectedUploadedFiles(new Set());
    setIsDragOver(false);
  }, [uploadPreviews]);

  const processFileUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => isValidImageType(file));
    
    if (imageFiles.length === 0) {
      alert('Please select valid image files (PNG, JPG, JPEG, GIF, WebP)');
      return;
    }

    const newPreviews = imageFiles.map(file => ({
      file,
      url: createObjectUrl(file),
      selected: false,
    }));

    setUploadPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  const fileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFileUpload(event.target.files);
    }
    event.target.value = '';
  }, [processFileUpload]);

  const dropFile = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files) {
      processFileUpload(event.dataTransfer.files);
    }
  }, [processFileUpload]);

  const dragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const dragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const toggleUploadedImageSelection = useCallback((file: File) => {
    setSelectedUploadedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(file)) {
        newSet.delete(file);
      } else {
        newSet.clear();
        newSet.add(file);
      }
      return newSet;
    });
    
    setUploadPreviews(prev => prev.map(preview => ({
      ...preview,
      selected: preview.file === file,
    })));
  }, []);

  const removeUploadedImage = useCallback((file: File) => {
    const preview = uploadPreviews.find(p => p.file === file);
    if (preview) {
      revokeObjectUrl(preview.url);
    }
    
    setUploadPreviews(prev => prev.filter(preview => preview.file !== file));
    setSelectedUploadedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(file);
      return newSet;
    });
  }, [uploadPreviews]);

  const deleteImage = useCallback(async (image: MediaItem) => {
    setDeletingItems(prev => new Set(prev).add(image.id));
    
    try {
      const success = await deleteMediaItem(image.id);
      if (success && selectedGalleryImage?.id === image.id) {
        setSelectedGalleryImage(null);
      }
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(image.id);
        return newSet;
      });
    }
  }, [deleteMediaItem, selectedGalleryImage]);

  const imageLoad = useCallback((imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
  }, []);

  const imageError = useCallback((imageUrl: string) => {
    console.warn(`Failed to load image: ${imageUrl}`);
  }, []);

  const hasSelectionToConfirm = useMemo(() => {
    return (activeTab === 'gallery' && selectedGalleryImage) || 
           (activeTab === 'upload' && selectedUploadedFiles.size > 0);
  }, [activeTab, selectedGalleryImage, selectedUploadedFiles]);

  const isUploading = useMemo(() => uploadingFiles.size > 0, [uploadingFiles]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      <div 
        className="fixed inset-0"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
        onClick={closeModal}
      />
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Images
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {activeTab === 'gallery' ? 'Click on images to select them' : 'Upload and select your images'}
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

            <div className="flex border-b border-gray-200 dark:border-gray-600 mb-6">
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'gallery'
                    ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Upload
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            {activeTab === 'gallery' ? (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading images...</span>
                  </div>
                ) : images.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400 mb-4">No images found</div>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      Upload your first image
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                    {images.map((image) => {
                      const isSelected = selectedGalleryImage?.id === image.id;
                      const isDeleting = deletingItems.has(image.id);
                      return (
                        <div
                          key={image.id}
                          onClick={() => !isDeleting && toggleImageSelection(image)}
                          className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <img
                            src={image.url}
                            alt={image.fileName}
                            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                            onLoad={() => imageLoad(image.url)}
                            onError={() => imageError(image.url)}
                            loading="lazy"
                          />
                          
                          <div className="absolute top-2 left-2 z-10">
                            <input
                              type="radio"
                              name="gallery-selection"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleImageSelection(image);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              disabled={isDeleting}
                              className="w-5 h-5 text-purple-600 bg-white border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                          </div>

                          <div className="absolute top-2 right-2 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteImage(image);
                              }}
                              disabled={isDeleting}
                              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                              title="Delete image"
                            >
                              {isDeleting ? (
                                <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                              ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </button>
                          </div>

                          {isSelected && (
                            <div className="absolute inset-0 bg-black opacity-[0.4] flex items-center justify-center">
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}

                          {!loadedImages.has(image.url) && (
                            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                              <div className="w-8 h-8 text-gray-400">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedGalleryImage && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected Image:
                    </h4>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-600 rounded border">
                      <img
                        src={selectedGalleryImage.url}
                        alt={selectedGalleryImage.fileName}
                        className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {selectedGalleryImage.fileName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(selectedGalleryImage.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-6">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver
                        ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onDrop={dropFile}
                    onDragOver={dragOver}
                    onDragLeave={dragLeave}
                  >
                    <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      Drop your images here
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      or{' '}
                      <label className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 cursor-pointer">
                        browse to upload
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={fileInputChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Supports: JPEG, PNG, GIF, WebP (Max 100MB each)
                    </div>
                  </div>
                </div>

                {uploadPreviews.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Uploaded Images ({uploadPreviews.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {uploadPreviews.map((preview, index) => {
                        const isSelected = selectedUploadedFiles.has(preview.file);
                        return (
                          <div
                            key={index}
                            onClick={() => toggleUploadedImageSelection(preview.file)}
                            className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              isSelected
                                ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <img
                              src={preview.url}
                              alt={preview.file.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            
                            <div className="absolute top-2 left-2 z-10">
                              <input
                                type="radio"
                                name="upload-selection"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleUploadedImageSelection(preview.file);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-5 h-5 text-purple-600 bg-white border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              />
                            </div>

                            <div className="absolute top-2 right-2 z-10">
                              <button
                                onClick={() => removeUploadedImage(preview.file)}
                                className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                                title="Remove image"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {isSelected && (
                              <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                              <div className="truncate" title={preview.file.name}>
                                {preview.file.name}
                              </div>
                              <div className="text-gray-300">
                                {formatFileSize(preview.file.size)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedUploadedFiles.size > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected for Upload:
                    </h4>
                    {Array.from(selectedUploadedFiles).map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded border mb-2 last:mb-0">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={confirmSelection}
                disabled={!hasSelectionToConfirm || isUploading}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  hasSelectionToConfirm && !isUploading
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Uploading...
                  </div>
                ) : activeTab === 'gallery' ? (
                  'Select an Image'
                ) : (
                  'Select & Upload'
                )}
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
