import React, { useState, useRef, memo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';
import ImageUrlInput from '../ImageUrlInput';
import VideoUrlInput from '../VideoUrlInput';
import ButtonSettings from './ButtonSettings';
import RichTextEditor from './RichTextEditor';
import SimpleEditor from './SimpleEditor';
import { LINK_TARGETS, getButtonDefaultStyles, getSizeStyles } from '../utils/buttonUtils';
import { 
  processTextSelection as processSelection, 
  createLinkHtml, 
  removeAllLinksFromText, 
  replaceTextWithLink 
} from '../utils/textUtils';


interface ContentControlsProps {
  block: LayoutBlock;
  onContentUpdate: (field: string, value: any) => void;
  onStyleUpdate?: (field: string, value: any) => void;
  onSetFeaturedImage?: (imageUrl: string) => void;
  currentFeaturedImage?: string;
}

const ContentControls: React.FC<ContentControlsProps> = memo(({ 
  block, 
  onContentUpdate, 
  onStyleUpdate,
  onSetFeaturedImage,
  currentFeaturedImage 
}) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showFullscreenEditor, setShowFullscreenEditor] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState('_self');
  const [selectedListItemIndex, setSelectedListItemIndex] = useState<number | null>(null);
  const [selectedTextPreview, setSelectedTextPreview] = useState<{[key: number]: string}>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listItemRefs = useRef<(HTMLInputElement | null)[]>([]);

 
  const [localQuoteText, setLocalQuoteText] = useState(() => {
    const currentText = (block.content as any)?.text || '';
    return currentText === 'Your inspiring quote goes here...' ? '' : currentText;
  });
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentText = (block.content as any)?.text || '';
    setLocalQuoteText(currentText === 'Your inspiring quote goes here...' ? '' : currentText);
  }, [block.content?.text]);

  const debouncedUpdateQuoteText = useCallback((value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      // If the value is empty, set it to the placeholder text
      const finalValue = value.trim() === '' ? 'Your inspiring quote goes here...' : value;
      onContentUpdate('text', finalValue);
    }, 300); 
  }, [onContentUpdate]);

  const listItems = (block.content as any)?.items || [];
  const isListOrdered = (block.content as any)?.ordered || false;

  const addListItem = useCallback(() => {
    const newItems = [...listItems, `Item ${listItems.length + 1}`];
    onContentUpdate('items', newItems);
  }, [listItems, onContentUpdate]);

  const removeListItem = useCallback((index: number) => {
    if (listItems.length > 1) {
      const newItems = listItems.filter((_: any, i: number) => i !== index);
      // Re-index the remaining placeholder items to maintain consistent numbering
      const updatedItems = newItems.map((item: string, i: number) => {
        if (item.startsWith('Item ') && /^Item \d+$/.test(item)) {
          return `Item ${i + 1}`;
        }
        return item;
      });
      onContentUpdate('items', updatedItems);
    }
  }, [listItems, onContentUpdate]);

  const updateListItem = useCallback((index: number, value: string) => {
    const newItems = [...listItems];
    // If the user enters actual content, use it; if empty, revert to placeholder
    newItems[index] = value.trim() === '' ? `Item ${index + 1}` : value;
    onContentUpdate('items', newItems);
  }, [listItems, onContentUpdate]);

  const toggleListType = useCallback((ordered: boolean) => {
    onContentUpdate('ordered', ordered);
  }, [onContentUpdate]);

  const processTextSelection = useCallback((ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>) => {
    const result = processSelection(ref);
    if (result) {
      setSelectedText(result.selectedText);
      setShowLinkModal(true);
    }
  }, []);

  const processListItemTextSelection = useCallback((itemIndex: number) => {
    const ref = { current: listItemRefs.current[itemIndex] };
    const result = processSelection(ref);
    if (result) {
      setSelectedText(result.selectedText);
      setSelectedListItemIndex(itemIndex);
      setShowLinkModal(true);
    }
  }, []);

  const createLink = useCallback(() => {
    if (!selectedText || !linkUrl) return;
    
    const linkHtml = createLinkHtml(selectedText, linkUrl, linkTarget);
    
    // Check if this is for a list item or regular text/heading
    if (selectedListItemIndex !== null) {
      // Handle list item link
      const newItems = [...listItems];
      const currentItemText = newItems[selectedListItemIndex];
      const newItemText = replaceTextWithLink(currentItemText, selectedText, linkHtml);
      newItems[selectedListItemIndex] = newItemText;
      onContentUpdate('items', newItems);
    } else {
      // Handle text/heading link
      const currentText = (block.content as any)?.text || '';
      const newText = replaceTextWithLink(currentText, selectedText, linkHtml);
      onContentUpdate('text', newText);
    }
    
    resetLinkModal();
  }, [selectedText, linkUrl, linkTarget, block.content, onContentUpdate, selectedListItemIndex, listItems]);

  const resetLinkModal = useCallback(() => {
    setShowLinkModal(false);
    setSelectedText('');
    setLinkUrl('');
    setLinkTarget('_self');
    setSelectedListItemIndex(null);
  }, []);

  const handleButtonContentUpdate = useCallback((field: string, value: any) => {
    onContentUpdate(field, value);
    
    if (field === 'variant' && onStyleUpdate) {
      const variantStyles = getButtonDefaultStyles(value as any) as any;
      onStyleUpdate('backgroundColor', variantStyles.backgroundColor);
      onStyleUpdate('textColor', variantStyles.textColor);
      if (variantStyles.border) {
        onStyleUpdate('border', variantStyles.border);
      }
    } else if (field === 'size' && onStyleUpdate) {
      const sizeStyles = getSizeStyles(value as any);
      onStyleUpdate('fontSize', sizeStyles.fontSize);
      onStyleUpdate('padding', sizeStyles.padding);
    }
  }, [onContentUpdate, onStyleUpdate]);

  const removeAllLinks = useCallback(() => {
    const currentText = (block.content as any)?.text || '';
    const textWithoutLinks = removeAllLinksFromText(currentText);
    onContentUpdate('text', textWithoutLinks);
  }, [block.content, onContentUpdate]);

  const removeLinksFromListItem = useCallback((itemIndex: number) => {
    const newItems = [...listItems];
    const currentItemText = newItems[itemIndex];
    const textWithoutLinks = removeAllLinksFromText(currentItemText);
    newItems[itemIndex] = textWithoutLinks;
    onContentUpdate('items', newItems);
  }, [listItems, onContentUpdate]);

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
            &ldquo;{selectedText}&rdquo;
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

  const renderFullscreenEditor = () => {
    if (!showFullscreenEditor) return null;
    
    return createPortal(
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Edit Content</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFullscreenEditor(false)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowFullscreenEditor(false)}
              className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
            >
              Save & Close
            </button>
          </div>
        </div>
        
        {/* Editor Area - Full Height */}
        <div className="flex-1 overflow-hidden bg-white">
          <div className="h-full w-full">
            <SimpleEditor
              content={(block.content as any)?.text || ''}
              onChange={(value: string) => onContentUpdate('text', value)}
              placeholder="A blog is your creative space. It's where you can share your brand's story or impart your wisdom using your own words, with your own visual language to match. Fortunately, you don't need to be a professional to be successful blog either. All you need is a genuine passion for your field, lots to say and a stylish canvas on which to say it."
              className="text-base leading-relaxed w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
        
        {/* Footer with Link Color */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Link Color:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={block.styles?.linkColor || '#3b82f6'}
                  onChange={(e) => onStyleUpdate?.('linkColor', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={block.styles?.linkColor || '#3b82f6'}
                  onChange={(e) => onStyleUpdate?.('linkColor', e.target.value)}
                  placeholder="#3b82f6"
                  className="w-24 px-2 py-1 text-sm bg-white border border-gray-200 rounded focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={removeAllLinks}
              className="text-sm text-red-500 hover:text-red-700 underline"
            >
              Remove all links
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const CONTENT_RENDERERS = {
    paragraph: () => (
      <>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <button
                onClick={() => setShowFullscreenEditor(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-purple-600 transition-all hover:shadow-sm"
                title="Open fullscreen editor"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Fullscreen
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={(block.content as any)?.text === 'Start writing your content here...' ? '' : ((block.content as any)?.text || '')}
              onChange={(e) => onContentUpdate('text', e.target.value)}
              onMouseUp={() => processTextSelection(textareaRef)}
              placeholder="Start writing your content here..."
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
        {renderFullscreenEditor()}
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
              value={(block.content as any)?.text === 'Your Heading Here' ? '' : ((block.content as any)?.text || '')}
              onChange={(e) => onContentUpdate('text', e.target.value)}
              onMouseUp={() => processTextSelection(inputRef)}
              placeholder="Your Heading Here"
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
          imageWidth={block.styles?.width || 100}
          imageHeight={block.styles?.height !== undefined ? block.styles.height : 400}
          widthUnit={(block.styles?.widthUnit as 'px' | '%') || '%'}
          heightUnit={(block.styles?.heightUnit as 'px' | '%') || 'px'}
          imageAlign={(block.styles?.imageAlign as 'left' | 'center' | 'right') || 'center'}
          borderRadius={block.styles?.border?.radius || 1}
          onWidthChange={(value: number) => onStyleUpdate?.('width', value)}
          onHeightChange={(value: number) => onStyleUpdate?.('height', value)}
          onWidthUnitChange={(value: 'px' | '%') => onStyleUpdate?.('widthUnit', value)}
          onHeightUnitChange={(value: 'px' | '%') => onStyleUpdate?.('heightUnit', value)}
          onImageAlignChange={(value: 'left' | 'center' | 'right') => onStyleUpdate?.('imageAlign', value)}
          onBorderRadiusChange={(value: number) => {
            const currentBorder = block.styles?.border || { width: 0, style: 'solid', color: '#000000', radius: 1 };
            onStyleUpdate?.('border', { ...currentBorder, radius: value });
          }}
          onSetFeaturedImage={onSetFeaturedImage}
          currentFeaturedImage={currentFeaturedImage}
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
          videoHeight={block.styles.height !== undefined ? block.styles.height : 400}
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

    button: () => (
      <ButtonSettings
        block={block as any}
        onContentUpdate={handleButtonContentUpdate}
        onStyleUpdate={onStyleUpdate}
      />
    ),

    list: () => {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">List Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => toggleListType(false)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                  !isListOrdered
                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Bullet List
              </button>
              <button
                onClick={() => toggleListType(true)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                  isListOrdered
                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Numbered List
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">List Items</label>
              <button
                onClick={addListItem}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Add Item
              </button>
            </div>
            
            <div className="mb-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 <strong>How to add links:</strong> 
                <br />• <strong>Partial link:</strong> Select specific text (e.g., just "marketing"), then click "Add Link"
                <br />• <strong>Full item link:</strong> Click "Add Link" without selecting anything to link the entire item
                <br />• Enter your URL and click "Add Link"
              </p>
            </div>
            
            <div className="space-y-2">
              {listItems.map((item: string, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={(el) => { listItemRefs.current[index] = el; }}
                      type="text"
                      value={item.startsWith('Item ') && /^Item \d+$/.test(item) ? '' : item}
                      onChange={(e) => updateListItem(index, e.target.value)}
                      onMouseUp={() => {
                        // Check if text is selected and update preview
                        const input = listItemRefs.current[index];
                        if (input && input.selectionStart !== input.selectionEnd) {
                          const selectedText = input.value.substring(input.selectionStart || 0, input.selectionEnd || 0);
                          setSelectedTextPreview(prev => ({
                            ...prev,
                            [index]: selectedText
                          }));
                          
                          // Show a subtle hint that they can now add a link
                          const linkButton = input.parentElement?.nextElementSibling?.querySelector('button');
                          if (linkButton) {
                            linkButton.classList.add('ring-2', 'ring-blue-400');
                            setTimeout(() => {
                              linkButton.classList.remove('ring-2', 'ring-blue-400');
                            }, 2000);
                          }
                        } else {
                          // Clear preview if no text selected
                          setSelectedTextPreview(prev => {
                            const newPrev = { ...prev };
                            delete newPrev[index];
                            return newPrev;
                          });
                        }
                      }}
                      placeholder={`Item ${index + 1}`}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all"
                    />
                    {listItems.length > 1 && (
                      <button
                        onClick={() => removeListItem(index)}
                        className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {/* Link controls for each list item */}
                  <div className="flex items-center gap-2 ml-2">
                    {selectedTextPreview[index] && (
                      <div className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded border">
                        Selected: "{selectedTextPreview[index]}"
                      </div>
                    )}
                    <button
                      onClick={() => {
                        const input = listItemRefs.current[index];
                        if (input) {
                          input.focus();
                          
                          setTimeout(() => {
                            const selection = processSelection({ current: input });
                            
                            if (selection && selection.selectedText.length > 0) {
                              // User has selected specific text - use that
                              setSelectedText(selection.selectedText);
                              setSelectedListItemIndex(index);
                              setShowLinkModal(true);
                            } else {
                              // No text selected - use entire item text
                              const fullText = input.value.trim();
                              if (fullText && fullText !== `Item ${index + 1}`) {
                                setSelectedText(fullText);
                                setSelectedListItemIndex(index);
                                setShowLinkModal(true);
                              } else {
                                alert('Please add some text to this list item first, or select specific text you want to link.');
                              }
                            }
                          }, 100);
                        }
                      }}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        selectedTextPreview[index] 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 ring-2 ring-green-300' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                      title={selectedTextPreview[index] 
                        ? `Click to add link to "${selectedTextPreview[index]}"` 
                        : "Select specific text for partial link, or click without selecting to link entire item"
                      }
                    >
                      🔗 {selectedTextPreview[index] ? 'Link Selected Text' : 'Add Link'}
                    </button>
                    {item.includes('<a ') && (
                      <button
                        onClick={() => removeLinksFromListItem(index)}
                        className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                        title="Remove all links from this item"
                      >
                        🚫 Remove Links
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Link Color Customization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link Color</label>
            <div className="flex items-center gap-2">
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
            <p className="text-xs text-gray-500 mt-1">
              This color will be applied to all links in this list
            </p>
          </div>
          
          {showLinkModal && renderLinkModal()}
        </div>
      );
    },

    quote: () => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
          <textarea
            value={localQuoteText}
            onChange={(e) => {
              setLocalQuoteText(e.target.value);
              debouncedUpdateQuoteText(e.target.value);
            }}
            placeholder="Your inspiring quote goes here..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none transition-all"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Author (Optional)</label>
          <input
            type="text"
            value={(block.content as any)?.author || ''}
            onChange={(e) => onContentUpdate('author', e.target.value)}
            placeholder="Quote author..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Citation (Optional)</label>
          <input
            type="text"
            value={(block.content as any)?.citation || ''}
            onChange={(e) => onContentUpdate('citation', e.target.value)}
            placeholder="Source or publication..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={block.styles?.backgroundColor || '#f8f9fa'}
              onChange={(e) => onStyleUpdate?.('backgroundColor', e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={block.styles?.backgroundColor || '#f8f9fa'}
              onChange={(e) => onStyleUpdate?.('backgroundColor', e.target.value)}
              placeholder="#f8f9fa"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={block.styles?.accentColor || '#8b5cf6'}
              onChange={(e) => onStyleUpdate?.('accentColor', e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={block.styles?.accentColor || '#8b5cf6'}
              onChange={(e) => onStyleUpdate?.('accentColor', e.target.value)}
              placeholder="#8b5cf6"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>
      </div>
    ),

    default: () => null
  };

  const renderer = CONTENT_RENDERERS[block.type as keyof typeof CONTENT_RENDERERS] || CONTENT_RENDERERS.default;
  
  return renderer();
}, (prevProps, nextProps) => (
    prevProps.block.id === nextProps.block.id &&
    prevProps.block.type === nextProps.block.type &&
    JSON.stringify(prevProps.block.content) === JSON.stringify(nextProps.block.content) &&
    JSON.stringify(prevProps.block.styles) === JSON.stringify(nextProps.block.styles)
  ));

ContentControls.displayName = 'ContentControls';

export default ContentControls;
