import React, { memo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string, file?: File) => void;
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
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<{ file: File; url: string; selected: boolean }[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedUploadedFiles, setSelectedUploadedFiles] = useState<Set<File>>(new Set());

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

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      uploadPreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [uploadPreviews]);

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedGalleryImage(prev => prev === imageUrl ? null : imageUrl);
  };

  const confirmSelection = () => {
    if (activeTab === 'gallery' && selectedGalleryImage) {
      onImageSelect(selectedGalleryImage);
      onClose();
      setSelectedGalleryImage(null);
    } else if (activeTab === 'upload' && selectedUploadedFiles.size > 0) {
      // For multiple uploaded files, we'll select the first one for now
      // You could modify this to handle multiple files differently
      const firstFile = Array.from(selectedUploadedFiles)[0];
      const objectUrl = URL.createObjectURL(firstFile);
      onImageSelect(objectUrl, firstFile);
      onClose();
      resetUploadState();
    }
  };

  const closeModal = () => {
    onClose();
    setSelectedGalleryImage(null);
    resetUploadState();
  };

  const resetUploadState = () => {
    setUploadedFiles([]);
    setUploadPreviews([]);
    setSelectedUploadedFiles(new Set());
    setIsDragOver(false);
  };

  const handleFileUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please select valid image files (PNG, JPG, JPEG, GIF, WebP)');
      return;
    }

    imageFiles.forEach(file => {
      const objectUrl = URL.createObjectURL(file);
      setUploadPreviews(prev => [...prev, { file, url: objectUrl, selected: false }]);
    });
    
    setUploadedFiles(prev => [...prev, ...imageFiles]);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileUpload(event.target.files);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files) {
      handleFileUpload(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const toggleUploadedImageSelection = (file: File) => {
    setSelectedUploadedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(file)) {
        newSet.delete(file);
      } else {
        newSet.add(file);
      }
      return newSet;
    });
    
    setUploadPreviews(prev => prev.map(preview => ({
      ...preview,
      selected: preview.file === file ? !preview.selected : preview.selected
    })));
  };

  const removeUploadedImage = (file: File) => {
    setUploadPreviews(prev => prev.filter(preview => preview.file !== file));
    setUploadedFiles(prev => prev.filter(f => f !== file));
    setSelectedUploadedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(file);
      return newSet;
    });
    
    // Clean up object URL
    const preview = uploadPreviews.find(p => p.file === file);
    if (preview) {
      URL.revokeObjectURL(preview.url);
    }
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
                  {activeTab === 'gallery' ? 'Click checkboxes to select images' : 'Upload and select your images'}
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

            {/* Tab Navigation */}
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

            {/* Tab Content */}
            {activeTab === 'gallery' ? (
              /* Gallery Tab Content */
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {DEFAULT_IMAGES.map((imageUrl, index) => {
                    const isSelected = selectedGalleryImage === imageUrl;
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
                            type="radio"
                            name="gallery-selection"
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

                {selectedGalleryImage && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected Image:
                    </h4>
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded border w-fit">
                      <img
                        src={selectedGalleryImage}
                        alt="Selected image"
                        className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-500"
                      />
                      <button
                        onClick={() => toggleImageSelection(selectedGalleryImage)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove selection"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Upload Tab Content */
              <>
                {/* Upload Area */}
                <div className="mb-6">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver
                        ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            Drop your images here
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            or <span className="text-purple-600 dark:text-purple-400 underline">browse to upload</span>
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Supports: PNG, JPG, JPEG, GIF, WebP (Max 10MB each)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Uploaded Images Grid */}
                {uploadPreviews.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Uploaded Images ({uploadPreviews.length}):
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadPreviews.map((preview, index) => (
                        <div
                          key={index}
                          className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            preview.selected
                              ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <img
                            src={preview.url}
                            alt={`Uploaded ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                          />
                          
                          <div className="absolute top-2 left-2 z-10">
                            <input
                              type="checkbox"
                              checked={preview.selected}
                              onChange={() => toggleUploadedImageSelection(preview.file)}
                              className="w-5 h-5 text-purple-600 bg-white border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                          </div>

                          <button
                            onClick={() => removeUploadedImage(preview.file)}
                            className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>

                          {preview.selected && (
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

                          {/* File Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                            <p className="text-xs truncate">{preview.file.name}</p>
                            <p className="text-xs text-gray-300">
                              {(preview.file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Files Preview */}
                {selectedUploadedFiles.size > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected Files ({selectedUploadedFiles.size}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedUploadedFiles).map((file, index) => {
                        const preview = uploadPreviews.find(p => p.file === file);
                        return (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded border">
                            {preview && (
                              <img
                                src={preview.url}
                                alt={`Selected ${index + 1}`}
                                className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-500"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                            </div>
                            <button
                              onClick={() => toggleUploadedImageSelection(file)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Remove selection"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
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
                disabled={
                  (activeTab === 'gallery' && !selectedGalleryImage) ||
                  (activeTab === 'upload' && selectedUploadedFiles.size === 0)
                }
                className="px-4 py-2 text-sm font-medium text-white bg-purple-500 border border-purple-500 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {activeTab === 'gallery' 
                  ? selectedGalleryImage ? 'Use Selected Image' : 'Select an Image'
                  : selectedUploadedFiles.size > 0
                    ? `Use Selected Image${selectedUploadedFiles.size > 1 ? 's' : ''} (${selectedUploadedFiles.size})`
                    : 'Select an Image'
                }
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
