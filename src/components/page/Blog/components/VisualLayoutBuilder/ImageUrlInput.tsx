"use client";
import React, { useState, useEffect } from 'react';
import { validateImageUrl, generateImagePlaceholder } from './imageUtils';

interface ImageUrlInputProps {
  imageUrl: string;
  altText: string;
  onImageUrlChange: (url: string) => void;
  onAltTextChange: (alt: string) => void;
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({
  imageUrl,
  altText,
  onImageUrlChange,
  onAltTextChange,
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
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
          Image URL
        </label>
        <input
          type="url"
          value={localImageUrl}
          onChange={(e) => setLocalImageUrl(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          placeholder="https://example.com/image.jpg or https://unsplash.com/..."
        />
        {hasImageUrl && !isValidUrl && (
          <div className="text-xs text-red-400 mt-1">
            <p>Please enter a valid image URL</p>
            <p className="text-gray-500 mt-1">
              Supported: Direct image links (.jpg, .png, .gif, .svg, .webp) or base64 data URLs
            </p>
          </div>
        )}
        {isValidUrl && (
          <p className="text-xs text-green-400 mt-1">Valid image URL</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
          Alt Text
        </label>
        <input
          type="text"
          value={localAltText}
          onChange={(e) => setLocalAltText(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          placeholder="Image description..."
        />
      </div>
      
      {hasImageUrl && isValidUrl && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
            Preview
          </label>
          <div className="relative">
            <img 
              src={localImageUrl} 
              alt={localAltText || "Preview"} 
              className="w-full h-32 object-cover rounded border border-gray-600"
              onError={(e) => {
                e.currentTarget.src = generateImagePlaceholder(100, 100, 'Failed to load');
              }}
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
              title="Remove image"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUrlInput;
