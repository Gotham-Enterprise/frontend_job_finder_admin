import React, { useState, useRef, memo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LayoutBlock, getAdBlockType, AdBlockType } from '../../../../../../services/types/visualLayoutTypes';
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
  replaceTextWithLink,
  processHtmlEntities,
  cleanHtmlEntities 
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
  // Clean block content immediately when received
  const cleanedBlock = React.useMemo(() => {
    const cleaned = { ...block };
    let hasChanges = false;
    
    if (cleaned.content?.text && typeof cleaned.content.text === 'string') {
      const cleanedText = cleanHtmlEntities(cleaned.content.text);
      if (cleanedText !== cleaned.content.text) {
        cleaned.content = { ...cleaned.content, text: cleanedText };
        hasChanges = true;
      }
    }
    
    if (cleaned.type === 'quote') {
      if ((cleaned.content as any)?.author && typeof (cleaned.content as any).author === 'string') {
        const cleanedAuthor = cleanHtmlEntities((cleaned.content as any).author);
        if (cleanedAuthor !== (cleaned.content as any).author) {
          cleaned.content = { ...cleaned.content, author: cleanedAuthor };
          hasChanges = true;
        }
      }
      
      if ((cleaned.content as any)?.citation && typeof (cleaned.content as any).citation === 'string') {
        const cleanedCitation = cleanHtmlEntities((cleaned.content as any).citation);
        if (cleanedCitation !== (cleaned.content as any).citation) {
          cleaned.content = { ...cleaned.content, citation: cleanedCitation };
          hasChanges = true;
        }
      }
    }
    
    if (cleaned.type === 'list' && (cleaned.content as any)?.items) {
      const items = (cleaned.content as any).items;
      const cleanedItems = items.map((item: string) => cleanHtmlEntities(item));
      const itemsChanged = cleanedItems.some((cleanedItem: string, index: number) => cleanedItem !== items[index]);
      if (itemsChanged) {
        cleaned.content = { ...cleaned.content, items: cleanedItems };
        hasChanges = true;
      }
    }
    
    if ((cleaned.content as any)?.url && typeof (cleaned.content as any).url === 'string') {
      const cleanedUrl = cleanHtmlEntities((cleaned.content as any).url);
      if (cleanedUrl !== (cleaned.content as any).url) {
        cleaned.content = { ...cleaned.content, url: cleanedUrl };
        hasChanges = true;
      }
    }
    
    // If we found HTML entities, update the actual block content immediately
    if (hasChanges) {
      // Use setTimeout to avoid updating during render
      setTimeout(() => {
        if (cleaned.content?.text !== block.content?.text) {
          onContentUpdate('text', cleaned.content.text);
        }
        if (cleaned.type === 'quote') {
          if ((cleaned.content as any)?.author !== (block.content as any)?.author) {
            onContentUpdate('author', (cleaned.content as any).author);
          }
          if ((cleaned.content as any)?.citation !== (block.content as any)?.citation) {
            onContentUpdate('citation', (cleaned.content as any).citation);
          }
        }
        if (cleaned.type === 'list' && (cleaned.content as any)?.items) {
          const originalItems = (block.content as any)?.items || [];
          const cleanedItems = (cleaned.content as any).items;
          if (JSON.stringify(originalItems) !== JSON.stringify(cleanedItems)) {
            onContentUpdate('items', cleanedItems);
          }
        }
        if ((cleaned.content as any)?.url !== (block.content as any)?.url) {
          onContentUpdate('url', (cleaned.content as any).url);
        }
      }, 0);
    }
    
    return cleaned;
  }, [block, onContentUpdate]);
  
  // Use cleaned block for the rest of the component
  const workingBlock = cleanedBlock;

  // Helper function to clean content for display
  const getCleanedContent = (content: string | undefined, fallback: string = ''): string => {
    if (!content) return fallback;
    return cleanHtmlEntities(content);
  };
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showFullscreenEditor, setShowFullscreenEditor] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState('_self');
  const [selectedListItemIndex, setSelectedListItemIndex] = useState<number | null>(null);
  const [selectedTextPreview, setSelectedTextPreview] = useState<{[key: number]: string}>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const quoteAuthorRef = useRef<HTMLInputElement>(null);
  const quoteCitationRef = useRef<HTMLInputElement>(null);
  const listItemRefs = useRef<(HTMLInputElement | null)[]>([]);

 
  const [localQuoteText, setLocalQuoteText] = useState(() => {
    const currentText = getCleanedContent((workingBlock.content as any)?.text);
    return currentText === 'Your inspiring quote goes here...' ? '' : currentText;
  });
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentText = getCleanedContent((workingBlock.content as any)?.text);
    setLocalQuoteText(currentText === 'Your inspiring quote goes here...' ? '' : currentText);
  }, [workingBlock.content?.text]);

  // Clean existing content of HTML entities on mount and block changes
  useEffect(() => {
    const cleanContentField = (field: string, value: any) => {
      if (typeof value === 'string') {
        const cleanedValue = cleanHtmlEntities(value);
        if (cleanedValue !== value) {
          onContentUpdate(field, cleanedValue);
        }
      }
    };

    // Clean text content
    if (workingBlock.content?.text) {
      cleanContentField('text', workingBlock.content.text);
    }

    // Clean author content for quotes
    if (workingBlock.type === 'quote' && (workingBlock.content as any)?.author) {
      cleanContentField('author', (workingBlock.content as any).author);
    }

    // Clean citation content for quotes
    if (workingBlock.type === 'quote' && (workingBlock.content as any)?.citation) {
      cleanContentField('citation', (workingBlock.content as any).citation);
    }

    // Clean list items
    if (workingBlock.type === 'list' && (workingBlock.content as any)?.items) {
      const items = (workingBlock.content as any).items;
      const cleanedItems = items.map((item: string) => cleanHtmlEntities(item));
      const hasChanges = cleanedItems.some((cleanedItem: string, index: number) => cleanedItem !== items[index]);
      if (hasChanges) {
        onContentUpdate('items', cleanedItems);
      }
    }

    // Clean button text
    if (workingBlock.type === 'button' && (workingBlock.content as any)?.text) {
      cleanContentField('text', (workingBlock.content as any).text);
    }

    // Clean URL fields
    if ((workingBlock.content as any)?.url) {
      cleanContentField('url', (workingBlock.content as any).url);
    }
  }, [workingBlock.content, onContentUpdate]);

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

  // Handler for quote text changes with HTML entity processing
  const handleQuoteTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    const { text: processedText, newCursorPosition } = processHtmlEntities(value, cursorPosition);
    
    if (processedText !== value) {
      // HTML entity was processed
      setLocalQuoteText(processedText);
      debouncedUpdateQuoteText(processedText);
      
      // Set cursor position after state update
      setTimeout(() => {
        if (e.target) {
          e.target.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    } else {
      // No entity processing needed, update normally
      setLocalQuoteText(value);
      debouncedUpdateQuoteText(value);
    }
  }, [debouncedUpdateQuoteText]);

  // Handler for quote author changes with HTML entity processing
  const handleQuoteAuthorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    const { text: processedText, newCursorPosition } = processHtmlEntities(value, cursorPosition);
   
    const finalValue = processedText.trim() === '' ? 'Author Name' : processedText;
    
    if (processedText !== value) {
   
      onContentUpdate('author', finalValue);
      

      setTimeout(() => {
        if (quoteAuthorRef.current) {
          quoteAuthorRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    } else {
   
      onContentUpdate('author', finalValue);
    }
  }, [onContentUpdate]);

  const handleQuoteCitationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    const { text: processedText, newCursorPosition } = processHtmlEntities(value, cursorPosition);
    
    if (processedText !== value) {
 
      onContentUpdate('citation', processedText);
      
      setTimeout(() => {
        if (quoteCitationRef.current) {
          quoteCitationRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    } else {
      onContentUpdate('citation', value);
    }
  }, [onContentUpdate]);

  const listItems = (workingBlock.content as any)?.items || [];
  const isListOrdered = (workingBlock.content as any)?.ordered || false;

  const handleTextChange = useCallback((value: string, inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>, cursorPos?: number) => {
    const cursorPosition = cursorPos ?? inputRef.current?.selectionStart ?? 0;
    const { text: processedText, newCursorPosition } = processHtmlEntities(value, cursorPosition);
    
    if (processedText !== value) {

      onContentUpdate('text', processedText);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    } else {

      onContentUpdate('text', value);
    }
  }, [onContentUpdate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    handleTextChange(value, inputRef, cursorPosition);
  }, [handleTextChange]);

  const addListItem = useCallback(() => {
    const newItems = [...listItems, `Item ${listItems.length + 1}`];
    onContentUpdate('items', newItems);
  }, [listItems, onContentUpdate]);

  const removeListItem = useCallback((index: number) => {
    if (listItems.length > 1) {
      const newItems = listItems.filter((_: any, i: number) => i !== index);
  
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

    newItems[index] = value.trim() === '' ? `Item ${index + 1}` : value;
    onContentUpdate('items', newItems);
  }, [listItems, onContentUpdate]);

  
  const handleListItemChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    const { text: processedText, newCursorPosition } = processHtmlEntities(value, cursorPosition);
    
    if (processedText !== value) {

      updateListItem(index, processedText);
      
      setTimeout(() => {
        const input = listItemRefs.current[index];
        if (input) {
          input.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    } else {
      updateListItem(index, value);
    }
  }, [updateListItem]);

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
      const currentText = (workingBlock.content as any)?.text || '';
      const newText = replaceTextWithLink(currentText, selectedText, linkHtml);
      onContentUpdate('text', newText);
    }
    
    resetLinkModal();
  }, [selectedText, linkUrl, linkTarget, workingBlock.content, onContentUpdate, selectedListItemIndex, listItems]);

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
    const currentText = (workingBlock.content as any)?.text || '';
    const textWithoutLinks = removeAllLinksFromText(currentText);
    onContentUpdate('text', textWithoutLinks);
  }, [workingBlock.content, onContentUpdate]);

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
                Full Editor
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={getCleanedContent((workingBlock.content as any)?.text) === 'Start writing your content here...' ? '' : getCleanedContent((workingBlock.content as any)?.text)}
              onChange={(e) => handleInputChange(e, textareaRef)}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Link Colors</label>
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
              value={getCleanedContent((workingBlock.content as any)?.text) === 'Your Heading Here' ? '' : getCleanedContent((workingBlock.content as any)?.text)}
              onChange={(e) => handleInputChange(e, inputRef)}
              onMouseUp={() => processTextSelection(inputRef)}
              placeholder="Your Heading Here"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heading Level</label>
            <select
              value={(workingBlock.content as any)?.level || 2}
              onChange={(e) => {
                const newLevel = parseInt(e.target.value);
                onContentUpdate('level', newLevel);
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
            >
              <option value={1} disabled>Heading 1 (H1)</option>
              <option value={2}>Heading 2 (H2)</option>
              <option value={3}>Heading 3 (H3)</option>
              <option value={4}>Heading 4 (H4)</option>
              <option value={5}>Heading 5 (H5)</option>
              <option value={6}>Heading 6 (H6)</option>
            </select>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Web Address (Optional)</label>
            <input
              type="url"
              value={(block.content as any)?.url || ''}
              onChange={(e) => {
                const value = e.target.value;
                const cursorPosition = e.target.selectionStart || 0;
                const { text: processedText, newCursorPosition } = processHtmlEntities(value, cursorPosition);
                
                if (processedText !== value) {
                  onContentUpdate('url', processedText);
                  setTimeout(() => {
                    if (e.target) {
                      e.target.setSelectionRange(newCursorPosition, newCursorPosition);
                    }
                  }, 0);
                } else {
                  onContentUpdate('url', value);
                }
              }}
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

    ad: () => {
      const adContent = (block.content as any) || {};
      const adType = getAdBlockType(adContent);

      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ad Type</label>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              {(['media', 'link'] as AdBlockType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onContentUpdate('adType', type);
                    if (type === 'link') {
                      if (!block.styles?.textAlign) onStyleUpdate?.('textAlign', 'center');
                      if (!block.styles?.textDecoration) onStyleUpdate?.('textDecoration', 'underline');
                      if (!block.styles?.linkColor && !block.styles?.textColor) {
                        onStyleUpdate?.('linkColor', '#2563eb');
                      }
                      if (!block.styles?.fontSize) onStyleUpdate?.('fontSize', '16px');
                    }
                  }}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    adType === type
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type === 'media' ? 'Media' : 'Link'}
                </button>
              ))}
            </div>
          </div>

          {adType === 'media' ? (
            <>
              <ImageUrlInput
                imageUrl={adContent.url || ''}
                altText={adContent.alt || ''}
                onImageUrlChange={(value: string) => onContentUpdate('url', value)}
                onAltTextChange={(value: string) => onContentUpdate('alt', value)}
                allowVideo
                hideMediaLayoutControls
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Link URL</label>
                <input
                  type="url"
                  value={adContent.link || ''}
                  onChange={(e) => onContentUpdate('link', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">Opens in a new tab when clicked.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption (Optional)</label>
                <input
                  type="text"
                  value={adContent.caption || ''}
                  onChange={(e) => onContentUpdate('caption', e.target.value)}
                  placeholder="Ad caption..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Text</label>
                <input
                  type="text"
                  value={adContent.text || ''}
                  onChange={(e) => onContentUpdate('text', e.target.value)}
                  placeholder="Text your audience will see"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Redirect URL</label>
                <input
                  type="url"
                  value={adContent.link || ''}
                  onChange={(e) => onContentUpdate('link', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">Opens in a new tab when clicked.</p>
              </div>
            </>
          )}
        </div>
      );
    },

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
                <br />• <strong>Part of text:</strong> Select specific words (e.g., just "marketing"), then click "Add Link"
                <br />• <strong>Whole item:</strong> Click "Add Link" without selecting anything to link the entire item
                <br />• Enter your web address and click "Add Link"
              </p>
            </div>
            
            <div className="space-y-2">
              {listItems.map((item: string, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={(el) => { listItemRefs.current[index] = el; }}
                      type="text"
                      value={getCleanedContent(item).startsWith('Item ') && /^Item \d+$/.test(getCleanedContent(item)) ? '' : getCleanedContent(item)}
                      onChange={(e) => handleListItemChange(index, e)}
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
                        : "Select specific text for part of item, or click without selecting to link entire item"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">What You Want to Say</label>
          <textarea
            value={localQuoteText}
            onChange={handleQuoteTextChange}
            placeholder="Your inspiring quote goes here..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none transition-all"
            rows={4}
          />
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Who Said It (Optional)</label>
            <input
              ref={quoteAuthorRef}
              type="text"
              value={getCleanedContent((workingBlock.content as any)?.author) === 'Author Name' ? '' : getCleanedContent((workingBlock.content as any)?.author)}
              onChange={handleQuoteAuthorChange}
              placeholder="Author Name"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Where It's From (Optional)</label>
          <input
            ref={quoteCitationRef}
            type="text"
            value={(block.content as any)?.citation || ''}
            onChange={handleQuoteCitationChange}
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

  const renderer = CONTENT_RENDERERS[workingBlock.type as keyof typeof CONTENT_RENDERERS] || CONTENT_RENDERERS.default;
  
  return renderer();
}, (prevProps, nextProps) => (
    prevProps.block.id === nextProps.block.id &&
    prevProps.block.type === nextProps.block.type &&
    JSON.stringify(prevProps.block.content) === JSON.stringify(nextProps.block.content) &&
    JSON.stringify(prevProps.block.styles) === JSON.stringify(nextProps.block.styles)
  ));

ContentControls.displayName = 'ContentControls';

export default ContentControls;
