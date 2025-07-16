import React from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';
import ImageUrlInput from '../ImageUrlInput';

interface ContentControlsProps {
  block: LayoutBlock;
  onContentUpdate: (field: string, value: any) => void;
}

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
          <select
            value={(block.content as any)?.level || 1}
            onChange={(e) => onContentUpdate('level', parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
            <option value={4}>H4</option>
            <option value={5}>H5</option>
            <option value={6}>H6</option>
          </select>
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
