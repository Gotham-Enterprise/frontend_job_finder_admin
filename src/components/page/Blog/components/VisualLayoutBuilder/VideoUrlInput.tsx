"use client";
import React, { useState, useEffect } from 'react';

interface VideoUrlInputProps {
  videoUrl: string;
  title: string;
  autoplay: boolean;
  controls: boolean;
  muted: boolean;
  videoWidth: number;
  videoHeight: number;
  widthUnit: 'px' | '%';
  heightUnit: 'px' | '%';
  videoAlign: 'left' | 'center' | 'right';
  onVideoUrlChange: (url: string) => void;
  onTitleChange: (title: string) => void;
  onAutoplayChange: (autoplay: boolean) => void;
  onControlsChange: (controls: boolean) => void;
  onMutedChange: (muted: boolean) => void;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onWidthUnitChange: (unit: 'px' | '%') => void;
  onHeightUnitChange: (unit: 'px' | '%') => void;
  onVideoAlignChange: (align: 'left' | 'center' | 'right') => void;
}

const VIDEO_PLATFORMS = [
  { key: 'youtube', patterns: ['youtube.com/watch', 'youtu.be/', 'youtube.com/shorts'] },
  { key: 'vimeo', patterns: ['vimeo.com'] }
];

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' }
];

const PLAYBACK_OPTIONS = [
  { key: 'autoplay', label: 'Autoplay' },
  { key: 'controls', label: 'Controls' },
  { key: 'muted', label: 'Muted' }
];

const DIMENSION_CONFIGS = {
  width: {
    '%': { min: 1, max: 100, default: 100 },
    'px': { min: 200, max: 1200, default: 600 }
  },
  height: {
    '%': { min: 1, max: 100, default: 50 },
    'px': { min: 200, max: 800, default: 400 }
  }
};

const VideoUrlInput: React.FC<VideoUrlInputProps> = ({
  videoUrl,
  title,
  autoplay,
  controls,
  muted,
  videoWidth,
  videoHeight,
  widthUnit,
  heightUnit,
  videoAlign,
  onVideoUrlChange,
  onTitleChange,
  onAutoplayChange,
  onControlsChange,
  onMutedChange,
  onWidthChange,
  onHeightChange,
  onWidthUnitChange,
  onHeightUnitChange,
  onVideoAlignChange,
}) => {
  const [localVideoUrl, setLocalVideoUrl] = useState(videoUrl);
  const [localTitle, setLocalTitle] = useState(title);
  const [localWidth, setLocalWidth] = useState(videoWidth);
  const [localHeight, setLocalHeight] = useState(videoHeight);

  useEffect(() => {
    setLocalVideoUrl(videoUrl);
    setLocalTitle(title);
    setLocalWidth(videoWidth);
    setLocalHeight(videoHeight);
  }, [videoUrl, title, videoWidth, videoHeight]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localVideoUrl !== videoUrl) {
        onVideoUrlChange(localVideoUrl);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localVideoUrl, videoUrl, onVideoUrlChange]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localTitle !== title) {
        onTitleChange(localTitle);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localTitle, title, onTitleChange]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localWidth !== videoWidth && localWidth > 0) {
        onWidthChange(localWidth);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [localWidth, videoWidth, onWidthChange]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localHeight !== videoHeight && localHeight > 0) {
        onHeightChange(localHeight);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [localHeight, videoHeight, onHeightChange]);

  const detectVideoPlatform = (url: string) => {
    return VIDEO_PLATFORMS.find(platform => 
      platform.patterns.some(pattern => url.includes(pattern))
    )?.key || 'direct';
  };

  const isValidVideoUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return detectVideoPlatform(url) !== 'direct' || 
             url.match(/\.(mp4|webm|ogg|mov|avi|wmv)$/i);
    } catch {
      return false;
    }
  };

  const createDimensionHandler = (type: 'width' | 'height') => (value: number) => {
    const unit = type === 'width' ? widthUnit : heightUnit;
    const config = DIMENSION_CONFIGS[type][unit];
    const numValue = isNaN(value) ? config.default : value;
    const clampedValue = Math.max(config.min, Math.min(config.max, numValue));
    
    if (type === 'width') {
      onWidthChange(clampedValue);
    } else {
      onHeightChange(clampedValue);
    }
  };

  const createPlaybackHandler = (option: string) => (checked: boolean) => {
    switch (option) {
      case 'autoplay': onAutoplayChange(checked); break;
      case 'controls': onControlsChange(checked); break;
      case 'muted': onMutedChange(checked); break;
    }
  };

  const renderDimensionControl = (type: 'width' | 'height') => {
    const value = type === 'width' ? localWidth : localHeight;
    const unit = type === 'width' ? widthUnit : heightUnit;
    const config = DIMENSION_CONFIGS[type][unit];
    const unitChanger = type === 'width' ? onWidthUnitChange : onHeightUnitChange;
    const localSetter = type === 'width' ? setLocalWidth : setLocalHeight;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={config.min}
            max={config.max}
            value={value || ''}
            onChange={(e) => {
              const newValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
              if (!isNaN(newValue)) {
                localSetter(newValue);
              }
            }}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
          />
          <select
            value={unit}
            onChange={(e) => unitChanger(e.target.value as 'px' | '%')}
            className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
          >
            <option value="%">%</option>
            <option value="px">px</option>
          </select>
        </div>
      </div>
    );
  };

  const isValidUrl = isValidVideoUrl(localVideoUrl);
  const hasVideoUrl = localVideoUrl.trim().length > 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
        <input
          type="url"
          value={localVideoUrl}
          onChange={(e) => setLocalVideoUrl(e.target.value)}
          placeholder="YouTube, Vimeo, or direct video URL..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
        />
        {hasVideoUrl && !isValidUrl && (
          <p className="text-xs text-red-500 mt-2">Please enter a valid video URL</p>
        )}
        {isValidUrl && (
          <p className="text-xs text-green-500 mt-2">Valid video URL ✓</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Supports YouTube, YouTube Shorts, Vimeo, and direct video file URLs
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title (Optional)</label>
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder="Video title..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
        />
      </div>

      <div className="space-y-4">
        {renderDimensionControl('width')}
        {renderDimensionControl('height')}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Video Alignment</label>
        <div className="flex gap-2">
          {ALIGNMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onVideoAlignChange(option.value as 'left' | 'center' | 'right')}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                videoAlign === option.value
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Playback Options</label>
        <div className="grid grid-cols-3 gap-3">
          {PLAYBACK_OPTIONS.map((option) => (
            <div key={option.key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={option.key}
                checked={
                  option.key === 'autoplay' ? autoplay :
                  option.key === 'controls' ? controls :
                  muted
                }
                onChange={(e) => createPlaybackHandler(option.key)(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor={option.key} className="text-sm text-gray-700">{option.label}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoUrlInput;
