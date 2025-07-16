import React, { useState, useEffect, useCallback } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  LayoutBlock, 
  updateBlockStyles,
  BLOCK_TEMPLATES,
  BlockType,
} from '../../../../../services/types/visualLayoutTypes';
import ImageUrlInput from './ImageUrlInput';

interface VisualLayoutBuilderProps {
  onLayoutChange?: (layout: LayoutBlock[]) => void;
  onSave?: () => void;
  initialLayout?: LayoutBlock[];
  blogData?: any;
}

interface BlockRendererProps {
  block: LayoutBlock;
  isSelected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, isSelected, onClick, onRemove }) => {
  const renderBlockContent = () => {
    switch (block.type) {
      case 'heading':
        const headingLevel = (block.content as any)?.level || 2;
        const headingText = (block.content as any)?.text || 'Sample Heading';
        const headingStyle = {
          fontSize: block.styles.fontSize || '2rem',
          fontWeight: block.styles.fontWeight || 'bold',
          color: block.styles.textColor || '#000000',
          textAlign: block.styles.textAlign || 'left',
          fontFamily: block.styles.fontFamily || 'inherit',
        } as React.CSSProperties;

        switch (headingLevel) {
          case 1: return <h1 style={headingStyle}>{headingText}</h1>;
          case 2: return <h2 style={headingStyle}>{headingText}</h2>;
          case 3: return <h3 style={headingStyle}>{headingText}</h3>;
          case 4: return <h4 style={headingStyle}>{headingText}</h4>;
          case 5: return <h5 style={headingStyle}>{headingText}</h5>;
          case 6: return <h6 style={headingStyle}>{headingText}</h6>;
          default: return <h2 style={headingStyle}>{headingText}</h2>;
        }
      
      case 'paragraph':
        return (
          <p 
            style={{
              fontSize: block.styles.fontSize || '1rem',
              fontWeight: block.styles.fontWeight || 'normal',
              color: block.styles.textColor || '#000000',
              textAlign: block.styles.textAlign || 'left',
              fontFamily: block.styles.fontFamily || 'inherit',
            }}
          >
            {(block.content as any)?.text || 'Sample paragraph text. Click to edit this content.'}
          </p>
        );
      
      case 'image':
        const imageUrl = (block.content as any)?.url;
        return (
          <div className="w-full rounded-lg overflow-hidden bg-gray-100">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={(block.content as any)?.alt || 'Image'} 
                className="w-full h-48 object-cover"
                style={{
                  borderRadius: block.styles.border?.radius ? `${block.styles.border.radius}px` : '8px',
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Click to add image</p>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return <div className="text-gray-500">Unknown block type: {block.type}</div>;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`relative group p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'border-purple-500 bg-purple-50/30 shadow-lg ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      style={{
        margin: block.styles.margin ? `${block.styles.margin.top}px ${block.styles.margin.right}px ${block.styles.margin.bottom}px ${block.styles.margin.left}px` : '0',
        padding: block.styles.padding ? `${block.styles.padding.top}px ${block.styles.padding.right}px ${block.styles.padding.bottom}px ${block.styles.padding.left}px` : '16px',
        backgroundColor: block.styles.backgroundColor || 'transparent',
      }}
    >
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm border">
          {block.type}
        </span>
      </div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {renderBlockContent()}
    </div>
  );
};

const VisualLayoutBuilder: React.FC<VisualLayoutBuilderProps> = ({
  onLayoutChange,
  onSave,
  initialLayout,
  blogData = {},
}) => {
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
      if (block.type === 'paragraph') {
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={(block.content as any)?.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
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
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Enter heading title..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                value={(block.content as any)?.level || 1}
                onChange={(e) => updateContent('level', parseInt(e.target.value))}
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
              onImageUrlChange={(value: string) => updateContent('url', value)}
              onAltTextChange={(value: string) => updateContent('alt', value)}
            />
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
        </div>
      </>
    );
  };

  const [blocks, setBlocks] = useState<LayoutBlock[]>(() => {
    console.log('VisualLayoutBuilder initialLayout:', initialLayout);
    const result = Array.isArray(initialLayout) ? initialLayout : [];
    console.log('VisualLayoutBuilder blocks initialized:', result);
    
    // If no initial layout, add some demo blocks to show functionality
    if (result.length === 0) {
      return [
        {
          id: 'demo-heading-1',
          type: 'heading',
          content: {
            text: 'Welcome to the Visual Layout Builder',
            level: 1,
          },
          styles: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            textColor: '#1f2937',
            margin: { top: 0, right: 0, bottom: 24, left: 0 },
            padding: { top: 16, right: 0, bottom: 16, left: 0 },
          },
          position: { x: 0, y: 0, width: 100, height: 80 },
        },
        {
          id: 'demo-paragraph-1',
          type: 'paragraph',
          content: {
            text: 'Click on any block to see the floating style controls. Try clicking the Style buttons on the right to see the Canva-like floating panels in action!',
            richText: true,
          },
          styles: {
            fontSize: '1.125rem',
            textAlign: 'center',
            textColor: '#4b5563',
            margin: { top: 0, right: 0, bottom: 32, left: 0 },
            padding: { top: 8, right: 0, bottom: 8, left: 0 },
          },
          position: { x: 0, y: 0, width: 100, height: 80 },
        },
        {
          id: 'demo-image-1',
          type: 'image',
          content: {
            url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
            alt: 'Demo image of a laptop with code',
            size: 'large',
            aspectRatio: '16:9',
          },
          styles: {
            margin: { top: 0, right: 0, bottom: 24, left: 0 },
            padding: { top: 8, right: 8, bottom: 8, left: 8 },
            border: { width: 0, style: 'solid', color: '#e5e7eb', radius: 12 },
          },
          position: { x: 0, y: 0, width: 100, height: 300 },
        }
      ] as LayoutBlock[];
    }
    
    return result;
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [propertyPanelActiveTab, setPropertyPanelActiveTab] = useState<'style' | 'settings'>('settings');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update blocks when initialLayout changes
  useEffect(() => {
    if (Array.isArray(initialLayout)) {
      setBlocks(initialLayout);
    }
  }, [initialLayout]);

  const generateBlockId = (): string => {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addBlock = (type: BlockType) => {
    const template = BLOCK_TEMPLATES[type];
    const newBlock: LayoutBlock = {
      id: generateBlockId(),
      ...template,
      styles: template.styles || {},
      content: template.content || {},
      position: template.position || { x: 0, y: 0, width: 100, height: 100 },
    } as LayoutBlock;

    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setShowPropertiesPanel(true);
  };

  const removeBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
      setShowPropertiesPanel(false);
    }
  };

  const updateBlock = (blockId: string, updates: Partial<LayoutBlock>) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        // If updates contain content fields, merge them into the content object
        const contentUpdates = Object.keys(updates).reduce((acc, key) => {
          if (!['id', 'type', 'styles', 'position', 'children', 'metadata'].includes(key)) {
            acc[key] = updates[key as keyof LayoutBlock];
            delete updates[key as keyof LayoutBlock];
          }
          return acc;
        }, {} as any);

        const newBlock = { ...block, ...updates };
        if (Object.keys(contentUpdates).length > 0) {
          newBlock.content = { ...block.content, ...contentUpdates };
        }
        return newBlock;
      }
      return block;
    }));
  };

  const updateBlockStyle = (blockId: string, styles: any) => {
    setBlocks(prev => 
      prev.map(block => 
        block.id === blockId ? updateBlockStyles(block, styles) : block
      )
    );
  };

  const selectedBlock = selectedBlockId ? blocks.find(block => block.id === selectedBlockId) : undefined;

  const sidebarElements = [
    {
      type: 'heading',
      label: 'Heading',
      icon: 'H',
      title: 'Add Heading'
    },
    {
      type: 'paragraph',
      label: 'Text',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
      title: 'Add Text'
    },
    {
      type: 'image',
      label: 'Image',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Add Image'
    }
  ];

  const ElementsSidebar = () => (
    <div className="fixed left-[255px] top-16 w-18 h-[calc(100vh-4rem)] bg-gray-100 border-r border-gray-300 flex flex-col items-center py-6 z-40">
      <div className="flex flex-col gap-6">
        {sidebarElements.map((element) => (
          <div key={element.type} className="flex flex-col items-center">
            <button
              onClick={() => addBlock(element.type as BlockType)}
              className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-all mb-1"
              title={element.title}
            >
              {typeof element.icon === 'string' ? (
                <span className="font-bold text-sm">{element.icon}</span>
              ) : (
                element.icon
              )}
            </button>
            <span className="text-xs text-gray-600 text-center font-medium">{element.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div 
      className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden"
    >
      <ElementsSidebar />
      
      <div className="flex-1 ml-[218px] p-8 overflow-auto">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
        >
          <SortableContext items={Array.isArray(blocks) ? blocks : []} strategy={verticalListSortingStrategy}>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {Array.isArray(blocks) && blocks.length > 0 ? (
                  blocks.map((block) => (
                    <BlockRenderer
                      key={block.id}
                      block={block}
                      isSelected={selectedBlockId === block.id}
                      onClick={() => {
                        setSelectedBlockId(block.id);
                        setShowPropertiesPanel(true);
                      }}
                      onRemove={() => removeBlock(block.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-500 mb-2">No blocks yet</h3>
                    <p className="text-gray-400">Use the sidebar to add content blocks</p>
                  </div>
                )}
              </div>
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <PropertyPanel
        block={selectedBlock}
        isVisible={showPropertiesPanel}
        onClose={() => {
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
