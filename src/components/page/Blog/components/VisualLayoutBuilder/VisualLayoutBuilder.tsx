import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { 
  LayoutBlock, 
  updateBlockStyles,
  BLOCK_TEMPLATES,
  BlockType,
} from '../../../../../services/types/visualLayoutTypes';
import SortableBlockRenderer from './components/SortableBlockRenderer';
import PropertyPanel from './components/PropertyPanel';
import { DesktopIcon } from '../../../../ui/icons/desktop';
import { TabletIcon } from '../../../../ui/icons/tablet';
import { MobileIcon } from '../../../../ui/icons/mobile';

interface VisualLayoutBuilderProps {
  onLayoutChange?: (layout: LayoutBlock[]) => void;
  onSave?: () => void;
  initialLayout?: LayoutBlock[];
  blogData?: any;
}

const demoBlocks: LayoutBlock[] = [
  {
    id: 'demo-heading-1',
    type: 'heading',
    content: {
      text: 'Gotham Visual Layout Builder',
      level: 1,
    },
    styles: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      textColor: '#1f2937',
      margin: { top: 0, right: 0, bottom: 24, left: 0 },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    position: { x: 0, y: 0, width: 100, height: 80 },
  },
  {
    id: 'demo-paragraph-1',
    type: 'paragraph',
    content: {
      text: 'Click on any block to see the floating style controls. Try clicking the Style buttons on the right to see the floating panels in action!',
      richText: true,
    },
    styles: {
      fontSize: '1.125rem',
      textAlign: 'center',
      textColor: '#4b5563',
      margin: { top: 0, right: 0, bottom: 32, left: 0 },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
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
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      border: { width: 0, style: 'solid', color: '#e5e7eb', radius: 12 },
    },
    position: { x: 0, y: 0, width: 100, height: 300 },
  }
];

const VisualLayoutBuilder: React.FC<VisualLayoutBuilderProps> = ({
  onLayoutChange,
  onSave,
  initialLayout,
  blogData = {},
}) => {
  const [blocks, setBlocks] = useState<LayoutBlock[]>(() => {
    const result = Array.isArray(initialLayout) ? initialLayout : [];
    return result;
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [propertyPanelActiveTab, setPropertyPanelActiveTab] = useState<'style' | 'settings'>('settings');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    if (temporaryBlock?.id === blockId) {
      setTemporaryBlock(prev => prev ? { ...prev, ...updates } : null);
    } else {
      setBlocks(prev => prev.map(block => {
        if (block.id === blockId) {
          return { ...block, ...updates };
        }
        return block;
      }));
    }
  };

  const updateBlockStyle = (blockId: string, styles: any) => {
    if (temporaryBlock?.id === blockId) {
      setTemporaryBlock(prev => prev ? updateBlockStyles(prev, styles) : null);
    } else {
      setBlocks(prev => 
        prev.map(block => 
          block.id === blockId ? updateBlockStyles(block, styles) : block
        )
      );
    }
  };

  const reorderBlocks = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setBlocks(prev => {
      const activeIndex = prev.findIndex(block => block.id === active.id);
      const overIndex = prev.findIndex(block => block.id === over.id);

      if (activeIndex === -1 || overIndex === -1) return prev;

      return arrayMove(prev, activeIndex, overIndex);
    });
  };

  const [temporaryBlock, setTemporaryBlock] = useState<LayoutBlock | null>(null);

  const openSettings = (type: 'image' | 'video' | 'paragraph' | 'button' | 'list', block: LayoutBlock) => {
    if (block.id.startsWith('temp-')) {
      setTemporaryBlock(block);
      setSelectedBlockId(block.id);
    } else {
      setTemporaryBlock(null);
      setSelectedBlockId(block.id);
    }
    setShowPropertiesPanel(true);
    setPropertyPanelActiveTab('settings');
  };

  const selectedBlock = selectedBlockId 
    ? (temporaryBlock?.id === selectedBlockId ? temporaryBlock : blocks.find(block => block.id === selectedBlockId))
    : undefined;

  const getContainerMaxWidth = () => {
    switch (viewMode) {
      case 'mobile': return 'max-w-sm';
      case 'tablet': return 'max-w-2xl';
      default: return 'max-w-8xl'; 
    }
  };

  return (
    <div className="flex h-full bg-white relative">
      <div 
        className="flex-1 h-full overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedBlockId(null);
            setShowPropertiesPanel(false);
            setTemporaryBlock(null);
          }
        }}
      >
        <div className="flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-white px-8 py-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'desktop'
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-gray-200'
                    }`}
                    title="Desktop View"
                  >
                    <DesktopIcon size={20} className={viewMode === 'desktop' ? 'text-blue-600' : 'text-gray-600'} />
                  </button>
                  <button
                    onClick={() => setViewMode('tablet')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'tablet'
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-gray-200'
                    }`}
                    title="Tablet View"
                  >
                    <TabletIcon size={20} className={viewMode === 'tablet' ? 'text-blue-600' : 'text-gray-600'} />
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'mobile'
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-gray-200'
                    }`}
                    title="Mobile View"
                  >
                    <MobileIcon size={20} className={viewMode === 'mobile' ? 'text-blue-600' : 'text-gray-600'} />
                  </button>
                </div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          <div 
            className="flex-1 p-8 pb-24"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedBlockId(null);
                setShowPropertiesPanel(false);
              }
            }}
          >
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter}
              onDragEnd={reorderBlocks}
            >
              <SortableContext items={Array.isArray(blocks) ? blocks.map(b => b.id) : []} strategy={verticalListSortingStrategy}>
                <div className={`mx-auto transition-all duration-300 ${getContainerMaxWidth()}`}>
                  <div 
                    className="bg-white p-12 min-h-[600px]" // Increased padding from p-8 to p-12
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setSelectedBlockId(null);
                        setShowPropertiesPanel(false);
                      }
                    }}
                  >
                    <div className="space-y-4">
                      {Array.isArray(blocks) && blocks.length > 0 ? (
                        blocks.map((block) => (
                          <SortableBlockRenderer
                            key={block.id}
                            block={block}
                            isSelected={selectedBlockId === block.id}
                            onClick={() => {
                              setSelectedBlockId(block.id);
                              setShowPropertiesPanel(true);
                            }}
                            onRemove={() => removeBlock(block.id)}
                            onContentUpdate={(field, value) => updateBlock(block.id, { 
                              content: { ...block.content, [field]: value } 
                            })}
                            onStyleUpdate={(field, value) => updateBlockStyle(block.id, { [field]: value })}
                            onOpenSettings={openSettings}
                          />
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-500 mb-2">Start Building Your Blog</h3>
                          <p className="text-gray-400">Use the sidebar to add content blocks and create your blog layout</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>

      <PropertyPanel
        block={selectedBlock}
        isVisible={showPropertiesPanel}
        onClose={() => {
          setShowPropertiesPanel(false);
          setTemporaryBlock(null);
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
