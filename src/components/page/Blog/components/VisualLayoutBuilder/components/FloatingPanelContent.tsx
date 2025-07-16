import React from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';

interface FloatingPanelContentProps {
  panelType: string;
  block: LayoutBlock;
  onStyleUpdate: (field: string, value: any) => void;
}

const FloatingPanelContent: React.FC<FloatingPanelContentProps> = ({ panelType, block, onStyleUpdate }) => {
  const renderSpacingPanel = (type: 'margin' | 'padding') => {
    const value = block.styles[type] || { top: 0, right: 0, bottom: 0, left: 0 };
    const updateSpacing = (side: string, newValue: number) => {
      onStyleUpdate(type, { ...value, [side]: Math.max(0, newValue) });
    };

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700 text-sm capitalize">{type}</h4>
        <div className="grid grid-cols-3 gap-2 max-w-[120px] mx-auto">
          <div></div>
          <input
            type="number"
            value={value.top}
            onChange={(e) => updateSpacing('top', parseInt(e.target.value) || 0)}
            className="w-12 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
          />
          <div></div>
          <input
            type="number"
            value={value.left}
            onChange={(e) => updateSpacing('left', parseInt(e.target.value) || 0)}
            className="w-12 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
          />
          <div className={`${type === 'margin' ? 'bg-gray-200' : 'bg-purple-100'} rounded flex items-center justify-center h-8`}>
            <span className={`text-xs ${type === 'margin' ? 'text-gray-600' : 'text-purple-600'}`}>
              {type === 'margin' ? 'M' : 'P'}
            </span>
          </div>
          <input
            type="number"
            value={value.right}
            onChange={(e) => updateSpacing('right', parseInt(e.target.value) || 0)}
            className="w-12 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
          />
          <div></div>
          <input
            type="number"
            value={value.bottom}
            onChange={(e) => updateSpacing('bottom', parseInt(e.target.value) || 0)}
            className="w-12 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
          />
          <div></div>
        </div>
      </div>
    );
  };

  switch (panelType) {
    case 'margin': return renderSpacingPanel('margin');
    case 'padding': return renderSpacingPanel('padding');
    default: return null;
  }
};

export default FloatingPanelContent;
