"use client";
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import ImageUploadWithResize from '@/components/ui/ImageUploadWithResize';
import { ProcessedImage } from '@/services/utils/imageResizer';

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
  onImageUpload: (blockId: string) => void;
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
  onImageUpload,
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
                  fontSize: block.styles.fontSize || '2.5rem',
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
                  fontSize: '1.25rem',
                  color: block.styles.textColor || '#000000',
                  textAlign: block.styles.textAlign || 'center',
                  marginBottom: '1.5rem',
                }}
              >
                {heroContent.subtitle || 'Add a compelling subtitle'}
              </p>
              {heroContent.ctaButton && (
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  {heroContent.ctaButton.text}
                </button>
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
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [currentImageBlockId, setCurrentImageBlockId] = useState<string | null>(null);
  const [showElements, setShowElements] = useState(true); // Add toggle state for elements
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false); // Property panel visibility
  const [propertyPanelActiveTab, setPropertyPanelActiveTab] = useState<'style' | 'settings'>('style'); // Property panel active tab
  const [isDragOverGlobal, setIsDragOverGlobal] = useState(false); // Global drag state

  // Open image upload for specific block
  const openImageUpload = useCallback((blockId: string) => {
    setCurrentImageBlockId(blockId);
    setIsImageUploadOpen(true);
  }, []);

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

  // Image Upload Handler
  const handleImageUpload = useCallback((processedImage: ProcessedImage) => {
    if (currentImageBlockId) {
      updateBlock(currentImageBlockId, {
        imageId: generateBlockId(),
        url: processedImage.dataUrl,
        alt: 'Uploaded image',
        size: 'original'
      });
      setCurrentImageBlockId(null);
    }
    setIsImageUploadOpen(false);
  }, [currentImageBlockId, updateBlock]);

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
      spacing: false,
      size: false,
      position: false,
      backgrounds: false,
      borders: false,
      effects: false,
    });

    if (!block) return null;

    const handleContentChange = (field: string, value: any) => {
      onUpdate(block.id, { [field]: value });
    };

    const handleStyleChange = (field: string, value: any) => {
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
          const [localAltText, setLocalAltText] = useState(imageContent.alt || '');
          
          // Update local state when block content changes from outside
          useEffect(() => {
            setLocalAltText(imageContent.alt || '');
          }, [imageContent.alt]);

          // Debounced update function for alt text
          useEffect(() => {
            const timer = setTimeout(() => {
              if (localAltText !== imageContent.alt) {
                handleContentChange('alt', localAltText);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localAltText]);

          const updateAltText = (value: string) => {
            setLocalAltText(value);
          };

          // Handle drag and drop
          const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
          };

          const handleDragEnter = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
          };

          const handleDragLeave = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
          };

          const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length > 0) {
              const file = imageFiles[0];
              const reader = new FileReader();
              reader.onload = (event) => {
                if (event.target?.result) {
                  handleContentChange('url', event.target.result as string);
                  handleContentChange('alt', file.name.replace(/\.[^/.]+$/, ""));
                }
              };
              reader.readAsDataURL(file);
            }
          };

          const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              const file = files[0];
              const reader = new FileReader();
              reader.onload = (event) => {
                if (event.target?.result) {
                  handleContentChange('url', event.target.result as string);
                  handleContentChange('alt', file.name.replace(/\.[^/.]+$/, ""));
                }
              };
              reader.readAsDataURL(file);
            }
          };

          return (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={localAltText}
                  onChange={(e) => updateAltText(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Image description..."
                />
              </div>
              
              {/* Image Upload Drop Zone */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Image
                </label>
                
                {imageContent.url ? (
                  // Show current image with replace option
                  <div className="space-y-3">
                    <div className="relative">
                      <img src={imageContent.url} alt="Preview" className="w-full h-32 object-cover rounded border border-gray-600" />
                      <button
                        onClick={() => handleContentChange('url', '')}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                    
                    {/* Replace Image Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-700/50"
                      onClick={() => document.getElementById(`image-input-${block.id}`)?.click()}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 border border-gray-500 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div className="text-xs text-gray-400">
                          <div className="font-medium">Drop files here</div>
                          <div>Drag and drop files anywhere on the screen, or click the upload button above.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Show upload drop zone when no image
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-700/30"
                    onClick={() => document.getElementById(`image-input-${block.id}`)?.click()}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 border-2 border-gray-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-300 font-medium">Drop files here</div>
                      <div className="text-xs text-gray-400 max-w-xs">
                        Drag and drop files anywhere on the screen, or click the upload button above.
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Hidden file input */}
                <input
                  id={`image-input-${block.id}`}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
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

        case 'hero':
          const heroContent = block.content as any;
          const [localTitle, setLocalTitle] = useState(heroContent.title || '');
          const [localSubtitle, setLocalSubtitle] = useState(heroContent.subtitle || '');
          
          // Update local state when block content changes from outside
          useEffect(() => {
            setLocalTitle(heroContent.title || '');
            setLocalSubtitle(heroContent.subtitle || '');
          }, [heroContent.title, heroContent.subtitle]);

          // Debounced update functions
          useEffect(() => {
            const timer = setTimeout(() => {
              if (localTitle !== heroContent.title) {
                handleContentChange('title', localTitle);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localTitle]);

          useEffect(() => {
            const timer = setTimeout(() => {
              if (localSubtitle !== heroContent.subtitle) {
                handleContentChange('subtitle', localSubtitle);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localSubtitle]);

          const updateTitle = (value: string) => {
            setLocalTitle(value);
          };

          const updateSubtitle = (value: string) => {
            setLocalSubtitle(value);
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
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
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
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Enter hero subtitle..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Background Image URL
                </label>
                <input
                  type="text"
                  value={heroContent.backgroundUrl || ''}
                  onChange={(e) => handleContentChange('backgroundUrl', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter image URL..."
                />
              </div>
              {heroContent.ctaButton !== undefined && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroContent.ctaButton?.text || ''}
                    onChange={(e) => handleContentChange('ctaButton', { 
                      ...heroContent.ctaButton, 
                      text: e.target.value 
                    })}
                    className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter button text..."
                  />
                </div>
              )}
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
      <div className="space-y-1">
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
                    onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
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
                    <input
                      type="number"
                      value={parseInt(block.styles.fontSize?.replace('px', '') || '16')}
                      onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-l text-white focus:border-blue-500 focus:outline-none"
                      min="8"
                      max="72"
                    />
                    <span className="px-2 py-2 text-xs bg-gray-600 border border-l-0 border-gray-600 rounded-r text-gray-300">px</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={block.styles.textColor || '#000000'}
                    onChange={(e) => handleStyleChange('textColor', e.target.value)}
                    className="w-8 h-8 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    value={block.styles.textColor || '#000000'}
                    onChange={(e) => handleStyleChange('textColor', e.target.value)}
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
                      onClick={() => handleStyleChange('textAlign', align)}
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
                    <input
                      type="number"
                      placeholder="0"
                      value={block.styles.margin?.top || 0}
                      onChange={(e) => handleStyleChange('margin', { 
                        ...block.styles.margin, 
                        top: parseInt(e.target.value) || 0 
                      })}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white text-center"
                      min="0"
                    />
                    <div></div>
                    <input
                      type="number"
                      placeholder="0"
                      value={block.styles.margin?.left || 0}
                      onChange={(e) => handleStyleChange('margin', { 
                        ...block.styles.margin, 
                        left: parseInt(e.target.value) || 0 
                      })}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white text-center"
                      min="0"
                    />
                    <div className="bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-300">M</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={block.styles.margin?.right || 0}
                      onChange={(e) => handleStyleChange('margin', { 
                        ...block.styles.margin, 
                        right: parseInt(e.target.value) || 0 
                      })}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white text-center"
                      min="0"
                    />
                    <div></div>
                    <input
                      type="number"
                      placeholder="0"
                      value={block.styles.margin?.bottom || 0}
                      onChange={(e) => handleStyleChange('margin', { 
                        ...block.styles.margin, 
                        bottom: parseInt(e.target.value) || 0 
                      })}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white text-center"
                      min="0"
                    />
                    <div></div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Padding</label>
                <div className="relative">
                  <div className="grid grid-cols-3 gap-1">
                    <div></div>
                    <input
                      type="number"
                      placeholder="0"
                      value={block.styles.padding?.top || 0}
                      onChange={(e) => handleStyleChange('padding', { 
                        ...block.styles.padding, 
                        top: parseInt(e.target.value) || 0 
                      })}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white text-center"
                      min="0"
                    />
                    <div></div>
                    <input
                      type="number"
                      placeholder="0"
                      value={block.styles.padding?.left || 0}
                      onChange={(e) => handleStyleChange('padding', { 
                        ...block.styles.padding, 
                        left: parseInt(e.target.value) || 0 
                      })}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white text-center"
                      min="0"
                    />
                    <div className="bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-xs text-white">P</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={block.styles.padding?.right || 0}
                      onChange={(e) => handleStyleChange('padding', { 
                        ...block.styles.padding, 
                        right: parseInt(e.target.value) || 0 
                      })}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white text-center"
                      min="0"
                    />
                    <div></div>
                    <input
                      type="number"
                      placeholder="0"
                      value={block.styles.padding?.bottom || 0}
                      onChange={(e) => handleStyleChange('padding', { 
                        ...block.styles.padding, 
                        bottom: parseInt(e.target.value) || 0 
                      })}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white text-center"
                      min="0"
                    />
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
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
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
                <label className="block text-xs font-medium text-gray-400 mb-1">Radius</label>
                <div className="flex">
                  <input
                    type="number"
                    value={block.styles.border?.radius || 0}
                    onChange={(e) => handleStyleChange('border', { 
                      ...block.styles.border, 
                      radius: parseInt(e.target.value) || 0 
                    })}
                    className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-l text-white focus:border-blue-500 focus:outline-none"
                    min="0"
                  />
                  <span className="px-2 py-2 text-xs bg-gray-600 border border-l-0 border-gray-600 rounded-r text-gray-300">px</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Effects Section */}
        <div>
          <button
            onClick={() => toggleSection('effects')}
            className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-white">Effects</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.effects ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.effects && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Opacity</label>
                <div className="flex">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value="100"
                    className="flex-1"
                  />
                  <span className="ml-2 text-xs text-gray-300 w-8">100</span>
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
          fixed top-0 right-0 h-full w-80 bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-700
          ${isVisible ? 'translate-x-0' : 'translate-x-full'}
        `}>
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
          <div className="overflow-y-auto h-full pb-20">
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
                          onImageUpload={openImageUpload}
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

      {/* Image Upload Modal */}
      <ImageUploadWithResize
        isOpen={isImageUploadOpen}
        onClose={() => setIsImageUploadOpen(false)}
        onImageSelect={handleImageUpload}
        title="Upload Image for Block"
      />
    </div>
  );
};

export default VisualLayoutBuilder;
