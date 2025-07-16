"use client";
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import ImageUrlInput from './ImageUrlInput';

import {
  LayoutBlock,
  BlockType,
  BlogLayout,
  BLOCK_TEMPLATES,
  LAYOUT_PRESETS,
  createBlock,
  duplicateBlock,
  updateBlockContent,
  updateBlockStyles,
  convertLayoutToBlogPayload,
  generateBlockId,
} from '@/services/types/visualLayoutTypes';

interface VisualLayoutBuilderProps {
  onLayoutChange: (layout: BlogLayout) => void;
  onSave: (payload: any) => void;
  initialLayout?: BlogLayout;
  blogData?: any;
}

interface BlockRenderProps {
  block: LayoutBlock;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (blockId: string) => void;
  onEdit: (blockId: string, content: any) => void;
  onStyleChange: (blockId: string, styles: any) => void;
  onDelete: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
}

// Sortable Block Wrapper
const SortableBlock: React.FC<{ 
  block: LayoutBlock; 
  children: React.ReactNode; 
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ block, children, isSelected, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        relative group cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'}
        ${isDragging ? 'z-50' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <div className="w-6 h-6 bg-gray-500 text-white rounded flex items-center justify-center text-xs">
          ⋮⋮
        </div>
      </div>
      
      {/* Block Content */}
      {children}
      
      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none rounded" />
      )}
    </div>
  );
};

// Block Renderer Component
const BlockRenderer: React.FC<BlockRenderProps> = ({
  block,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onStyleChange,
  onDelete,
  onDuplicate,
}) => {
  const renderBlockContent = () => {
    const baseStyles = {
      padding: `${block.styles.padding?.top || 0}px ${block.styles.padding?.right || 0}px ${block.styles.padding?.bottom || 0}px ${block.styles.padding?.left || 0}px`,
      margin: `${block.styles.margin?.top || 0}px ${block.styles.margin?.right || 0}px ${block.styles.margin?.bottom || 0}px ${block.styles.margin?.left || 0}px`,
      backgroundColor: block.styles.backgroundColor,
      color: block.styles.textColor,
      fontSize: block.styles.fontSize,
      fontWeight: block.styles.fontWeight,
      textAlign: block.styles.textAlign,
      borderRadius: `${block.styles.border?.radius || 0}px`,
      border: block.styles.border ? `${block.styles.border.width}px ${block.styles.border.style} ${block.styles.border.color}` : undefined,
      boxShadow: block.styles.shadow ? `${block.styles.shadow.x}px ${block.styles.shadow.y}px ${block.styles.shadow.blur}px ${block.styles.shadow.color}` : undefined,
    };

    switch (block.type) {
      case 'heading':
        const headingLevel = (block.content as any).level || 2;
        const headingProps = {
          style: baseStyles,
          className: "outline-none transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded px-1",
          contentEditable: isEditing,
          suppressContentEditableWarning: true,
          onDoubleClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            onSelect(block.id);
          },
          onBlur: (e: React.FocusEvent<HTMLHeadingElement>) => onEdit(block.id, { text: e.currentTarget.textContent }),
          children: (block.content as any).text || 'Your Heading Here'
        };
        
        switch (headingLevel) {
          case 1: return <h1 {...headingProps} />;
          case 2: return <h2 {...headingProps} />;
          case 3: return <h3 {...headingProps} />;
          case 4: return <h4 {...headingProps} />;
          case 5: return <h5 {...headingProps} />;
          case 6: return <h6 {...headingProps} />;
          default: return <h2 {...headingProps} />;
        }

      case 'paragraph':
        return (
          <p
            style={baseStyles}
            className="outline-none min-h-[2rem] transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded px-1"
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onDoubleClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onSelect(block.id);
            }}
            onBlur={(e: React.FocusEvent<HTMLParagraphElement>) => onEdit(block.id, { text: e.currentTarget.textContent })}
          >
            {(block.content as any).text || 'Start writing your content here...'}
          </p>
        );

      case 'image':
        const imageContent = block.content as any;
        return (
          <div style={baseStyles} className="relative">
            {imageContent.url ? (
              <img
                src={imageContent.url}
                alt={imageContent.alt || 'Image'}
                className="w-full h-auto rounded"
                style={{ aspectRatio: imageContent.aspectRatio }}
              />
            ) : (
              <div 
                className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500 dark:text-gray-400"
              >
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p>Image placeholder</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'quote':
        const quoteContent = block.content as any;
        return (
          <blockquote style={baseStyles} className="relative">
            <div className="text-4xl text-gray-400 absolute -top-2 -left-2">"</div>
            <p
              className="outline-none italic text-lg"
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onBlur={(e: React.FocusEvent<HTMLParagraphElement>) => onEdit(block.id, { text: e.currentTarget.textContent })}
            >
              {quoteContent.text || 'Your inspiring quote goes here...'}
            </p>
            {quoteContent.author && (
              <cite className="block mt-2 text-sm text-gray-600 dark:text-gray-400">
                — {quoteContent.author}
                {quoteContent.source && <span className="text-gray-500">, {quoteContent.source}</span>}
              </cite>
            )}
          </blockquote>
        );

      case 'list':
        const listContent = block.content as any;
        const ListTag = listContent.ordered ? 'ol' : 'ul';
        return (
          <ListTag style={baseStyles} className="space-y-1">
            {(listContent.items || []).map((item: string, index: number) => (
              <li key={index} className="outline-none">
                {item}
              </li>
            ))}
          </ListTag>
        );

      case 'code':
        const codeContent = block.content as any;
        return (
          <pre style={baseStyles} className="overflow-x-auto">
            <code className="language-{codeContent.language || 'javascript'}">
              {codeContent.code || '// Your code here'}
            </code>
          </pre>
        );

      case 'spacer':
        return (
          <div 
            style={{ 
              ...baseStyles, 
              minHeight: `${block.position.height}px`,
              background: 'transparent',
            }}
            className="border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm"
          >
            Spacer ({block.position.height}px)
          </div>
        );

      case 'hero':
        const heroContent = block.content as any;
        return (
          <div 
            style={{
              ...baseStyles,
              backgroundImage: heroContent.backgroundUrl ? `url(${heroContent.backgroundUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              minHeight: '300px',
            }}
            className="flex items-center justify-center text-center"
          >
            {heroContent.overlay && (
              <div 
                className="absolute inset-0"
                style={{
                  backgroundColor: heroContent.overlay.color,
                  opacity: heroContent.overlay.opacity,
                }}
              />
            )}
            <div className="relative z-10">
              <h1 
                style={{
                  fontSize: block.styles.titleFontSize || '2.5rem',
                  fontWeight: block.styles.fontWeight || 'bold',
                  color: block.styles.textColor || '#000000',
                  textAlign: block.styles.textAlign || 'center',
                  marginBottom: '1rem',
                  outline: 'none',
                }}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => onEdit(block.id, { title: e.currentTarget.textContent })}
              >
                {heroContent.title || 'Welcome to Our Blog'}
              </h1>
              <p 
                style={{
                  fontSize: block.styles.subtitleFontSize || '1.25rem',
                  color: block.styles.textColor || '#000000',
                  textAlign: block.styles.textAlign || 'center',
                  marginBottom: '1.5rem',
                }}
              >
                {heroContent.subtitle || 'Add a compelling subtitle'}
              </p>
              {heroContent.ctaButton && heroContent.ctaButton.visible !== false && (
                <a
                  href={heroContent.ctaButton.link || '#'}
                  target={heroContent.ctaButton.link?.startsWith('http') ? '_blank' : undefined}
                  rel={heroContent.ctaButton.link?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-block px-6 py-3 rounded-lg transition-colors hover:opacity-90"
                  style={{
                    backgroundColor: heroContent.ctaButton.backgroundColor || '#3b82f6',
                    color: heroContent.ctaButton.textColor || '#ffffff',
                    width: heroContent.ctaButton.width === 'full' ? '100%' : 
                           heroContent.ctaButton.width === 'fit' ? 'fit-content' : 
                           heroContent.ctaButton.width === 'auto' ? 'auto' : 
                           heroContent.ctaButton.width,
                    textDecoration: 'none',
                    display: 'inline-block',
                    textAlign: 'center',
                  }}
                >
                  {heroContent.ctaButton.text || 'Learn More'}
                </a>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div style={baseStyles} className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <p className="text-gray-600 dark:text-gray-400">
              {block.type} block - Content not implemented
            </p>
          </div>
        );
    }
  };

  return (
    <SortableBlock 
      block={block} 
      isSelected={isSelected}
      onSelect={onSelect}
    >
      <div className="relative">
        {renderBlockContent()}
        
        {/* Block Controls */}
        {isSelected && (
          <div className="absolute -top-8 right-0 flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-lg p-1 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Focus the element for inline editing
                const element = e.currentTarget.parentElement?.parentElement?.querySelector('[contenteditable]') as HTMLElement;
                if (element) {
                  element.focus();
                }
              }}
              className="p-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
              title="Edit Inline"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(block.id);
              }}
              className="p-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
              title="Duplicate"
            >
              ⧉
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(block.id);
              }}
              className="p-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
              title="Delete"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </SortableBlock>
  );
};

// Main Visual Layout Builder Component
const VisualLayoutBuilder: React.FC<VisualLayoutBuilderProps> = ({
  onLayoutChange,
  onSave,
  initialLayout,
  blogData = {},
}) => {
  const [layout, setLayout] = useState<BlogLayout>(
    initialLayout || {
      id: generateBlockId(),
      name: 'New Layout',
      blocks: [],
      settings: {
        maxWidth: 800,
        backgroundColor: '#ffffff',
        padding: { top: 32, right: 32, bottom: 32, left: 32 },
      },
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: '1.0',
      },
    }
  );

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showElements, setShowElements] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [propertyPanelActiveTab, setPropertyPanelActiveTab] = useState<'style' | 'settings'>('style');
  const [isDragOverGlobal, setIsDragOverGlobal] = useState(false);

  const selectedBlock = useMemo(() => 
    layout.blocks.find(block => block.id === selectedBlockId),
    [layout.blocks, selectedBlockId]
  );

  // Auto-show properties panel when block is selected
  useEffect(() => {
    setShowPropertiesPanel(!!selectedBlockId);
    // Enable editing when block is selected
    if (selectedBlockId) {
      setEditingBlockId(selectedBlockId);
    } else {
      setEditingBlockId(null);
    }
  }, [selectedBlockId]);

  const addBlock = useCallback((type: BlockType) => {
    const newBlock = createBlock(type);
    setLayout(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      },
    }));
    setSelectedBlockId(newBlock.id);
  }, []);

  const removeBlock = useCallback((blockId: string) => {
    setLayout(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId),
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      },
    }));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId]);

  const duplicateBlockById = useCallback((blockId: string) => {
    const blockToDuplicate = layout.blocks.find(block => block.id === blockId);
    if (blockToDuplicate) {
      const duplicatedBlock = duplicateBlock(blockToDuplicate);
      setLayout(prev => {
        const blockIndex = prev.blocks.findIndex(block => block.id === blockId);
        const newBlocks = [...prev.blocks];
        newBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
        return {
          ...prev,
          blocks: newBlocks,
          metadata: {
            ...prev.metadata,
            updated: new Date().toISOString(),
          },
        };
      });
      setSelectedBlockId(duplicatedBlock.id);
    }
  }, [layout.blocks]);

  const updateBlock = useCallback((blockId: string, content: any) => {
    setLayout(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId ? updateBlockContent(block, content) : block
      ),
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      },
    }));
  }, []);

  const updateBlockStyle = useCallback((blockId: string, styles: any) => {
    setLayout(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId ? updateBlockStyles(block, styles) : block
      ),
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      },
    }));
  }, []);

  // Global drag and drop handlers for the entire screen
  const handleGlobalDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverGlobal(true);
  }, []);

  const handleGlobalDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide if leaving the main container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOverGlobal(false);
    }
  }, []);

  const handleGlobalDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverGlobal(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0 && selectedBlockId) {
      const selectedBlock = layout.blocks.find(block => block.id === selectedBlockId);
      if (selectedBlock && selectedBlock.type === 'image') {
        const file = imageFiles[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            updateBlock(selectedBlockId, {
              url: event.target.result as string,
              alt: file.name.replace(/\.[^/.]+$/, "")
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }, [selectedBlockId, layout.blocks, updateBlock]);

  const dragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const dragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setLayout(prev => {
        const oldIndex = prev.blocks.findIndex(block => block.id === active.id);
        const newIndex = prev.blocks.findIndex(block => block.id === over.id);
        
        return {
          ...prev,
          blocks: arrayMove(prev.blocks, oldIndex, newIndex),
          metadata: {
            ...prev.metadata,
            updated: new Date().toISOString(),
          },
        };
      });
    }
    
    setActiveId(null);
  }, []);

  const loadPreset = useCallback((presetName: keyof typeof LAYOUT_PRESETS) => {
    const preset = LAYOUT_PRESETS[presetName];
    if (preset) {
      setLayout(prev => ({
        ...prev,
        name: preset.name,
        blocks: preset.blocks.map(blockTemplate => ({
          ...blockTemplate,
          id: generateBlockId(),
          metadata: {
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        })) as LayoutBlock[],
        metadata: {
          ...prev.metadata,
          updated: new Date().toISOString(),
        },
      }));
      setSelectedBlockId(null);
    }
  }, []);

  const saveLayout = useCallback(() => {
    const payload = convertLayoutToBlogPayload(layout, blogData);
    onSave(payload);
    onLayoutChange(layout);
  }, [layout, blogData, onSave, onLayoutChange]);

  // Property Panel Component
  const PropertyPanel: React.FC<{ 
    block: LayoutBlock | undefined; 
    isVisible: boolean; 
    onClose: () => void;
    onUpdate: (blockId: string, content: any) => void;
    onStyleUpdate: (blockId: string, styles: any) => void;
    activeTab: 'style' | 'settings';
    onTabChange: (tab: 'style' | 'settings') => void;
  }> = ({ block, isVisible, onClose, onUpdate, onStyleUpdate, activeTab, onTabChange }) => {
    const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
      typography: true,
      spacing: true,
      size: false,
      position: false,
      backgrounds: true,
      borders: true,
    });

    // Global scroll prevention for number inputs
    useEffect(() => {
      const handleGlobalScroll = (e: WheelEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.property-panel') && (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number')) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.property-panel') && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      };

      document.addEventListener('wheel', handleGlobalScroll, { passive: false });
      document.addEventListener('keydown', handleGlobalKeyDown, { passive: false });

      return () => {
        document.removeEventListener('wheel', handleGlobalScroll);
        document.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }, []);

    if (!block) return null;

    const handleContentChange = (field: string, value: any) => {
      onUpdate(block.id, { [field]: value });
    };

    const updateBlockStyle = (field: string, value: any) => {
      onStyleUpdate(block.id, { [field]: value });
    };

    const toggleSection = (section: string) => {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };

    const renderContentControls = () => {
      switch (block.type) {
        case 'heading':
          const headingContent = block.content as any;
          const [localHeadingText, setLocalHeadingText] = useState(headingContent.text || '');
          
          // Update local state when block content changes from outside
          useEffect(() => {
            setLocalHeadingText(headingContent.text || '');
          }, [headingContent.text]);

    
          useEffect(() => {
            const timer = setTimeout(() => {
              if (localHeadingText !== headingContent.text) {
                handleContentChange('text', localHeadingText);
              }
            }, 300);

            return () => clearTimeout(timer);
          }, [localHeadingText]);

          const updateHeadingText = (value: string) => {
            setLocalHeadingText(value);
          };

          return (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Text
                </label>
                <textarea
                  value={localHeadingText}
                  onChange={(e) => updateHeadingText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Enter heading text..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Tag
                </label>
                <select
                  value={headingContent.level || 2}
                  onChange={(e) => handleContentChange('level', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
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

        case 'paragraph':
          const paragraphContent = block.content as any;
          const [localParagraphText, setLocalParagraphText] = useState(paragraphContent.text || '');
          
          // Update local state when block content changes from outside
          useEffect(() => {
            setLocalParagraphText(paragraphContent.text || '');
          }, [paragraphContent.text]);

          // Debounced update function
          useEffect(() => {
            const timer = setTimeout(() => {
              if (localParagraphText !== paragraphContent.text) {
                handleContentChange('text', localParagraphText);
              }
            }, 300);

            return () => clearTimeout(timer);
          }, [localParagraphText]);

          const updateParagraphText = (value: string) => {
            setLocalParagraphText(value);
          };

          return (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Text
              </label>
              <textarea
                value={localParagraphText}
                onChange={(e) => updateParagraphText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Enter paragraph text..."
              />
            </div>
          );

        case 'image':
          const imageContent = block.content as any;

          return (
            <ImageUrlInput
              imageUrl={imageContent.url || ''}
              altText={imageContent.alt || ''}
              onImageUrlChange={(url) => handleContentChange('url', url)}
              onAltTextChange={(alt) => handleContentChange('alt', alt)}
            />
          );

        case 'quote':
          const quoteContent = block.content as any;
          const [localQuoteText, setLocalQuoteText] = useState(quoteContent.text || '');
          const [localAuthor, setLocalAuthor] = useState(quoteContent.author || '');
          const [localSource, setLocalSource] = useState(quoteContent.source || '');
          
          // Update local state when block content changes from outside
          useEffect(() => {
            setLocalQuoteText(quoteContent.text || '');
            setLocalAuthor(quoteContent.author || '');
            setLocalSource(quoteContent.source || '');
          }, [quoteContent.text, quoteContent.author, quoteContent.source]);

          // Debounced update functions
          useEffect(() => {
            const timer = setTimeout(() => {
              if (localQuoteText !== quoteContent.text) {
                handleContentChange('text', localQuoteText);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localQuoteText]);

          useEffect(() => {
            const timer = setTimeout(() => {
              if (localAuthor !== quoteContent.author) {
                handleContentChange('author', localAuthor);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localAuthor]);

          useEffect(() => {
            const timer = setTimeout(() => {
              if (localSource !== quoteContent.source) {
                handleContentChange('source', localSource);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localSource]);

          const updateQuoteText = (value: string) => {
            setLocalQuoteText(value);
          };

          const updateAuthor = (value: string) => {
            setLocalAuthor(value);
          };

          const updateSource = (value: string) => {
            setLocalSource(value);
          };

          return (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Quote Text
                </label>
                <textarea
                  value={localQuoteText}
                  onChange={(e) => updateQuoteText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Enter your quote..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Author
                </label>
                <input
                  type="text"
                  value={localAuthor}
                  onChange={(e) => updateAuthor(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Author name..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Source
                </label>
                <input
                  type="text"
                  value={localSource}
                  onChange={(e) => updateSource(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Source or publication..."
                />
              </div>
            </div>
          );

        case 'list':
          const listContent = block.content as any;
          const [localItems, setLocalItems] = useState(listContent.items || ['']);
          
          useEffect(() => {
            setLocalItems(listContent.items || ['']);
          }, [listContent.items]);

          const addListItem = () => {
            const newItems = [...localItems, ''];
            setLocalItems(newItems);
            handleContentChange('items', newItems);
          };

          const removeListItem = (index: number) => {
            if (localItems.length > 1) {
              const newItems = localItems.filter((_: string, i: number) => i !== index);
              setLocalItems(newItems);
              handleContentChange('items', newItems);
            }
          };

          const updateListItem = (index: number, value: string) => {
            const newItems = [...localItems];
            newItems[index] = value;
            setLocalItems(newItems);
            
            const timer = setTimeout(() => {
              handleContentChange('items', newItems);
            }, 300);

            return () => clearTimeout(timer);
          };

          const toggleListType = (ordered: boolean) => {
            handleContentChange('ordered', ordered);
          };

          return (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  List Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleListType(false)}
                    className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                      !listContent.ordered
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Unordered
                  </button>
                  <button
                    onClick={() => toggleListType(true)}
                    className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                      listContent.ordered
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Ordered
                  </button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
                    List Items
                  </label>
                  <button
                    onClick={addListItem}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Add Item
                  </button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {localItems.map((item: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateListItem(index, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        placeholder={`Item ${index + 1}`}
                      />
                      <button
                        onClick={() => removeListItem(index)}
                        disabled={localItems.length <= 1}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        case 'spacer':
          const spacerContent = block.content as any;
          const [localHeight, setLocalHeight] = useState(spacerContent.height || 40);
          
          useEffect(() => {
            setLocalHeight(spacerContent.height || 40);
          }, [spacerContent.height]);

          const updateSpacerHeight = (value: number) => {
            setLocalHeight(value);
            handleContentChange('height', value);
            
            const newPosition = { ...block.position, height: value };
            onStyleUpdate(block.id, { position: newPosition });
          };

          return (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Height
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={localHeight}
                    onChange={(e) => updateSpacerHeight(parseInt(e.target.value) || 40)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-l text-white focus:border-blue-500 focus:outline-none"
                    min="10"
                    max="500"
                    step="10"
                  />
                  <span className="px-2 py-2 text-xs bg-gray-600 border border-l-0 border-gray-600 rounded-r text-gray-300">px</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Controls the vertical spacing this element adds
                </p>
              </div>
            </div>
          );

        case 'code':
          const codeContent = block.content as any;
          const [localCode, setLocalCode] = useState(codeContent.code || '');
          const [localLanguage, setLocalLanguage] = useState(codeContent.language || 'javascript');
          
          useEffect(() => {
            setLocalCode(codeContent.code || '');
            setLocalLanguage(codeContent.language || 'javascript');
          }, [codeContent.code, codeContent.language]);

          useEffect(() => {
            const timer = setTimeout(() => {
              if (localCode !== codeContent.code) {
                handleContentChange('code', localCode);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localCode]);

          const updateCode = (value: string) => {
            setLocalCode(value);
          };

          const updateLanguage = (value: string) => {
            setLocalLanguage(value);
            handleContentChange('language', value);
          };

          const languageOptions = [
            { value: 'javascript', label: 'JavaScript' },
            { value: 'typescript', label: 'TypeScript' },
            { value: 'python', label: 'Python' },
            { value: 'html', label: 'HTML' },
            { value: 'css', label: 'CSS' },
            { value: 'json', label: 'JSON' },
            { value: 'sql', label: 'SQL' },
            { value: 'bash', label: 'Bash' },
            { value: 'php', label: 'PHP' },
            { value: 'java', label: 'Java' },
            { value: 'csharp', label: 'C#' },
            { value: 'cpp', label: 'C++' },
            { value: 'go', label: 'Go' },
            { value: 'rust', label: 'Rust' },
            { value: 'swift', label: 'Swift' },
            { value: 'kotlin', label: 'Kotlin' },
            { value: 'ruby', label: 'Ruby' },
            { value: 'yaml', label: 'YAML' },
            { value: 'xml', label: 'XML' },
            { value: 'markdown', label: 'Markdown' },
          ];

          return (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Language
                </label>
                <select
                  value={localLanguage}
                  onChange={(e) => updateLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                >
                  {languageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Code
                </label>
                <textarea
                  value={localCode}
                  onChange={(e) => updateCode(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none font-mono"
                  placeholder="// Enter your code here..."
                />
              </div>
            </div>
          );

        case 'hero':
          const heroContent = block.content as any;
          const [localTitle, setLocalTitle] = useState(heroContent.title || '');
          const [localSubtitle, setLocalSubtitle] = useState(heroContent.subtitle || '');
          const [localBackgroundUrl, setLocalBackgroundUrl] = useState(heroContent.backgroundUrl || '');
          const [localButtonText, setLocalButtonText] = useState(heroContent.ctaButton?.text || '');
          const [localButtonLink, setLocalButtonLink] = useState(heroContent.ctaButton?.link || '');
          const [localButtonVisible, setLocalButtonVisible] = useState(heroContent.ctaButton?.visible !== false);
          const [localButtonBgColor, setLocalButtonBgColor] = useState(heroContent.ctaButton?.backgroundColor || '#3b82f6');
          const [localButtonTextColor, setLocalButtonTextColor] = useState(heroContent.ctaButton?.textColor || '#ffffff');
          const [localButtonWidth, setLocalButtonWidth] = useState(heroContent.ctaButton?.width || 'auto');
          const [isCustomWidth, setIsCustomWidth] = useState(false);
          
          useEffect(() => {
            setLocalTitle(heroContent.title || '');
            setLocalSubtitle(heroContent.subtitle || '');
            setLocalBackgroundUrl(heroContent.backgroundUrl || '');
            setLocalButtonText(heroContent.ctaButton?.text || '');
            setLocalButtonLink(heroContent.ctaButton?.link || '');
            setLocalButtonVisible(heroContent.ctaButton?.visible !== false);
            setLocalButtonBgColor(heroContent.ctaButton?.backgroundColor || '#3b82f6');
            setLocalButtonTextColor(heroContent.ctaButton?.textColor || '#ffffff');
            const width = heroContent.ctaButton?.width || 'auto';
            setLocalButtonWidth(width);
            setIsCustomWidth(!['auto', 'full', 'fit', '150px', '200px', '250px', '300px'].includes(width));
          }, [heroContent]);

          useEffect(() => {
            const timer = setTimeout(() => {
              if (localTitle !== heroContent.title) {
                updateContentChange('title', localTitle);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localTitle]);

          useEffect(() => {
            const timer = setTimeout(() => {
              if (localSubtitle !== heroContent.subtitle) {
                updateContentChange('subtitle', localSubtitle);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localSubtitle]);

          useEffect(() => {
            const timer = setTimeout(() => {
              if (localBackgroundUrl !== heroContent.backgroundUrl) {
                updateContentChange('backgroundUrl', localBackgroundUrl);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localBackgroundUrl]);

          useEffect(() => {
            const timer = setTimeout(() => {
              if (localButtonText !== heroContent.ctaButton?.text) {
                updateButtonProperty('text', localButtonText);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localButtonText]);

          useEffect(() => {
            const timer = setTimeout(() => {
              if (localButtonLink !== heroContent.ctaButton?.link) {
                updateButtonProperty('link', localButtonLink);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localButtonLink]);

          const updateContentChange = (key: string, value: any) => {
            handleContentChange(key, value);
          };

          const updateButtonProperty = (property: string, value: any) => {
            const currentButton = heroContent.ctaButton || {};
            const updatedButton = { ...currentButton, [property]: value };
            updateContentChange('ctaButton', updatedButton);
          };

          const updateTitle = (value: string) => {
            setLocalTitle(value);
          };

          const updateSubtitle = (value: string) => {
            setLocalSubtitle(value);
          };

          const updateBackgroundUrl = (value: string) => {
            setLocalBackgroundUrl(value);
          };

          const updateButtonText = (value: string) => {
            setLocalButtonText(value);
          };

          const updateButtonLink = (value: string) => {
            setLocalButtonLink(value);
          };

          const toggleButtonVisibility = () => {
            const newVisible = !localButtonVisible;
            setLocalButtonVisible(newVisible);
            updateButtonProperty('visible', newVisible);
          };

          const updateButtonBackgroundColor = (value: string) => {
            setLocalButtonBgColor(value);
            updateButtonProperty('backgroundColor', value);
          };

          const updateButtonTextColor = (value: string) => {
            setLocalButtonTextColor(value);
            updateButtonProperty('textColor', value);
          };

          const updateButtonWidth = (value: string, forceCustom?: boolean) => {
            setLocalButtonWidth(value);
            if (forceCustom !== undefined) {
              setIsCustomWidth(forceCustom);
            }
            updateButtonProperty('width', value);
          };

          return (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Title
                </label>
                <textarea
                  value={localTitle}
                  onChange={(e) => updateTitle(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-y"
                  placeholder="Enter hero title..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Subtitle
                </label>
                <textarea
                  value={localSubtitle}
                  onChange={(e) => updateSubtitle(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-y"
                  placeholder="Enter hero subtitle..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Background Image URL
                </label>
                <input
                  type="text"
                  value={localBackgroundUrl}
                  onChange={(e) => updateBackgroundUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter image URL..."
                />
              </div>
              
              <div className="border-t border-gray-600 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
                    CTA Button
                  </label>
                  <button
                    onClick={toggleButtonVisibility}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      localButtonVisible
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {localButtonVisible ? 'Visible' : 'Hidden'}
                  </button>
                </div>
                
                {localButtonVisible && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={localButtonText}
                        onChange={(e) => updateButtonText(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        placeholder="Button text..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Button Link
                      </label>
                      <input
                        type="url"
                        value={localButtonLink}
                        onChange={(e) => updateButtonLink(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        placeholder="https://example.com"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Background Color
                        </label>
                        <div className="flex">
                          <input
                            type="color"
                            value={localButtonBgColor}
                            onChange={(e) => updateButtonBackgroundColor(e.target.value)}
                            className="w-10 h-[34px] bg-gray-700 border border-gray-600 rounded-l cursor-pointer"
                          />
                          <input
                            type="text"
                            value={localButtonBgColor}
                            onChange={(e) => updateButtonBackgroundColor(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-l-0 border-gray-600 rounded-r text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Text Color
                        </label>
                        <div className="flex">
                          <input
                            type="color"
                            value={localButtonTextColor}
                            onChange={(e) => updateButtonTextColor(e.target.value)}
                            className="w-10 h-[34px] bg-gray-700 border border-gray-600 rounded-l cursor-pointer"
                          />
                          <input
                            type="text"
                            value={localButtonTextColor}
                            onChange={(e) => updateButtonTextColor(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-l-0 border-gray-600 rounded-r text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Button Width
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={isCustomWidth ? 'custom' : localButtonWidth}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              setIsCustomWidth(true);
                              if (['auto', 'full', 'fit', '150px', '200px', '250px', '300px'].includes(localButtonWidth)) {
                                updateButtonWidth('175px');
                              }
                            } else {
                              setIsCustomWidth(false);
                              updateButtonWidth(e.target.value);
                            }
                          }}
                          className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="auto">Auto</option>
                          <option value="full">Full Width</option>
                          <option value="fit">Fit Content</option>
                          <option value="150px">150px</option>
                          <option value="200px">200px</option>
                          <option value="250px">250px</option>
                          <option value="300px">300px</option>
                          <option value="custom">Custom</option>
                        </select>
                        {isCustomWidth && (
                          <div className="flex">
                            <input
                              type="text"
                              value={localButtonWidth}
                              onChange={(e) => updateButtonWidth(e.target.value, true)}
                              className="w-16 px-2 py-2 text-sm bg-gray-700 border border-gray-600 rounded-l text-white focus:border-blue-500 focus:outline-none"
                              placeholder="175px"
                            />
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => {
                                  const currentValue = parseInt(localButtonWidth) || 0;
                                  updateButtonWidth(`${currentValue + 5}px`, true);
                                }}
                                className="px-1 py-0.5 text-xs bg-gray-600 border border-l-0 border-gray-600 rounded-tr text-gray-300 hover:bg-gray-500 hover:text-white transition-colors"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentValue = parseInt(localButtonWidth) || 0;
                                  const newValue = Math.max(10, currentValue - 5);
                                  updateButtonWidth(`${newValue}px`, true);
                                }}
                                className="px-1 py-0.5 text-xs bg-gray-600 border border-l-0 border-t-0 border-gray-600 rounded-br text-gray-300 hover:bg-gray-500 hover:text-white transition-colors"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );

        default:
          return (
            <div className="text-gray-500 text-sm">
              No content controls for {block.type} block
            </div>
          );
      }
    };

    const renderStyleControls = () => (
      <div 
        className="space-y-1 p-4 pb-8 overflow-x-hidden"
        onWheel={(e) => {
          e.stopPropagation();
          // Allow scrolling within the panel but prevent bubbling
          const element = e.currentTarget;
          const { scrollTop, scrollHeight, clientHeight } = element.parentElement!;
          
          if (e.deltaY < 0 && scrollTop === 0) {
            e.preventDefault();
          } else if (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight) {
            e.preventDefault();
          }
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Typography Section */}
        <div>
          <button
            onClick={() => toggleSection('typography')}
            className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-white">Typography</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.typography ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.typography && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Font</label>
                <select className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none">
                  <option>Arial</option>
                  <option>Helvetica</option>
                  <option>Georgia</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Weight</label>
                  <select
                    value={block.styles.fontWeight || 'normal'}
                    onChange={(e) => updateBlockStyle('fontWeight', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="normal">400 - Normal</option>
                    <option value="bold">700 - Bold</option>
                    <option value="lighter">300 - Light</option>
                    <option value="bolder">900 - Black</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Size</label>
                  <div className="flex">
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded-l">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = parseInt(block.styles.fontSize?.replace('px', '') || '16');
                          const newValue = Math.max(8, currentValue - 1);
                          updateBlockStyle('fontSize', `${newValue}px`);
                        }}
                        className="px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        value={parseInt(block.styles.fontSize?.replace('px', '') || '16')}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 16;
                          updateBlockStyle('fontSize', `${Math.max(8, Math.min(72, value))}px`);
                        }}
                        className="w-16 px-2 py-2 text-sm bg-transparent text-white text-center focus:outline-none"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = parseInt(block.styles.fontSize?.replace('px', '') || '16');
                          const newValue = Math.min(72, currentValue + 1);
                          updateBlockStyle('fontSize', `${newValue}px`);
                        }}
                        className="px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <span className="px-2 py-2 text-xs bg-gray-600 border border-l-0 border-gray-600 rounded-r text-gray-300">px</span>
                  </div>
                </div>
              </div>
              {block.type === 'hero' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Title Size</label>
                    <div className="flex">
                      <div className="flex items-center bg-gray-700 border border-gray-600 rounded-l">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentValue = parseInt(block.styles.titleFontSize?.replace('px', '') || '32');
                            const newValue = Math.max(12, currentValue - 1);
                            updateBlockStyle('titleFontSize', `${newValue}px`);
                          }}
                          className="px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={parseInt(block.styles.titleFontSize?.replace('px', '') || '32')}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 32;
                            updateBlockStyle('titleFontSize', `${Math.max(12, Math.min(96, value))}px`);
                          }}
                          className="w-16 px-2 py-2 text-sm bg-transparent text-white text-center focus:outline-none"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentValue = parseInt(block.styles.titleFontSize?.replace('px', '') || '32');
                            const newValue = Math.min(96, currentValue + 1);
                            updateBlockStyle('titleFontSize', `${newValue}px`);
                          }}
                          className="px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <span className="px-2 py-2 text-xs bg-gray-600 border border-l-0 border-gray-600 rounded-r text-gray-300">px</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Subtitle Size</label>
                    <div className="flex">
                      <div className="flex items-center bg-gray-700 border border-gray-600 rounded-l">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentValue = parseInt(block.styles.subtitleFontSize?.replace('px', '') || '18');
                            const newValue = Math.max(10, currentValue - 1);
                            updateBlockStyle('subtitleFontSize', `${newValue}px`);
                          }}
                          className="px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={parseInt(block.styles.subtitleFontSize?.replace('px', '') || '18')}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 18;
                            updateBlockStyle('subtitleFontSize', `${Math.max(10, Math.min(48, value))}px`);
                          }}
                          className="w-16 px-2 py-2 text-sm bg-transparent text-white text-center focus:outline-none"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentValue = parseInt(block.styles.subtitleFontSize?.replace('px', '') || '18');
                            const newValue = Math.min(48, currentValue + 1);
                            updateBlockStyle('subtitleFontSize', `${newValue}px`);
                          }}
                          className="px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <span className="px-2 py-2 text-xs bg-gray-600 border border-l-0 border-gray-600 rounded-r text-gray-300">px</span>
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={block.styles.textColor || '#000000'}
                    onChange={(e) => updateBlockStyle('textColor', e.target.value)}
                    className="w-8 h-8 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    value={block.styles.textColor || '#000000'}
                    onChange={(e) => updateBlockStyle('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Align</label>
                <div className="flex space-x-1">
                  {['left', 'center', 'right', 'justify'].map((align) => (
                    <button
                      key={align}
                      onClick={() => updateBlockStyle('textAlign', align)}
                      className={`flex-1 p-2 text-xs rounded transition-colors ${
                        block.styles.textAlign === align || (!block.styles.textAlign && align === 'left')
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex justify-center">
                        {align === 'left' && '⬅'}
                        {align === 'center' && '⬌'}
                        {align === 'right' && '➡'}
                        {align === 'justify' && '≡'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spacing Section */}
        <div>
          <button
            onClick={() => toggleSection('spacing')}
            className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-white">Spacing</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.spacing ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.spacing && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Margin</label>
                <div className="relative">
                  <div className="grid grid-cols-3 gap-1">
                    <div></div>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.margin?.top || 0;
                          const newValue = Math.max(0, currentValue - 1);
                          updateBlockStyle('margin', { 
                            ...block.styles.margin, 
                            top: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        placeholder="0"
                        value={block.styles.margin?.top || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateBlockStyle('margin', { 
                            ...block.styles.margin, 
                            top: Math.max(0, value)
                          });
                        }}
                        className="w-8 px-1 py-1 text-xs bg-transparent text-white text-center focus:outline-none"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.margin?.top || 0;
                          const newValue = currentValue + 1;
                          updateBlockStyle('margin', { 
                            ...block.styles.margin, 
                            top: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div></div>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.margin?.left || 0;
                          const newValue = Math.max(0, currentValue - 1);
                          updateBlockStyle('margin', { 
                            ...block.styles.margin, 
                            left: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        placeholder="0"
                        value={block.styles.margin?.left || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateBlockStyle('margin', { 
                            ...block.styles.margin, 
                            left: Math.max(0, value)
                          });
                        }}
                        className="w-8 px-1 py-1 text-xs bg-transparent text-white text-center focus:outline-none"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.margin?.left || 0;
                          const newValue = currentValue + 1;
                          updateBlockStyle('margin', { 
                            ...block.styles.margin, 
                            left: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div className="bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-300">M</span>
                    </div>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.margin?.right || 0;
                          const newValue = Math.max(0, currentValue - 1);
                          updateBlockStyle('margin', { 
                            ...block.styles.margin, 
                            right: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        placeholder="0"
                        value={block.styles.margin?.right || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateBlockStyle('margin', { 
                            ...block.styles.margin, 
                            right: Math.max(0, value)
                          });
                        }}
                        className="w-8 px-1 py-1 text-xs bg-transparent text-white text-center focus:outline-none"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.margin?.right || 0;
                          const newValue = currentValue + 1;
                          updateBlockStyle('margin', { 
                            ...block.styles.margin, 
                            right: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div></div>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.margin?.bottom || 0;
                          const newValue = Math.max(0, currentValue - 1);
                          updateBlockStyle('margin', { 
                            ...block.styles.margin, 
                            bottom: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        placeholder="0"
                        value={block.styles.margin?.bottom || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateBlockStyle('margin', { 
                            ...block.styles.margin, 
                            bottom: Math.max(0, value)
                          });
                        }}
                        className="w-8 px-1 py-1 text-xs bg-transparent text-white text-center focus:outline-none"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.margin?.bottom || 0;
                          const newValue = currentValue + 1;
                          updateBlockStyle('margin', { 
                            ...block.styles.margin, 
                            bottom: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div></div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Padding</label>
                <div className="relative">
                  <div className="grid grid-cols-3 gap-1">
                    <div></div>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.padding?.top || 0;
                          const newValue = Math.max(0, currentValue - 1);
                          updateBlockStyle('padding', { 
                            ...block.styles.padding, 
                            top: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        placeholder="0"
                        value={block.styles.padding?.top || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateBlockStyle('padding', { 
                            ...block.styles.padding, 
                            top: Math.max(0, value)
                          });
                        }}
                        className="w-8 px-1 py-1 text-xs bg-transparent text-white text-center focus:outline-none"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.padding?.top || 0;
                          const newValue = currentValue + 1;
                          updateBlockStyle('padding', { 
                            ...block.styles.padding, 
                            top: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div></div>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.padding?.left || 0;
                          const newValue = Math.max(0, currentValue - 1);
                          updateBlockStyle('padding', { 
                            ...block.styles.padding, 
                            left: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        placeholder="0"
                        value={block.styles.padding?.left || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateBlockStyle('padding', { 
                            ...block.styles.padding, 
                            left: Math.max(0, value)
                          });
                        }}
                        className="w-8 px-1 py-1 text-xs bg-transparent text-white text-center focus:outline-none"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.padding?.left || 0;
                          const newValue = currentValue + 1;
                          updateBlockStyle('padding', { 
                            ...block.styles.padding, 
                            left: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div className="bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-xs text-white">P</span>
                    </div>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.padding?.right || 0;
                          const newValue = Math.max(0, currentValue - 1);
                          updateBlockStyle('padding', { 
                            ...block.styles.padding, 
                            right: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        placeholder="0"
                        value={block.styles.padding?.right || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateBlockStyle('padding', { 
                            ...block.styles.padding, 
                            right: Math.max(0, value)
                          });
                        }}
                        className="w-8 px-1 py-1 text-xs bg-transparent text-white text-center focus:outline-none"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.padding?.right || 0;
                          const newValue = currentValue + 1;
                          updateBlockStyle('padding', { 
                            ...block.styles.padding, 
                            right: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div></div>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.padding?.bottom || 0;
                          const newValue = Math.max(0, currentValue - 1);
                          updateBlockStyle('padding', { 
                            ...block.styles.padding, 
                            bottom: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        placeholder="0"
                        value={block.styles.padding?.bottom || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateBlockStyle('padding', { 
                            ...block.styles.padding, 
                            bottom: Math.max(0, value)
                          });
                        }}
                        className="w-8 px-1 py-1 text-xs bg-transparent text-white text-center focus:outline-none"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = block.styles.padding?.bottom || 0;
                          const newValue = currentValue + 1;
                          updateBlockStyle('padding', { 
                            ...block.styles.padding, 
                            bottom: newValue 
                          });
                        }}
                        className="px-1 py-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Backgrounds Section */}
        <div>
          <button
            onClick={() => toggleSection('backgrounds')}
            className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-white">Backgrounds</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.backgrounds ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.backgrounds && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Color</label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded border border-gray-600 checkerboard-bg"
                    style={{ backgroundColor: block.styles.backgroundColor || 'transparent' }}
                  ></div>
                  <input
                    type="text"
                    value={block.styles.backgroundColor || 'transparent'}
                    onChange={(e) => updateBlockStyle('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Borders Section */}
        <div>
          <button
            onClick={() => toggleSection('borders')}
            className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-white">Borders</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.borders ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.borders && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Width</label>
                <div className="flex">
                  <div className="flex items-center bg-gray-700 border border-gray-600 rounded-l">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const currentValue = block.styles.border?.width || 0;
                        const newValue = Math.max(0, currentValue - 1);
                        updateBlockStyle('border', { 
                          ...block.styles.border, 
                          width: newValue 
                        });
                      }}
                      className="px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      value={block.styles.border?.width || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateBlockStyle('border', { 
                          ...block.styles.border, 
                          width: Math.max(0, value)
                        });
                      }}
                      className="w-16 px-2 py-2 text-sm bg-transparent text-white text-center focus:outline-none"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const currentValue = block.styles.border?.width || 0;
                        const newValue = currentValue + 1;
                        updateBlockStyle('border', { 
                          ...block.styles.border, 
                          width: newValue 
                        });
                      }}
                      className="px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="px-2 py-2 text-xs bg-gray-600 border border-l-0 border-gray-600 rounded-r text-gray-300">px</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Style</label>
                <select
                  value={block.styles.border?.style || 'solid'}
                  onChange={(e) => updateBlockStyle('border', { 
                    ...block.styles.border, 
                    style: e.target.value 
                  })}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={block.styles.border?.color || '#000000'}
                    onChange={(e) => updateBlockStyle('border', { 
                      ...block.styles.border, 
                      color: e.target.value 
                    })}
                    className="w-8 h-8 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    value={block.styles.border?.color || '#000000'}
                    onChange={(e) => updateBlockStyle('border', { 
                      ...block.styles.border, 
                      color: e.target.value 
                    })}
                    className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Radius</label>
                <div className="flex">
                  <div className="flex items-center bg-gray-700 border border-gray-600 rounded-l">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const currentValue = block.styles.border?.radius || 0;
                        const newValue = Math.max(0, currentValue - 1);
                        updateBlockStyle('border', { 
                          ...block.styles.border, 
                          radius: newValue 
                        });
                      }}
                      className="px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      value={block.styles.border?.radius || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateBlockStyle('border', { 
                          ...block.styles.border, 
                          radius: Math.max(0, value)
                        });
                      }}
                      className="w-16 px-2 py-2 text-sm bg-transparent text-white text-center focus:outline-none"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const currentValue = block.styles.border?.radius || 0;
                        const newValue = currentValue + 1;
                        updateBlockStyle('border', { 
                          ...block.styles.border, 
                          radius: newValue 
                        });
                      }}
                      className="px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="px-2 py-2 text-xs bg-gray-600 border border-l-0 border-gray-600 rounded-r text-gray-300">px</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <>
        {/* Sliding Panel */}
        <div className={`
          property-panel fixed top-0 right-0 h-full w-80 bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-700 flex flex-col overflow-x-hidden
          ${isVisible ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <style jsx>{`
            .property-panel input[type="number"]:focus,
            .property-panel input[type="number"]:active {
              position: relative;
              z-index: 9999;
            }
            
            .property-panel input[type="number"]:focus ~ *,
            .property-panel input[type="number"]:active ~ * {
              pointer-events: none;
            }
            
            .property-panel:has(input[type="number"]:focus) {
              overflow: hidden;
            }
            
            .property-panel button {
              touch-action: manipulation;
            }
          `}</style>
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Properties
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => onTabChange('style')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'style'
                  ? 'text-white border-b-2 border-blue-500 bg-gray-700'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Style
            </button>
            <button
              onClick={() => onTabChange('settings')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-white border-b-2 border-blue-500 bg-gray-700'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Panel Content */}
          <div 
            className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
            onWheel={(e) => {
              // Only prevent default if the wheel event is on a range input or number input
              const target = e.target as HTMLInputElement;
              if (target.type === 'range' || target.type === 'number' || target.closest('input[type="range"]') || target.closest('input[type="number"]')) {
                e.preventDefault();
              }
              e.stopPropagation();
            }}
            onScroll={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: 'contain' }}
          >
            {activeTab === 'style' && renderStyleControls()}
            {activeTab === 'settings' && (
              <div className="p-4">
                {renderContentControls()}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div 
      className="flex h-screen bg-gray-50 dark:bg-gray-900 relative"
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
    >
      {/* Removed global drag overlay for image drop. Image upload is now only in the right sidebar. */}
      
      {/* Custom styles for Webflow-like appearance */}
      <style jsx>{`
        .checkerboard-bg {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
        }
        
        /* Property panel scroll isolation */
        .property-panel {
          overscroll-behavior: contain;
          isolation: isolate;
        }
        
        .property-panel input[type="range"] {
          pointer-events: auto;
        }
        
        .property-panel input[type="range"]::-webkit-slider-thumb {
          pointer-events: auto;
        }
        
        .property-panel input[type="number"] {
          -webkit-appearance: textfield;
        }
        
        .property-panel input[type="number"]::-webkit-outer-spin-button,
        .property-panel input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
      
      {/* Left Sidebar - Block Library */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Elements Toggle */}
          <div>
            <button
              onClick={() => setShowElements(!showElements)}
              className="flex items-center justify-between w-full p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Elements</h3>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  showElements ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showElements && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {Object.entries(BLOCK_TEMPLATES).map(([type, template]) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type as BlockType)}
                    className="p-3 text-xs bg-gray-50 dark:bg-gray-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center capitalize"
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${showPropertiesPanel ? 'mr-80' : ''}`}>
        <div className="p-8">
          <div
            className="mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
            style={{
              maxWidth: `${layout.settings.maxWidth}px`,
              backgroundColor: layout.settings.backgroundColor,
            }}
          >
            <div
              style={{
                padding: `${layout.settings.padding.top}px ${layout.settings.padding.right}px ${layout.settings.padding.bottom}px ${layout.settings.padding.left}px`,
              }}
              onClick={() => setSelectedBlockId(null)}
            >
              {layout.blocks.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">Start Building Your Layout</h3>
                  <p>Add elements from the sidebar or choose a preset to get started.</p>
                </div>
              ) : (
                <DndContext
                  collisionDetection={closestCenter}
                  onDragStart={dragStart}
                  onDragEnd={dragEnd}
                >
                  <SortableContext
                    items={layout.blocks.map(block => block.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {layout.blocks.map((block) => (
                        <BlockRenderer
                          key={block.id}
                          block={block}
                          isSelected={selectedBlockId === block.id}
                          isEditing={editingBlockId === block.id}
                          onSelect={setSelectedBlockId}
                          onEdit={updateBlock}
                          onStyleChange={updateBlockStyle}
                          onDelete={removeBlock}
                          onDuplicate={duplicateBlockById}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  <DragOverlay>
                    {activeId ? (
                      <div className="opacity-90 transform rotate-3">
                        <div className="p-4 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded shadow-lg">
                          Block being moved...
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property Panel */}
      <PropertyPanel
        block={selectedBlock}
        isVisible={showPropertiesPanel}
        onClose={() => {
          setSelectedBlockId(null);
          setShowPropertiesPanel(false);
        }}
        onUpdate={updateBlock}
        onStyleUpdate={updateBlockStyle}
        activeTab={propertyPanelActiveTab}
        onTabChange={setPropertyPanelActiveTab}
      />
    </div>
  );
};

export default VisualLayoutBuilder;
