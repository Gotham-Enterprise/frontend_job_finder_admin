import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { 
  LayoutBlock, 
  updateBlockStyles,
  BLOCK_TEMPLATES,
  BlockType,
} from '../../../../../services/types/visualLayoutTypes';
import BlockRenderer from './components/BlockRenderer';
import ElementsSidebar from './components/ElementsSidebar';
import PropertyPanel from './components/PropertyPanel';

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
];

const VisualLayoutBuilder: React.FC<VisualLayoutBuilderProps> = ({
  onLayoutChange,
  onSave,
  initialLayout,
  blogData = {},
}) => {
  const [blocks, setBlocks] = useState<LayoutBlock[]>(() => {
    const result = Array.isArray(initialLayout) ? initialLayout : [];
    return result.length === 0 ? demoBlocks : result;
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [propertyPanelActiveTab, setPropertyPanelActiveTab] = useState<'style' | 'settings'>('settings');

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
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      <ElementsSidebar onAddBlock={addBlock} />
      
      <div className="flex-1 ml-[218px] p-8 overflow-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter}>
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
        onClose={() => setShowPropertiesPanel(false)}
        onUpdate={updateBlock}
        onStyleUpdate={updateBlockStyle}
        activeTab={propertyPanelActiveTab}
        onTabChange={setPropertyPanelActiveTab}
      />
    </div>
  );
};

export default VisualLayoutBuilder;
