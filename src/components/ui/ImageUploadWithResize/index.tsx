"use client";
import React, { useState, useRef, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { ImageResizer, RESIZE_PRESETS, ProcessedImage, ResizeOptions } from '@/services/utils/imageResizer';
import { ImageIcon, DownloadIcon } from '@/icons';

interface ImageUploadWithResizeProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (processedImage: ProcessedImage) => void;
  title?: string;
  allowMultipleResizes?: boolean;
}

interface PreviewImage {
  original: ProcessedImage;
  resized?: ProcessedImage;
  selectedPreset?: keyof typeof RESIZE_PRESETS;
  customResize?: ResizeOptions;
}

const ImageUploadWithResize: React.FC<ImageUploadWithResizeProps> = ({
  isOpen,
  onClose,
  onImageSelect,
  title = "Upload and Resize Image",
  allowMultipleResizes = true
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof RESIZE_PRESETS>('large');
  const [customResize, setCustomResize] = useState<ResizeOptions>({
    width: 800,
    height: 600,
    quality: 0.9,
    format: 'jpeg',
    maintainAspectRatio: true
  });
  const [useCustomResize, setUseCustomResize] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      // Validate image
      const validation = ImageResizer.validateImage(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid image file');
        setIsProcessing(false);
        return;
      }

      // Get original image data
      const originalDimensions = await ImageResizer.getImageDimensions(file);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const original: ProcessedImage = {
          file,
          dataUrl: e.target?.result as string,
          dimensions: originalDimensions,
          size: file.size
        };

        setSelectedFile(file);
        setPreviewImage({ original });
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const processWithPreset = useCallback(async (preset: keyof typeof RESIZE_PRESETS) => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const resized = await ImageResizer.resizeImage(selectedFile, RESIZE_PRESETS[preset]);
      setPreviewImage(prev => prev ? { ...prev, resized, selectedPreset: preset } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resize image');
    }

    setIsProcessing(false);
  }, [selectedFile]);

  const processWithCustomSettings = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const resized = await ImageResizer.resizeImage(selectedFile, customResize);
      setPreviewImage(prev => prev ? { ...prev, resized, customResize } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resize image');
    }

    setIsProcessing(false);
  }, [selectedFile, customResize]);

  const handleInsertImage = useCallback(() => {
    if (!previewImage) return;

    const imageToInsert = previewImage.resized || previewImage.original;
    onImageSelect(imageToInsert);
    
    // Reset state
    setSelectedFile(null);
    setPreviewImage(null);
    setError(null);
    onClose();
  }, [previewImage, onImageSelect, onClose]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetModal = useCallback(() => {
    setSelectedFile(null);
    setPreviewImage(null);
    setError(null);
    setUseCustomResize(false);
    setSelectedPreset('large');
  }, []);

  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {title}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!selectedFile ? (
          // File Upload Area - Simplified for drop only
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center transition-colors"
          >
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <ImageIcon />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drop files here
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Supports JPEG, PNG, WebP, GIF up to 10MB
              </p>
            </div>
          </div>
        ) : (
          // Image Processing Area
          <div className="space-y-6">
            {/* Image Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Image */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Original Image
                </h4>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  {previewImage && (
                    <img
                      src={previewImage.original.dataUrl}
                      alt="Original"
                      className="w-full h-48 object-cover"
                    />
                  )}
                </div>
                {previewImage && (
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <div>Size: {formatFileSize(previewImage.original.size)}</div>
                    <div>
                      Dimensions: {previewImage.original.dimensions.width} × {previewImage.original.dimensions.height}
                    </div>
                  </div>
                )}
              </div>

              {/* Resized Image */}
              {previewImage?.resized && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resized Image
                  </h4>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    <img
                      src={previewImage.resized.dataUrl}
                      alt="Resized"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <div>Size: {formatFileSize(previewImage.resized.size)}</div>
                    <div>
                      Dimensions: {previewImage.resized.dimensions.width} × {previewImage.resized.dimensions.height}
                    </div>
                    <div className="text-green-600">
                      Reduced by: {Math.round(((previewImage.original.size - previewImage.resized.size) / previewImage.original.size) * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resize Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!useCustomResize}
                    onChange={() => setUseCustomResize(false)}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium">Use Preset</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={useCustomResize}
                    onChange={() => setUseCustomResize(true)}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium">Custom Settings</span>
                </label>
              </div>

              {!useCustomResize ? (
                // Preset Options
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Preset
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(RESIZE_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedPreset(key as keyof typeof RESIZE_PRESETS);
                          processWithPreset(key as keyof typeof RESIZE_PRESETS);
                        }}
                        disabled={isProcessing}
                        className={`p-2 text-xs rounded border transition-colors ${
                          selectedPreset === key
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        }`}
                      >
                        <div className="font-medium capitalize">{key}</div>
                        <div className="text-xs opacity-75">
                          {preset.width}×{preset.height}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Custom Settings
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Width
                    </label>
                    <input
                      type="number"
                      value={customResize.width || ''}
                      onChange={(e) => setCustomResize(prev => ({ ...prev, width: parseInt(e.target.value) || undefined }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
                      placeholder="800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      value={customResize.height || ''}
                      onChange={(e) => setCustomResize(prev => ({ ...prev, height: parseInt(e.target.value) || undefined }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
                      placeholder="600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quality
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={customResize.quality || 0.9}
                      onChange={(e) => setCustomResize(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500">{Math.round((customResize.quality || 0.9) * 100)}%</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Format
                    </label>
                    <select
                      value={customResize.format || 'jpeg'}
                      onChange={(e) => setCustomResize(prev => ({ ...prev, format: e.target.value as 'jpeg' | 'png' | 'webp' }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
                    >
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>
                </div>
              )}

              {useCustomResize && (
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customResize.maintainAspectRatio !== false}
                      onChange={(e) => setCustomResize(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Maintain aspect ratio</span>
                  </label>
                  <Button
                    onClick={processWithCustomSettings}
                    disabled={isProcessing}
                    size="sm"
                  >
                    Apply Settings
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button
                variant="ghost"
                onClick={() => setSelectedFile(null)}
                className="text-gray-600 dark:text-gray-400"
              >
                Drop Different Image
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="dark:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInsertImage}
                  disabled={isProcessing}
                  startIcon={isProcessing ? undefined : <DownloadIcon />}
                >
                  {isProcessing ? 'Processing...' : 'Insert Image'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageUploadWithResize;
