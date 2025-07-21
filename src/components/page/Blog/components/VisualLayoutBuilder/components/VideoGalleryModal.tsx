import React, { memo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface VideoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoSelect: (videoUrl: string, file?: File) => void;
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
  const [selectedGalleryVideo, setSelectedGalleryVideo] = useState<string | null>(null);
  const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set());
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

  const toggleVideoSelection = (videoUrl: string) => {
    setSelectedGalleryVideo(prev => prev === videoUrl ? null : videoUrl);
  };

  const confirmSelection = () => {
    if (activeTab === 'gallery' && selectedGalleryVideo) {
      onVideoSelect(selectedGalleryVideo);
      onClose();
      setSelectedGalleryVideo(null);
    } else if (activeTab === 'upload' && selectedUploadedFiles.size > 0) {
      // For multiple uploaded files, we'll select the first one for now
      // You could modify this to handle multiple files differently
      const firstFile = Array.from(selectedUploadedFiles)[0];
      const objectUrl = URL.createObjectURL(firstFile);
      onVideoSelect(objectUrl, firstFile);
      onClose();
      resetUploadState();
    }
  };

  const closeModal = () => {
    onClose();
    setSelectedGalleryVideo(null);
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
    const videoFiles = fileArray.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      alert('Please select valid video files (MP4, WebM, MOV, AVI)');
      return;
    }

    videoFiles.forEach(file => {
      const objectUrl = URL.createObjectURL(file);
      setUploadPreviews(prev => [...prev, { file, url: objectUrl, selected: false }]);
    });
    
    setUploadedFiles(prev => [...prev, ...videoFiles]);
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

  const toggleUploadedVideoSelection = (file: File) => {
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

  const removeUploadedVideo = (file: File) => {
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {DEFAULT_VIDEOS.map((videoUrl, index) => {
                    const isSelected = selectedGalleryVideo === videoUrl;
                    const thumbnail = getVideoThumbnail(videoUrl);
                    const platform = getVideoPlatform(videoUrl);
                    
                    return (
                      <div
                        key={index}
                        className={`relative aspect-video cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={`${platform} video ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                            onLoad={() => videoLoad(videoUrl)}
                            onError={() => videoError(videoUrl)}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 5v10l6-5-6-5z"/>
                            </svg>
                          </div>
                        )}
                        
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="radio"
                            name="video-selection"
                            checked={isSelected}
                            onChange={() => toggleVideoSelection(videoUrl)}
                            className="w-5 h-5 text-purple-600 bg-white border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          />
                        </div>

                        {/* Platform Badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <span className="px-2 py-1 text-xs font-medium bg-black bg-opacity-75 text-white rounded">
                            {platform}
                          </span>
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

                        {!loadedVideos.has(videoUrl) && thumbnail && (
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

                {selectedGalleryVideo && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected Video:
                    </h4>
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded border w-fit">
                      {getVideoThumbnail(selectedGalleryVideo) ? (
                        <img
                          src={getVideoThumbnail(selectedGalleryVideo)!}
                          alt="Selected video"
                          className="w-12 h-8 object-cover rounded border border-gray-200 dark:border-gray-500"
                        />
                      ) : (
                        <div className="w-12 h-8 bg-gray-200 dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 5v10l6-5-6-5z"/>
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{getVideoPlatform(selectedGalleryVideo)} Video</p>
                        <p className="text-xs text-gray-500 truncate">{selectedGalleryVideo}</p>
                      </div>
                      <button
                        onClick={() => toggleVideoSelection(selectedGalleryVideo)}
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
                      accept="video/*"
                      onChange={handleFileInputChange}
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
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSelection}
                disabled={
                  (activeTab === 'gallery' && !selectedGalleryVideo) ||
                  (activeTab === 'upload' && selectedUploadedFiles.size === 0)
                }
                className="px-4 py-2 text-sm font-medium text-white bg-purple-500 border border-purple-500 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {activeTab === 'gallery' 
                  ? selectedGalleryVideo ? 'Use Selected Video' : 'Select a Video'
                  : selectedUploadedFiles.size > 0
                    ? `Use Selected Video${selectedUploadedFiles.size > 1 ? 's' : ''} (${selectedUploadedFiles.size})`
                    : 'Select a Video'
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

VideoGalleryModal.displayName = 'VideoGalleryModal';

export default VideoGalleryModal;
