"use client";
import React, { useState, useEffect } from 'react';
import { validateImageUrl, generateImagePlaceholder } from './imageUtils';

interface ImageUrlInputProps {
  imageUrl: string;
  altText: string;
  onImageUrlChange: (url: string) => void;
  onAltTextChange: (alt: string) => void;
  imageWidth?: number;
  imageHeight?: number;
  borderRadius?: number;
  onWidthChange?: (width: number) => void;
  onHeightChange?: (height: number) => void;
  onBorderRadiusChange?: (radius: number) => void;
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({
  imageUrl,
  altText,
  onImageUrlChange,
  onAltTextChange,
  imageWidth = 400,
  imageHeight = 200,
  borderRadius = 8,
  onWidthChange,
  onHeightChange,
  onBorderRadiusChange,
}) => {
  const [localImageUrl, setLocalImageUrl] = useState(imageUrl);
  const [localAltText, setLocalAltText] = useState(altText);

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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image URL
        </label>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Width (px)
          </label>
          <input
            type="number"
            min="50"
            max="1200"
            value={imageWidth}
            onChange={(e) => onWidthChange?.(parseInt(e.target.value) || 400)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height (px)
          </label>
          <input
            type="number"
            min="50"
            max="800"
            value={imageHeight}
            onChange={(e) => onHeightChange?.(parseInt(e.target.value) || 200)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
          />
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
                width: `${Math.min(imageWidth, 320)}px`,
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
            Actual size: {imageWidth} × {imageHeight}px
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUrlInput;
