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
        relative group cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-white shadow-lg scale-[1.02]' : 'hover:ring-1 hover:ring-purple-300 hover:shadow-md'}
        ${isDragging ? 'z-50 rotate-2 scale-105' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="absolute -left-10 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing z-10"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

      {children}

      {isSelected && (
        <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none rounded-lg bg-purple-500/5" />
      )}
    </div>
  );
};

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
        
       
        {isSelected && (
          <div className="absolute -top-12 right-0 flex gap-2 bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200/50 rounded-xl p-2 z-20 transition-all duration-200 animate-in slide-in-from-top-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const element = e.currentTarget.parentElement?.parentElement?.querySelector('[contenteditable]') as HTMLElement;
                if (element) {
                  element.focus();
                }
              }}
              className="group flex items-center justify-center w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-md"
              title="Edit Inline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(block.id);
              }}
              className="group flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 shadow-md"
              title="Duplicate"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(block.id);
              }}
              className="group flex items-center justify-center w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:scale-105 shadow-md"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
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
    if (selectedBlockId) {
      setEditingBlockId(selectedBlockId);
      const selectedBlock = layout.blocks.find(block => block.id === selectedBlockId);
      if (selectedBlock?.type === 'image') {
        setPropertyPanelActiveTab('settings');
      }
    } else {
      setEditingBlockId(null);
    }
  }, [selectedBlockId, layout.blocks]);

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

    // State for floating panels
    const [activeFloatingPanel, setActiveFloatingPanel] = useState<string | null>(null);
    const [floatingPanelPosition, setFloatingPanelPosition] = useState({ x: 0, y: 0 });

    const scrollPreventionConfig = {
      wheel: { passive: false },
      keydown: { passive: false }
    };

    const preventScrollOnNumberInputs = useCallback(() => {
      const scrollFunction = (e: WheelEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.property-panel') && (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number')) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      const keyFunction = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.property-panel') && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      };

      document.addEventListener('wheel', scrollFunction, scrollPreventionConfig.wheel);
      document.addEventListener('keydown', keyFunction, scrollPreventionConfig.keydown);

      return () => {
        document.removeEventListener('wheel', scrollFunction);
        document.removeEventListener('keydown', keyFunction);
      };
    }, []);

    useEffect(() => {
      return preventScrollOnNumberInputs();
    }, [preventScrollOnNumberInputs]);

    if (!block) return null;

    const blockTypeConfig = {
      image: { showStyleTab: false, showSettingsTab: true },
      default: { showStyleTab: true, showSettingsTab: true }
    };

    const currentConfig = blockTypeConfig[block.type as keyof typeof blockTypeConfig] || blockTypeConfig.default;

    const updateContent = (field: string, value: any) => {
      onUpdate(block.id, { [field]: value });
    };

    const updateStyle = (field: string, value: any) => {
      onStyleUpdate(block.id, { [field]: value });
    };

    const toggleSection = (section: string) => {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };

    const openFloatingPanel = (panelType: string, event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setFloatingPanelPosition({
        x: rect.right + 10,
        y: rect.top
      });
      setActiveFloatingPanel(panelType);
    };

    const closeFloatingPanel = () => {
      setActiveFloatingPanel(null);
    };

    const renderFloatingPanel = () => {
      if (!activeFloatingPanel) return null;

      const panelContent = () => {
        switch (activeFloatingPanel) {
          case 'font':
            return (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 text-sm">Font Family</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Arial', 'Helvetica', 'Georgia', 'Times New Roman',
                    'Verdana', 'Roboto', 'Open Sans', 'Poppins'
                  ].map((font) => (
                    <button
                      key={font}
                      onClick={() => updateStyle('fontFamily', font)}
                      className={`px-3 py-2 text-sm rounded-lg transition-all ${
                        (block.styles.fontFamily || 'Arial') === font
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            );

          case 'weight':
            return (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 text-sm">Font Weight</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '300', label: '300 - Light' },
                    { value: 'normal', label: '400 - Normal' },
                    { value: '500', label: '500 - Medium' },
                    { value: 'bold', label: '700 - Bold' },
                  ].map((weight) => (
                    <button
                      key={weight.value}
                      onClick={() => updateStyle('fontWeight', weight.value)}
                      className={`px-3 py-2 text-sm rounded-lg transition-all ${
                        (block.styles.fontWeight || 'normal') === weight.value
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {weight.label}
                    </button>
                  ))}
                </div>
              </div>
            );

          case 'size':
            return (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 text-sm">Font Size</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const currentValue = parseInt(block.styles.fontSize?.replace('px', '') || '16');
                      const newValue = Math.max(8, currentValue - 1);
                      updateStyle('fontSize', `${newValue}px`);
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={parseInt(block.styles.fontSize?.replace('px', '') || '16')}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 16;
                      updateStyle('fontSize', `${Math.max(8, Math.min(72, value))}px`);
                    }}
                    className="w-16 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-800 focus:border-purple-400 focus:outline-none"
                    min="8"
                    max="72"
                  />
                  <span className="text-xs text-gray-500">px</span>
                  <button
                    onClick={() => {
                      const currentValue = parseInt(block.styles.fontSize?.replace('px', '') || '16');
                      const newValue = Math.min(72, currentValue + 1);
                      updateStyle('fontSize', `${newValue}px`);
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            );

          case 'color':
            return (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 text-sm">Text Color</h4>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={block.styles.textColor || '#000000'}
                    onChange={(e) => updateStyle('textColor', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={block.styles.textColor || '#000000'}
                    onChange={(e) => updateStyle('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-purple-400 focus:outline-none font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>
            );

          case 'align':
            return (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 text-sm">Text Alignment</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'left', label: 'Left', icon: '⬅' },
                    { value: 'center', label: 'Center', icon: '⬌' },
                    { value: 'right', label: 'Right', icon: '➡' },
                    { value: 'justify', label: 'Justify', icon: '≡' },
                  ].map((align) => (
                    <button
                      key={align.value}
                      onClick={() => updateStyle('textAlign', align.value)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                        (block.styles.textAlign || 'left') === align.value
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span>{align.icon}</span>
                      {align.label}
                    </button>
                  ))}
                </div>
              </div>
            );

          case 'margin':
            return (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 text-sm">Margin</h4>
                <div className="grid grid-cols-3 gap-2 max-w-[120px] mx-auto">
                  <div></div>
                  <div className="text-center">
                    <input
                      type="number"
                      value={block.styles.margin?.top || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateStyle('margin', { ...block.styles.margin, top: Math.max(0, value) });
                      }}
                      className="w-12 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <div></div>
                  <div className="text-center">
                    <input
                      type="number"
                      value={block.styles.margin?.left || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateStyle('margin', { ...block.styles.margin, left: Math.max(0, value) });
                      }}
                      className="w-12 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <div className="bg-gray-200 rounded flex items-center justify-center h-8">
                    <span className="text-xs text-gray-600">M</span>
                  </div>
                  <div className="text-center">
                    <input
                      type="number"
                      value={block.styles.margin?.right || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateStyle('margin', { ...block.styles.margin, right: Math.max(0, value) });
                      }}
                      className="w-12 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <div></div>
                  <div className="text-center">
                    <input
                      type="number"
                      value={block.styles.margin?.bottom || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateStyle('margin', { ...block.styles.margin, bottom: Math.max(0, value) });
                      }}
                      className="w-12 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <div></div>
                </div>
              </div>
            );

          case 'padding':
            return (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 text-sm">Padding</h4>
                <div className="grid grid-cols-3 gap-2 max-w-[120px] mx-auto">
                  <div></div>
                  <div className="text-center">
                    <input
                      type="number"
                      value={block.styles.padding?.top || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateStyle('padding', { ...block.styles.padding, top: Math.max(0, value) });
                      }}
                      className="w-12 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <div></div>
                  <div className="text-center">
                    <input
                      type="number"
                      value={block.styles.padding?.left || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateStyle('padding', { ...block.styles.padding, left: Math.max(0, value) });
                      }}
                      className="w-12 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <div className="bg-purple-100 rounded flex items-center justify-center h-8">
                    <span className="text-xs text-purple-600">P</span>
                  </div>
                  <div className="text-center">
                    <input
                      type="number"
                      value={block.styles.padding?.right || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateStyle('padding', { ...block.styles.padding, right: Math.max(0, value) });
                      }}
                      className="w-12 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <div></div>
                  <div className="text-center">
                    <input
                      type="number"
                      value={block.styles.padding?.bottom || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateStyle('padding', { ...block.styles.padding, bottom: Math.max(0, value) });
                      }}
                      className="w-12 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <div></div>
                </div>
              </div>
            );

          default:
            return null;
        }
      };

      return (
        <div
          className="fixed bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 rounded-2xl p-4 z-[60] min-w-[250px]"
          style={{
            left: `${floatingPanelPosition.x}px`,
            top: `${floatingPanelPosition.y}px`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 capitalize">{activeFloatingPanel}</span>
            </div>
            <button
              onClick={closeFloatingPanel}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {panelContent()}
        </div>
      );
    };

    const renderStyleControls = () => (
      <div className="p-5 space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Typography</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={(e) => openFloatingPanel('font', e)}
              className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm"
            >
              Font
            </button>
            <button
              onClick={(e) => openFloatingPanel('weight', e)}
              className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm"
            >
              Weight
            </button>
            <button
              onClick={(e) => openFloatingPanel('size', e)}
              className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm"
            >
              Size
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => openFloatingPanel('color', e)}
              className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm"
            >
              Color
            </button>
            <button
              onClick={(e) => openFloatingPanel('align', e)}
              className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm"
            >
              Align
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Spacing</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => openFloatingPanel('margin', e)}
              className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm"
            >
              Margin
            </button>
            <button
              onClick={(e) => openFloatingPanel('padding', e)}
              className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm"
            >
              Padding
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Appearance</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => openFloatingPanel('background', e)}
              className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm"
            >
              Background
            </button>
            <button
              onClick={(e) => openFloatingPanel('border', e)}
              className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm"
            >
              Border
            </button>
          </div>
        </div>
      </div>
    );

    const renderContentControls = () => {
      if (block.type === 'text') {
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={block.content}
                onChange={(e) => updateContent(e.target.value)}
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
                value={block.title || ''}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="Enter heading title..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                value={block.level || 1}
                onChange={(e) => updateContent(parseInt(e.target.value))}
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
              value={block.src || ''}
              onChange={(value) => updateContent(value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
              <input
                type="text"
                value={block.alt || ''}
                onChange={(e) => {
                  updateBlock(block.id, { ...block, alt: e.target.value });
                }}
                placeholder="Describe the image..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
          </div>
        );
      }

      return null;
    };

    return (
      <>
        {renderFloatingPanel()}
        <div
          className={`fixed top-16 right-4 w-80 h-[calc(100vh-5rem)] bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 rounded-2xl z-50 transition-all duration-300 ease-out property-panel ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Settings
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

          {currentConfig.showStyleTab && currentConfig.showSettingsTab && (
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => onTabChange('style')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                  activeTab === 'style'
                    ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Style
              </button>
              <button
                onClick={() => onTabChange('settings')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Settings
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto bg-white">
            {block.type === 'image' ? (
              <div className="p-5">
                {renderContentControls()}
              </div>
            ) : (
              <>
                {activeTab === 'style' && (
                  <div className="p-5">
                    {renderStyleControls()}
                  </div>
                )}
                {activeTab === 'settings' && (
                  <div className="p-5">
                    {renderContentControls()}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </>
    );
  };
          const headingContent = block.content as any;
          const [localHeadingText, setLocalHeadingText] = useState(headingContent.text || '');
          
          // Update local state when block content changes from outside
          useEffect(() => {
            setLocalHeadingText(headingContent.text || '');
          }, [headingContent.text]);

    
          useEffect(() => {
            const timer = setTimeout(() => {
              if (localHeadingText !== headingContent.text) {
                updateContent('text', localHeadingText);
              }
            }, 300);

            return () => clearTimeout(timer);
          }, [localHeadingText]);

          const updateHeadingText = (value: string) => {
            setLocalHeadingText(value);
          };

          return (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text
                </label>
                <textarea
                  value={localHeadingText}
                  onChange={(e) => updateHeadingText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all resize-none"
                  placeholder="Enter heading text..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading Level
                </label>
                <select
                  value={headingContent.level || 2}
                  onChange={(e) => updateContent('level', parseInt(e.target.value))}
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                >
                  <option value={1}>H1 - Main Title</option>
                  <option value={2}>H2 - Section Heading</option>
                  <option value={3}>H3 - Subsection</option>
                  <option value={4}>H4 - Minor Heading</option>
                  <option value={5}>H5 - Small Heading</option>
                  <option value={6}>H6 - Tiny Heading</option>
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
                updateContent('text', localParagraphText);
              }
            }, 300);

            return () => clearTimeout(timer);
          }, [localParagraphText]);

          const updateParagraphText = (value: string) => {
            setLocalParagraphText(value);
          };

          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paragraph Text
              </label>
              <textarea
                value={localParagraphText}
                onChange={(e) => updateParagraphText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all resize-none"
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
              onImageUrlChange={(url) => updateContent('url', url)}
              onAltTextChange={(alt) => updateContent('alt', alt)}
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
                updateContent('text', localQuoteText);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localQuoteText]);

          useEffect(() => {
            const timer = setTimeout(() => {
              if (localAuthor !== quoteContent.author) {
                updateContent('author', localAuthor);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localAuthor]);

          useEffect(() => {
            const timer = setTimeout(() => {
              if (localSource !== quoteContent.source) {
                updateContent('source', localSource);
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
            updateContent('items', newItems);
          };

          const removeListItem = (index: number) => {
            if (localItems.length > 1) {
              const newItems = localItems.filter((_: string, i: number) => i !== index);
              setLocalItems(newItems);
              updateContent('items', newItems);
            }
          };

          const updateListItem = (index: number, value: string) => {
            const newItems = [...localItems];
            newItems[index] = value;
            setLocalItems(newItems);
            
            const timer = setTimeout(() => {
              updateContent('items', newItems);
            }, 300);

            return () => clearTimeout(timer);
          };

          const toggleListType = (ordered: boolean) => {
            updateContent('ordered', ordered);
          };

          return (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleListType(false)}
                    className={`flex-1 px-4 py-3 text-sm rounded-lg transition-all ${
                      !listContent.ordered
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    • Bulleted
                  </button>
                  <button
                    onClick={() => toggleListType(true)}
                    className={`flex-1 px-4 py-3 text-sm rounded-lg transition-all ${
                      listContent.ordered
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    1. Numbered
                  </button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    List Items
                  </label>
                  <button
                    onClick={addListItem}
                    className="px-3 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-sm"
                  >
                    + Add Item
                  </button>
                </div>
                
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {localItems.map((item: string, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateListItem(index, e.target.value)}
                        className="flex-1 px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                        placeholder={`Item ${index + 1}`}
                      />
                      <button
                        onClick={() => removeListItem(index)}
                        disabled={localItems.length <= 1}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            updateContent('height', value);
            
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
                updateContent('code', localCode);
              }
            }, 300);
            return () => clearTimeout(timer);
          }, [localCode]);

          const updateCode = (value: string) => {
            setLocalCode(value);
          };

          const updateLanguage = (value: string) => {
            setLocalLanguage(value);
            updateContent('language', value);
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
            updateContent(key, value);
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
                    onChange={(e) => updateStyle('fontWeight', e.target.value)}
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
                          updateStyle('fontSize', `${newValue}px`);
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
                          updateStyle('fontSize', `${Math.max(8, Math.min(72, value))}px`);
                        }}
                        className="w-16 px-2 py-2 text-sm bg-transparent text-white text-center focus:outline-none"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = parseInt(block.styles.fontSize?.replace('px', '') || '16');
                          const newValue = Math.min(72, currentValue + 1);
                          updateStyle('fontSize', `${newValue}px`);
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
                            updateStyle('titleFontSize', `${newValue}px`);
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
                            updateStyle('titleFontSize', `${Math.max(12, Math.min(96, value))}px`);
                          }}
                          className="w-16 px-2 py-2 text-sm bg-transparent text-white text-center focus:outline-none"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentValue = parseInt(block.styles.titleFontSize?.replace('px', '') || '32');
                            const newValue = Math.min(96, currentValue + 1);
                            updateStyle('titleFontSize', `${newValue}px`);
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
                            updateStyle('subtitleFontSize', `${newValue}px`);
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
                            updateStyle('subtitleFontSize', `${Math.max(10, Math.min(48, value))}px`);
                          }}
                          className="w-16 px-2 py-2 text-sm bg-transparent text-white text-center focus:outline-none"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentValue = parseInt(block.styles.subtitleFontSize?.replace('px', '') || '18');
                            const newValue = Math.min(48, currentValue + 1);
                            updateStyle('subtitleFontSize', `${newValue}px`);
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
                    onChange={(e) => updateStyle('textColor', e.target.value)}
                    className="w-8 h-8 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    value={block.styles.textColor || '#000000'}
                    onChange={(e) => updateStyle('textColor', e.target.value)}
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
                      onClick={() => updateStyle('textAlign', align)}
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
                          updateStyle('margin', { 
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
                          updateStyle('margin', { 
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
                          updateStyle('margin', { 
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
                          updateStyle('margin', { 
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
                          updateStyle('margin', { 
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
                          updateStyle('margin', { 
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
                          updateStyle('margin', { 
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
                          updateStyle('margin', { 
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
                          updateStyle('margin', { 
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
                          updateStyle('margin', { 
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
                          updateStyle('margin', { 
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
                          updateStyle('margin', { 
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
                          updateStyle('padding', { 
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
                          updateStyle('padding', { 
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
                          updateStyle('padding', { 
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
                          updateStyle('padding', { 
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
                          updateStyle('padding', { 
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
                          updateStyle('padding', { 
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
                          updateStyle('padding', { 
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
                          updateStyle('padding', { 
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
                          updateStyle('padding', { 
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
                          updateStyle('padding', { 
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
                          updateStyle('padding', { 
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
                          updateStyle('padding', { 
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
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
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
                        updateStyle('border', { 
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
                        updateStyle('border', { 
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
                        updateStyle('border', { 
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
                  onChange={(e) => updateStyle('border', { 
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
                    onChange={(e) => updateStyle('border', { 
                      ...block.styles.border, 
                      color: e.target.value 
                    })}
                    className="w-8 h-8 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    value={block.styles.border?.color || '#000000'}
                    onChange={(e) => updateStyle('border', { 
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
                        updateStyle('border', { 
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
                        updateStyle('border', { 
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
                        updateStyle('border', { 
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
        <div className={`
          property-panel fixed top-6 right-6 h-[calc(100vh-3rem)] w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-50 transform transition-all duration-300 ease-out border border-gray-200/30 rounded-2xl flex flex-col overflow-hidden
          ${isVisible ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-full scale-95 opacity-0'}
        `}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-800 capitalize">
                {block.type} Properties
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {block.type === 'image' ? (
            <div className="px-5 py-3 bg-gray-50/70 border-b border-gray-100">
              <div className="text-sm font-medium text-purple-600">Settings</div>
            </div>
          ) : (
            <div className="flex bg-gray-50/70">
              <button
                onClick={() => onTabChange('style')}
                className={`flex-1 px-5 py-3 text-sm font-medium transition-all duration-200 relative ${
                  activeTab === 'style'
                    ? 'text-purple-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                Style
                {activeTab === 'style' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-600" />
                )}
              </button>
              <button
                onClick={() => onTabChange('settings')}
                className={`flex-1 px-5 py-3 text-sm font-medium transition-all duration-200 relative ${
                  activeTab === 'settings'
                    ? 'text-purple-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                Settings
                {activeTab === 'settings' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-600" />
                )}
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto bg-white">
            {block.type === 'image' ? (
              <div className="p-5">
                {renderContentControls()}
              </div>
            ) : (
              <>
                {activeTab === 'style' && (
                  <div className="p-5">
                    {renderStyleControls()}
                  </div>
                )}
                {activeTab === 'settings' && (
                  <div className="p-5">
                    {renderContentControls()}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div 
      className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden"
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
      <div className="w-72 bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/50 backdrop-blur-sm overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Elements</h2>
          </div>

          <div className="space-y-1">
            {Object.entries(BLOCK_TEMPLATES).map(([type, template]) => {
              const elementIcons = {
                heading: "H",
                paragraph: "P", 
                image: "🖼️",
                quote: "💬",
                list: "📋",
                code: "</>"
              };
              
              return (
                <button
                  key={type}
                  onClick={() => addBlock(type as BlockType)}
                  className="group w-full flex items-center gap-4 p-4 text-left bg-white/60 hover:bg-white border border-gray-200/50 hover:border-purple-300 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-purple-100 group-hover:to-blue-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 group-hover:text-purple-600 transition-all duration-200">
                    {elementIcons[type as keyof typeof elementIcons] || type.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 capitalize group-hover:text-purple-600 transition-colors">
                      {type.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-purple-500">
                      Add {type} element
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100/50 transition-all duration-300">
        <div className="p-8">
          <div
            className="mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200/50"
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
                <div className="text-center py-20 text-gray-500">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">Start Building Your Layout</h3>
                  <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    Drag elements from the sidebar to create your perfect blog layout. 
                    Click on any element to customize its style and content.
                  </p>
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
