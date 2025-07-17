import React, { useState, useRef } from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';
import ImageUrlInput from '../ImageUrlInput';
import VideoUrlInput from '../VideoUrlInput';


interface ContentControlsProps {
  block: LayoutBlock;
  onContentUpdate: (field: string, value: any) => void;
  onStyleUpdate?: (field: string, value: any) => void;
}

const LINK_TARGETS = [
  { value: '_self', label: 'Same Tab' },
  { value: '_blank', label: 'New Tab' }
];

const ContentControls: React.FC<ContentControlsProps> = ({ block, onContentUpdate, onStyleUpdate }) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState('_self');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processTextSelection = (ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>) => {
    if (!ref.current) return;
    
    const { selectionStart, selectionEnd, value } = ref.current;
    const start = selectionStart ?? 0;
    const end = selectionEnd ?? 0;
    
    if (start !== end) {
      const selected = value.substring(start, end);
      setSelectedText(selected);
      setShowLinkModal(true);
    }
  };

  const createLink = () => {
    if (!selectedText || !linkUrl) return;
    
    const currentText = (block.content as any)?.text || '';
    const linkHtml = `<a href="${linkUrl}" target="${linkTarget}" ${linkTarget === '_blank' ? 'rel="noopener noreferrer"' : ''}>${selectedText}</a>`;
    const newText = currentText.replace(selectedText, linkHtml);
    
    onContentUpdate('text', newText);
    resetLinkModal();
  };

  const resetLinkModal = () => {
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

  const renderLinkModal = () => (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 w-80 shadow-xl border border-gray-200 z-[100] max-w-[90vw]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800">Add Link</h4>
        <button
          onClick={resetLinkModal}
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
            {LINK_TARGETS.map((target) => (
              <option key={target.value} value={target.value}>
                {target.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={resetLinkModal}
          className="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={createLink}
          disabled={!linkUrl.trim()}
          className="flex-1 px-3 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Add Link
        </button>
      </div>
    </div>
  );

  const CONTENT_RENDERERS = {
    paragraph: () => (
      <>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              ref={textareaRef}
              value={(block.content as any)?.text || ''}
              onChange={(e) => onContentUpdate('text', e.target.value)}
              onMouseUp={() => processTextSelection(textareaRef)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={block.styles?.linkColor || '#3b82f6'}
                onChange={(e) => onStyleUpdate?.('linkColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={block.styles?.linkColor || '#3b82f6'}
                onChange={(e) => onStyleUpdate?.('linkColor', e.target.value)}
                placeholder="#3b82f6"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>
        </div>
        {showLinkModal && renderLinkModal()}
      </>
    ),

    heading: () => (
      <>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              ref={inputRef}
              type="text"
              value={(block.content as any)?.text || ''}
              onChange={(e) => onContentUpdate('text', e.target.value)}
              onMouseUp={() => processTextSelection(inputRef)}
              placeholder="Enter heading title..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link Color</label>
            <input
              type="color"
              value={block.styles?.linkColor || '#3b82f6'}
              onChange={(e) => onStyleUpdate?.('linkColor', e.target.value)}
              className="w-full h-10 border border-gray-200 rounded-xl cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL (Optional)</label>
            <input
              type="url"
              value={(block.content as any)?.url || ''}
              onChange={(e) => onContentUpdate('url', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>
        </div>
        {showLinkModal && renderLinkModal()}
      </>
    ),

    image: () => (
      <div className="space-y-4">
        <ImageUrlInput
          imageUrl={(block.content as any)?.url || ''}
          altText={(block.content as any)?.alt || ''}
          onImageUrlChange={(value: string) => onContentUpdate('url', value)}
          onAltTextChange={(value: string) => onContentUpdate('alt', value)}
        />
      </div>
    ),

    video: () => (
      <div className="space-y-4">
        <VideoUrlInput
          videoUrl={(block.content as any)?.url || ''}
          title={(block.content as any)?.title || ''}
          autoplay={(block.content as any)?.autoplay || false}
          controls={(block.content as any)?.controls !== false}
          muted={(block.content as any)?.muted || false}
          videoWidth={block.styles.width || 100}
          videoHeight={block.styles.height || 400}
          widthUnit={(block.styles.widthUnit as 'px' | '%') || '%'}
          heightUnit={(block.styles.heightUnit as 'px' | '%') || 'px'}
          videoAlign={(block.styles.videoAlign as 'left' | 'center' | 'right') || 'center'}
          onVideoUrlChange={(value: string) => onContentUpdate('url', value)}
          onTitleChange={(value: string) => onContentUpdate('title', value)}
          onAutoplayChange={(value: boolean) => onContentUpdate('autoplay', value)}
          onControlsChange={(value: boolean) => onContentUpdate('controls', value)}
          onMutedChange={(value: boolean) => onContentUpdate('muted', value)}
          onWidthChange={(value: number) => onStyleUpdate?.('width', value)}
          onHeightChange={(value: number) => onStyleUpdate?.('height', value)}
          onWidthUnitChange={(value: 'px' | '%') => onStyleUpdate?.('widthUnit', value)}
          onHeightUnitChange={(value: 'px' | '%') => onStyleUpdate?.('heightUnit', value)}
          onVideoAlignChange={(value: 'left' | 'center' | 'right') => onStyleUpdate?.('videoAlign', value)}
        />
      </div>
    ),

    default: () => null
  };

  const renderer = CONTENT_RENDERERS[block.type as keyof typeof CONTENT_RENDERERS] || CONTENT_RENDERERS.default;
  
  return renderer();
};

export default ContentControls;
