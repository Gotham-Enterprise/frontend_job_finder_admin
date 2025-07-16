import React, { useState, useRef } from 'react';
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
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState('_self');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTextSelection = (ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>) => {
    if (!ref.current) return;
    
    const start = ref.current.selectionStart || 0;
    const end = ref.current.selectionEnd || 0;
    const text = ref.current.value;
    
    if (start !== end) {
      const selected = text.substring(start, end);
      setSelectedText(selected);
      setShowLinkModal(true);
    }
  };

  const insertLink = () => {
    if (!selectedText || !linkUrl) return;
    
    const currentText = (block.content as any)?.text || '';
    const linkHtml = `<a href="${linkUrl}" target="${linkTarget}" ${linkTarget === '_blank' ? 'rel="noopener noreferrer"' : ''}>${selectedText}</a>`;
    const newText = currentText.replace(selectedText, linkHtml);
    
    onContentUpdate('text', newText);
    setShowLinkModal(false);
    setSelectedText('');
    setLinkUrl('');
    setLinkTarget('_self');
  };

  const removeAllLinks = () => {
    const currentText = (block.content as any)?.text || '';
    const textWithoutLinks = currentText.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
    onContentUpdate('text', textWithoutLinks);
  };

  if (block.type === 'paragraph') {
    return (
      <>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              ref={textareaRef}
              value={(block.content as any)?.text || ''}
              onChange={(e) => onContentUpdate('text', e.target.value)}
              onMouseUp={() => handleTextSelection(textareaRef)}
              placeholder="Enter your text..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none transition-all"
              rows={4}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">Select text and it will prompt you to add a link</p>
              <button
                onClick={removeAllLinks}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Remove all links
              </button>
            </div>
          </div>
        </div>

        {/* Link Floating Panel */}
        {showLinkModal && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 w-80 shadow-xl border border-gray-200 z-[100] max-w-[90vw]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800">Add Link</h4>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setSelectedText('');
                  setLinkUrl('');
                }}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Selected Text</label>
                <div className="px-2 py-1 bg-gray-50 rounded-lg text-sm text-gray-800 font-medium">
                  "{selectedText}"
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Open Link In</label>
                <select
                  value={linkTarget}
                  onChange={(e) => setLinkTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all"
                >
                  <option value="_self">Same Tab</option>
                  <option value="_blank">New Tab</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setSelectedText('');
                  setLinkUrl('');
                }}
                className="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                disabled={!linkUrl.trim()}
                className="flex-1 px-3 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Add Link
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (block.type === 'heading') {
    return (
      <>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              ref={inputRef}
              type="text"
              value={(block.content as any)?.text || ''}
              onChange={(e) => onContentUpdate('text', e.target.value)}
              onMouseUp={() => handleTextSelection(inputRef)}
              placeholder="Enter heading title..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">Select text and it will prompt you to add a link</p>
              <button
                onClick={removeAllLinks}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Remove all links
              </button>
            </div>
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

        {/* Link Modal */}
        {showLinkModal && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 w-80 shadow-xl border border-gray-200 z-[100] max-w-[90vw]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800">Add Link</h4>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setSelectedText('');
                  setLinkUrl('');
                }}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Selected Text</label>
                <div className="px-2 py-1 bg-gray-50 rounded-lg text-sm text-gray-800 font-medium">
                  "{selectedText}"
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Open Link In</label>
                <select
                  value={linkTarget}
                  onChange={(e) => setLinkTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all"
                >
                  <option value="_self">Same Tab</option>
                  <option value="_blank">New Tab</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setSelectedText('');
                  setLinkUrl('');
                }}
                className="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                disabled={!linkUrl.trim()}
                className="flex-1 px-3 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Add Link
              </button>
            </div>
          </div>
        )}
      </>
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
