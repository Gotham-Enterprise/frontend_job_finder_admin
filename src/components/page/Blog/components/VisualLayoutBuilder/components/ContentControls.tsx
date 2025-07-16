import React from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';
import ImageUrlInput from '../ImageUrlInput';

interface ContentControlsProps {
  block: LayoutBlock;
  onContentUpdate: (field: string, value: any) => void;
}

const headingLevels = [
  { value: 1, label: 'H1' },
  { value: 2, label: 'H2' },
  { value: 3, label: 'H3' },
  { value: 4, label: 'H4' },
  { value: 5, label: 'H5' },
  { value: 6, label: 'H6' },
];

const ContentControls: React.FC<ContentControlsProps> = ({ block, onContentUpdate }) => {
  if (block.type === 'paragraph') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            value={(block.content as any)?.text || ''}
            onChange={(e) => onContentUpdate('text', e.target.value)}
            placeholder="Enter your text..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none transition-all"
            rows={4}
          />
        </div>
      </div>
    );
  }

  if (block.type === 'heading') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={(block.content as any)?.text || ''}
            onChange={(e) => onContentUpdate('text', e.target.value)}
            placeholder="Enter heading title..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
          <div className="relative">
            <select
              value={(block.content as any)?.level || 1}
              onChange={(e) => onContentUpdate('level', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all appearance-none relative z-[70]"
            >
              {headingLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === 'image') {
    return (
      <div className="space-y-4">
        <ImageUrlInput
          imageUrl={(block.content as any)?.url || ''}
          altText={(block.content as any)?.alt || ''}
          onImageUrlChange={(value: string) => onContentUpdate('url', value)}
          onAltTextChange={(value: string) => onContentUpdate('alt', value)}
        />
      </div>
    );
  }

  return null;
};

export default ContentControls;
