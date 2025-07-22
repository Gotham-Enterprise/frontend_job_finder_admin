import React, { useState } from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';
import FloatingPanel from './FloatingPanel';
import StyleControls from './StyleControls';
import ContentControls from './ContentControls';
import FloatingPanelContent from './FloatingPanelContent';

interface PropertyPanelProps {
  block: LayoutBlock | undefined;
  isVisible: boolean;
  onClose: () => void;
  onUpdate: (blockId: string, content: any) => void;
  onStyleUpdate: (blockId: string, styles: any) => void;
  onDuplicate?: (blockId: string) => void;
  activeTab: 'style' | 'settings';
  onTabChange: (tab: 'style' | 'settings') => void;
}

const blockTypeConfig = {
  image: { showStyleTab: false, showSettingsTab: true },
  video: { showStyleTab: false, showSettingsTab: true },
  default: { showStyleTab: true, showSettingsTab: true }
};

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  block,
  isVisible,
  onClose,
  onUpdate,
  onStyleUpdate,
  onDuplicate,
  activeTab,
  onTabChange
}) => {
  const [activeFloatingPanel, setActiveFloatingPanel] = useState<string | null>(null);
  const [floatingPanelPosition, setFloatingPanelPosition] = useState({ x: 0, y: 0 });

  if (!block) return null;

  const currentConfig = blockTypeConfig[block.type as keyof typeof blockTypeConfig] || blockTypeConfig.default;

  const updateContent = (field: string, value: any) => {
    onUpdate(block.id, { 
      content: { 
        ...block.content, 
        [field]: value 
      } 
    });
  };

  const updateStyle = (field: string, value: any) => {
    onStyleUpdate(block.id, { [field]: value });
  };

  const duplicateBlock = () => {
    if (onDuplicate && block) {
      onDuplicate(block.id);
    }
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

  return (
    <>
      <FloatingPanel
        isVisible={!!activeFloatingPanel}
        position={floatingPanelPosition}
        panelType={activeFloatingPanel}
        onClose={closeFloatingPanel}
      >
        {activeFloatingPanel && (
          <FloatingPanelContent
            panelType={activeFloatingPanel}
            block={block}
            onStyleUpdate={updateStyle}
          />
        )}
      </FloatingPanel>

      <div
        className={`fixed top-16 right-4 w-80 h-[calc(100vh-5rem)] bg-white shadow-2xl border border-gray-200 rounded-2xl z-[60] transition-all duration-300 ease-out property-panel ${
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
            {(block.type === 'image' || block.type === 'video') ? (
              <div className="p-5">
                <ContentControls 
                  block={block} 
                  onContentUpdate={updateContent}
                  onStyleUpdate={updateStyle}
                />
              </div>
            ) : (
              <>
                {activeTab === 'style' && (
                  <StyleControls 
                    block={block} 
                    onFloatingPanelOpen={openFloatingPanel}
                    onStyleUpdate={updateStyle}
                    onDuplicate={duplicateBlock}
                  />
                )}
                {activeTab === 'settings' && (
                  <div className="p-5">
                    <ContentControls 
                      block={block} 
                      onContentUpdate={updateContent}
                      onStyleUpdate={updateStyle}
                    />
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

export default PropertyPanel;
