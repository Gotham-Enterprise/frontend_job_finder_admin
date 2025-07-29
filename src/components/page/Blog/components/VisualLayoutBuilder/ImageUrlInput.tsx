"use client";
import React, { useState, useEffect } from 'react';
import { validateImageUrl, generateImagePlaceholder } from './imageUtils';
import { useModal } from '@/hooks/useModal';
import ImageGalleryModal from './components/ImageGalleryModal';

interface ImageUrlInputProps {
  imageUrl: string;
  altText: string;
  onImageUrlChange: (url: string) => void;
  onAltTextChange: (alt: string) => void;
  imageWidth?: number;
  imageHeight?: number;
  widthUnit?: 'px' | '%';
  heightUnit?: 'px' | '%';
  imageAlign?: 'left' | 'center' | 'right';
  borderRadius?: number;
  onWidthChange?: (width: number) => void;
  onHeightChange?: (height: number) => void;
  onWidthUnitChange?: (unit: 'px' | '%') => void;
  onHeightUnitChange?: (unit: 'px' | '%') => void;
  onImageAlignChange?: (align: 'left' | 'center' | 'right') => void;
  onBorderRadiusChange?: (radius: number) => void;
  onSetFeaturedImage?: (imageUrl: string) => void;
  currentFeaturedImage?: string;
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({
  imageUrl,
  altText,
  onImageUrlChange,
  onAltTextChange,
  imageWidth = 100,
  imageHeight = 400,
  widthUnit = '%',
  heightUnit = 'px',
  imageAlign = 'center',
  borderRadius = 8,
  onWidthChange,
  onHeightChange,
  onWidthUnitChange,
  onHeightUnitChange,
  onImageAlignChange,
  onBorderRadiusChange,
  onSetFeaturedImage,
  currentFeaturedImage = '',
}) => {
  const [localImageUrl, setLocalImageUrl] = useState(imageUrl);
  const [localAltText, setLocalAltText] = useState(altText);
  const galleryModal = useModal();

  useEffect(() => {
    setLocalImageUrl(imageUrl);
    setLocalAltText(altText);
  }, [imageUrl, altText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localImageUrl !== imageUrl) {
        onImageUrlChange(localImageUrl);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localImageUrl, imageUrl, onImageUrlChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localAltText !== altText) {
        onAltTextChange(localAltText);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localAltText, altText, onAltTextChange]);

  const validateImageUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url) || url.includes('data:image/');
    } catch {
      return false;
    }
  };

  const isValidUrl = validateImageUrl(localImageUrl);
  const hasImageUrl = localImageUrl.trim().length > 0;

  const clearImage = () => {
    setLocalImageUrl('');
    onImageUrlChange('');
  };

  const selectImageFromGallery = (selectedImageUrl: string) => {
    setLocalImageUrl(selectedImageUrl);
    onImageUrlChange(selectedImageUrl);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Image URL
          </label>
          <button
            type="button"
            onClick={galleryModal.openModal}
            className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all text-xs font-medium"
          >
            Browse Gallery
          </button>
        </div>
        <input
          type="url"
          value={localImageUrl}
          onChange={(e) => setLocalImageUrl(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
          placeholder="https://example.com/image.jpg or https://unsplash.com/..."
        />
        {hasImageUrl && !isValidUrl && (
          <div className="text-xs text-red-500 mt-2">
            <p>Please enter a valid image URL</p>
            <p className="text-gray-500 mt-1">
              Supported: Direct image links (.jpg, .png, .gif, .svg, .webp) or base64 data URLs
            </p>
          </div>
        )}
        {isValidUrl && (
          <p className="text-xs text-green-500 mt-2">Valid image URL ✓</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alt Text
        </label>
        <input
          type="text"
          value={localAltText}
          onChange={(e) => setLocalAltText(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
          placeholder="Image description..."
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Width
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max={widthUnit === '%' ? "100" : "1200"}
              step="1"
              value={imageWidth}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  // Allow empty input temporarily for better UX
                  return;
                } else {
                  const value = parseInt(inputValue);
                  if (!isNaN(value) && value >= 0) {
                    onWidthChange?.(value);
                  }
                }
              }}
              onBlur={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '' || inputValue === null || inputValue === undefined) {
                  // Set default when user leaves empty field
                  onWidthChange?.(widthUnit === '%' ? 100 : 300);
                }
              }}
              onKeyDown={(e) => {
                // Allow manual typing by preventing default arrow behavior if user is typing
                if (e.key === 'Backspace' || e.key === 'Delete' || 
                    (e.key >= '0' && e.key <= '9') || 
                    e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
                    e.key === 'Tab' || e.key === 'Enter') {
                  // Allow these keys
                  return;
                }
              }}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
            />
            <select
              value={widthUnit}
              onChange={(e) => onWidthUnitChange?.(e.target.value as 'px' | '%')}
              className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
            >
              <option value="%">%</option>
              <option value="px">px</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max={heightUnit === '%' ? "100" : "800"}
              step="1"
              value={imageHeight}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  // Allow empty input temporarily for better UX
                  return;
                } else {
                  const value = parseInt(inputValue);
                  if (!isNaN(value) && value >= 0) {
                    onHeightChange?.(value);
                  }
                }
              }}
              onBlur={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '' || inputValue === null || inputValue === undefined) {
                  // Set default when user leaves empty field
                  onHeightChange?.(heightUnit === '%' ? 100 : 400);
                }
              }}
              onKeyDown={(e) => {
                // Allow manual typing by preventing default arrow behavior if user is typing
                if (e.key === 'Backspace' || e.key === 'Delete' || 
                    (e.key >= '0' && e.key <= '9') || 
                    e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
                    e.key === 'Tab' || e.key === 'Enter') {
                  // Allow these keys
                  return;
                }
              }}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
            />
            <select
              value={heightUnit}
              onChange={(e) => onHeightUnitChange?.(e.target.value as 'px' | '%')}
              className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
            >
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Alignment
        </label>
        <div className="flex gap-2">
          {[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => onImageAlignChange?.(option.value as 'left' | 'center' | 'right')}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                imageAlign === option.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Border Radius: {borderRadius}px
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={borderRadius}
          onChange={(e) => onBorderRadiusChange?.(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
          style={{
            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(borderRadius / 50) * 100}%, #e5e7eb ${(borderRadius / 50) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>No radius</span>
          <span>Rounded</span>
        </div>
      </div>
      
      {hasImageUrl && isValidUrl && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Preview
          </label>
          <div className="relative">
            <img 
              src={localImageUrl} 
              alt={localAltText || "Preview"} 
              className="object-cover border border-gray-200"
              style={{
                width: widthUnit === '%' ? '100%' : `${Math.min(imageWidth, 320)}px`,
                height: `${Math.min(imageHeight, 180)}px`,
                borderRadius: `${borderRadius}px`
              }}
              onError={(e) => {
                e.currentTarget.src = generateImagePlaceholder(100, 100, 'Failed to load');
              }}
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Actual size: {imageWidth}{widthUnit} × {imageHeight}{heightUnit}
          </p>
        </div>
      )}

      <ImageGalleryModal
        isOpen={galleryModal.isOpen}
        onClose={galleryModal.closeModal}
        onImageSelect={selectImageFromGallery}
        onSetFeaturedImage={onSetFeaturedImage}
        currentFeaturedImage={currentFeaturedImage}
      />
    </div>
  );
};

export default ImageUrlInput;
