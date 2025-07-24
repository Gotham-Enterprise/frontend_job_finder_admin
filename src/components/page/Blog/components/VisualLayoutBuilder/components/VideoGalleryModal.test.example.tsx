// Example usage of VideoGalleryModal with upload functionality

import React, { useState } from 'react';
import VideoGalleryModal from './VideoGalleryModal';

const VideoGalleryExample: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  const handleVideoSelect = (videoUrl: string, file?: File) => {
    setSelectedVideoUrl(videoUrl);
    setSelectedVideoFile(file || null);
    console.log('Selected video:', { videoUrl, file });
  };

  const openVideoModal = () => {
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Video Gallery Modal Example</h2>
      
      <button
        onClick={openVideoModal}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Open Video Gallery
      </button>

      {selectedVideoUrl && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Selected Video:</h3>
          <div className="aspect-video max-w-md">
            <video
              src={selectedVideoUrl}
              controls
              className="w-full h-full object-cover rounded"
            />
          </div>
          {selectedVideoFile && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              File: {selectedVideoFile.name} ({(selectedVideoFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      )}

      <VideoGalleryModal
        isOpen={isVideoModalOpen}
        onClose={closeVideoModal}
        onVideoSelect={handleVideoSelect}
      />
    </div>
  );
};

export default VideoGalleryExample;
