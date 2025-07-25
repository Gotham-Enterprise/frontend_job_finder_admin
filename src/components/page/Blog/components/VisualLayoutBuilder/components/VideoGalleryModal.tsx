import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useMedia } from '@/hooks/useMedia';
import { useConfirmation } from '@/hooks/useConfirmation';
import { MediaItem } from '@/services/types/mediaTypes';
import { isValidVideoType, createObjectUrl, revokeObjectUrl } from '@/services/utils/mediaUtils';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

interface VideoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoSelect: (videoUrl: string, file?: File) => void;
}

interface UploadPreview {
  file: File;
  url: string;
  selected: boolean;
}

const DEFAULT_VIDEOS = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=M7lc1UVf-VE',
  'https://www.youtube.com/watch?v=K4DyBUG242c',
  'https://vimeo.com/720626866',
  'https://www.youtube.com/watch?v=2vjPBrBU-TM',
  'https://www.youtube.com/watch?v=ScMzIvxBSi4',
  'https://vimeo.com/278430980',
  'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'
];

const VideoGalleryModal: React.FC<VideoGalleryModalProps> = memo(({ 
  isOpen, 
  onClose, 
  onVideoSelect 
}) => {
  const { videos, loading, error, uploadMedia, deleteMediaItem, deleteMultipleMedia, refreshMedia } = useMedia({
    initialFilters: { type: 'VIDEO', limit: 50 },
    autoFetch: false,
  });

  const confirmation = useConfirmation();

  const [selectedGalleryVideo, setSelectedGalleryVideo] = useState<MediaItem | null>(null);
  const [selectedGalleryVideos, setSelectedGalleryVideos] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
  const [uploadPreviews, setUploadPreviews] = useState<UploadPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedUploadedFiles, setSelectedUploadedFiles] = useState<Set<File>>(new Set());
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadError, setUploadError] = useState<string | null>(null);
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

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      uploadPreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [uploadPreviews]);

  const toggleVideoSelection = useCallback((video: MediaItem) => {
    if (isMultiSelectMode) {
      setSelectedGalleryVideos(prev => {
        const newSet = new Set(prev);
        if (newSet.has(video.id)) {
          newSet.delete(video.id);
        } else {
          newSet.add(video.id);
        }
        return newSet;
      });
    } else {
      setSelectedGalleryVideo(prev => prev?.id === video.id ? null : video);
    }
  }, [isMultiSelectMode]);

  const toggleMultiSelectMode = useCallback(() => {
    setIsMultiSelectMode(prev => !prev);
    setSelectedGalleryVideo(null);
    setSelectedGalleryVideos(new Set());
  }, []);

  const selectAllVideos = useCallback(() => {
    setSelectedGalleryVideos(new Set(videos.map(video => video.id)));
  }, [videos]);

  const deselectAllVideos = useCallback(() => {
    setSelectedGalleryVideos(new Set());
  }, []);

  const bulkDeleteVideos = useCallback(async () => {
    if (selectedGalleryVideos.size === 0) return;
    
    const videoIds = Array.from(selectedGalleryVideos);
    const count = videoIds.length;
    
    const confirmed = await confirmation.confirm({
      title: 'Delete Videos',
      message: `Are you sure you want to delete ${count} video${count > 1 ? 's' : ''}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
    
    if (!confirmed) return;
    
    setDeletingItems(prev => new Set([...prev, ...videoIds]));
    
    try {
      await deleteMultipleMedia(videoIds);
      setSelectedGalleryVideos(new Set());
      setIsMultiSelectMode(false);
    } catch (error) {
      console.error('Failed to delete videos:', error);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        videoIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  }, [selectedGalleryVideos, deleteMultipleMedia, confirmation]);

  const confirmSelection = useCallback(async () => {
    if (activeTab === 'gallery' && selectedGalleryVideo) {
      onVideoSelect(selectedGalleryVideo.url);
      closeModal();
    } else if (activeTab === 'upload' && uploadPreviews.length > 0) {
      const selectedPreview = uploadPreviews.find(p => p.selected);
      if (selectedPreview) {
        setUploadingFiles(prev => new Set(prev).add(selectedPreview.file.name));
        
        try {
          const uploadedVideo = await uploadMedia(selectedPreview.file, 'VIDEO');
          if (uploadedVideo) {
            onVideoSelect(uploadedVideo.url, selectedPreview.file);
            await refreshMedia();
          }
        } catch (error) {
          console.error('Upload failed:', error);
          setUploadError('Failed to upload video. Please try again.');
        } finally {
          setUploadingFiles(prev => {
            const newSet = new Set(prev);
            newSet.delete(selectedPreview.file.name);
            return newSet;
          });
        }
        
        resetUploadState();
        closeModal();
      }
    }
  }, [activeTab, selectedGalleryVideo, uploadPreviews, uploadMedia, onVideoSelect, refreshMedia]);

  const closeModal = useCallback(() => {
    onClose();
    setSelectedGalleryVideo(null);
    setSelectedGalleryVideos(new Set());
    setIsMultiSelectMode(false);
    resetUploadState();
  }, [onClose]);

  const resetUploadState = useCallback(() => {
    uploadPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    setUploadPreviews([]);
    setSelectedUploadedFiles(new Set());
    setIsDragOver(false);
    setUploadError(null);
  }, [uploadPreviews]);

  const processFileUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const videoFiles = fileArray.filter(file => isValidVideoType(file));
    
    if (videoFiles.length === 0) {
      alert('Please select valid video files (MP4, WebM, MOV, AVI)');
      return;
    }

    setUploadError(null);

    const newPreviews = videoFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      selected: false,
    }));

    setUploadPreviews(prev => [...prev, ...newPreviews]);
    setActiveTab('upload');
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

  const toggleUploadedVideoSelection = useCallback((file: File) => {
    setSelectedUploadedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(file)) {
        newSet.delete(file);
      } else {
        newSet.clear(); // Only allow single selection
        newSet.add(file);
      }
      return newSet;
    });
    
    setUploadPreviews(prev => prev.map(preview => ({
      ...preview,
      selected: preview.file === file,
    })));
  }, []);

  const removeUploadedVideo = useCallback((file: File) => {
    setUploadPreviews(prev => {
      const preview = prev.find(p => p.file === file);
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
      return prev.filter(preview => preview.file !== file);
    });
    
    setSelectedUploadedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(file);
      return newSet;
    });
    
    setUploadError(null);
  }, []);

  const deleteVideo = useCallback(async (video: MediaItem) => {
    const confirmed = await confirmation.confirm({
      title: 'Delete Video',
      message: `Are you sure you want to delete "${video.fileName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
    
    if (!confirmed) return;
    
    setDeletingItems(prev => new Set(prev).add(video.id));
    
    try {
      const success = await deleteMediaItem(video.id);
      if (success && selectedGalleryVideo?.id === video.id) {
        setSelectedGalleryVideo(null);
      }
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(video.id);
        return newSet;
      });
    }
  }, [deleteMediaItem, selectedGalleryVideo, confirmation]);

  const videoLoad = (videoUrl: string) => {
    setLoadedVideos(prev => new Set(prev).add(videoUrl));
  };

  const videoError = (videoUrl: string) => {
    console.warn(`Failed to load video: ${videoUrl}`);
  };

  const getVideoThumbnail = (videoUrl: string) => {
    // Generate YouTube thumbnail
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = extractYouTubeVideoId(videoUrl);
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    }
    
    // Generate Vimeo thumbnail (would need API call in real implementation)
    if (videoUrl.includes('vimeo.com')) {
      return 'https://i.vimeocdn.com/video/placeholder.jpg'; // Placeholder
    }
    
    return null;
  };

  const extractYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getVideoPlatform = (videoUrl: string) => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      return 'YouTube';
    }
    if (videoUrl.includes('vimeo.com')) {
      return 'Vimeo';
    }
    return 'Video';
  };

  const hasSelectionToConfirm = useMemo(() => {
    if (isMultiSelectMode) {
      return false; // No confirm button in multi-select mode
    }

    if (activeTab === 'gallery') {
      return !!selectedGalleryVideo;
    }
    
    if (activeTab === 'upload') {
      return uploadPreviews.some(preview => preview.selected);
    }
   
    return false;
  }, [activeTab, selectedGalleryVideo, uploadPreviews, isMultiSelectMode]);

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
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Videos
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {activeTab === 'gallery' ? 'Click to select videos' : 'Upload and select your videos'}
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
                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                )}

                {error && (
                  <div className="text-red-500 text-center py-4 mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    {error}
                  </div>
                )}

                {!loading && !error && (
                  <>
                    {/* Multi-select controls */}
                    {videos.length > 0 && (
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={toggleMultiSelectMode}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              isMultiSelectMode
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            {isMultiSelectMode ? 'Exit Multi-Select' : 'Multi-Select'}
                          </button>
                          
                          {isMultiSelectMode && (
                            <>
                              <button
                                onClick={selectAllVideos}
                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Select All
                              </button>
                              <button
                                onClick={deselectAllVideos}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                              >
                                Deselect All
                              </button>
                              {selectedGalleryVideos.size > 0 && (
                                <button
                                  onClick={bulkDeleteVideos}
                                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Delete Selected ({selectedGalleryVideos.size})
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      {videos.map((video) => {
                        const isSelected = selectedGalleryVideo?.id === video.id || selectedGalleryVideos.has(video.id);
                        const isDeleting = deletingItems.has(video.id);
                        
                        return (
                          <div
                            key={video.id}
                            className={`relative aspect-video cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              isSelected
                                ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            } ${isDeleting ? 'opacity-50' : ''}`}
                          >
                            <video
                              src={video.url}
                              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                              muted
                              preload="metadata"
                              onLoadedMetadata={() => videoLoad(video.url)}
                              onError={() => videoError(video.url)}
                            />
                            
                            <div className="absolute top-2 left-2 z-10">
                              <input
                                type={isMultiSelectMode ? "checkbox" : "radio"}
                                name={isMultiSelectMode ? undefined : "video-selection"}
                                checked={isSelected}
                                onChange={() => toggleVideoSelection(video)}
                                className="w-5 h-5 text-purple-600 bg-white border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                                disabled={isDeleting}
                              />
                            </div>

                            {/* Delete button */}
                            <div className="absolute top-2 right-2 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteVideo(video);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                title="Delete video"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            </div>

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black bg-opacity-50 rounded-full p-3">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 5v10l6-5-6-5z"/>
                                </svg>
                              </div>
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

                            {!loadedVideos.has(video.url) && (
                              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                                <div className="text-gray-400 dark:text-gray-500">
                                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 5v10l6-5-6-5z"/>
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {videos.length === 0 && !loading && (
                      <div className="text-center py-8">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">No videos uploaded yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Upload some videos to get started</p>
                      </div>
                    )}

                    {selectedGalleryVideo && !isMultiSelectMode && (
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Selected Video:
                        </h4>
                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded border w-fit">
                          <video
                            src={selectedGalleryVideo.url}
                            className="w-12 h-8 object-cover rounded border border-gray-200 dark:border-gray-500"
                            muted
                            preload="metadata"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">Video File</p>
                            <p className="text-xs text-gray-500 truncate">{selectedGalleryVideo.fileName}</p>
                          </div>
                          <button
                            onClick={() => setSelectedGalleryVideo(null)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Remove selection"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              /* Upload Tab Content */
              <>
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">{uploadError}</p>
                  </div>
                )}

                {/* Upload Area */}
                <div className="mb-6">
                  <div
                    onDrop={dropFile}
                    onDragOver={dragOver}
                    onDragLeave={dragLeave}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver
                        ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={fileInputChange}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            Drop your videos here
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            or <span className="text-purple-600 dark:text-purple-400 underline">browse to upload</span>
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Supports: MP4, WebM, MOV, AVI (Max 100MB each)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Uploaded Videos Grid */}
                {uploadPreviews.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Uploaded Videos ({uploadPreviews.length}):
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadPreviews.map((preview, index) => (
                        <div
                          key={index}
                          className={`relative aspect-video cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            preview.selected
                              ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <video
                            src={preview.url}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                          
                          <div className="absolute top-2 left-2 z-10">
                            <input
                              type="checkbox"
                              checked={preview.selected}
                              onChange={() => toggleUploadedVideoSelection(preview.file)}
                              className="w-5 h-5 text-purple-600 bg-white border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                          </div>

                          <button
                            onClick={() => removeUploadedVideo(preview.file)}
                            className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            title="Remove video"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>

                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-50 rounded-full p-3">
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 5v10l6-5-6-5z"/>
                              </svg>
                            </div>
                          </div>

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
                              <video
                                src={preview.url}
                                className="w-12 h-8 object-cover rounded border border-gray-200 dark:border-gray-500"
                                muted
                                preload="metadata"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                            </div>
                            <button
                              onClick={() => toggleUploadedVideoSelection(file)}
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
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSelection}
                disabled={!hasSelectionToConfirm || isUploading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  hasSelectionToConfirm && !isUploading
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </div>
                ) : (
                  'Select a Video'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {confirmation.isOpen && confirmation.config && (
        <ConfirmationDialog
          isOpen={confirmation.isOpen}
          onClose={confirmation.onClose}
          onConfirm={confirmation.onConfirm}
          onCancel={confirmation.onCancel}
          title={confirmation.config.title}
          message={confirmation.config.message}
          confirmText={confirmation.config.confirmText}
          cancelText={confirmation.config.cancelText}
        />
      )}
    </div>,
    document.body
  );
});

VideoGalleryModal.displayName = 'VideoGalleryModal';

export default VideoGalleryModal;
