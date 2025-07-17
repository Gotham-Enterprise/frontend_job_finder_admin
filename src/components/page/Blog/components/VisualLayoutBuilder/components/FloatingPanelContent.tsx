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

  const renderBackgroundPanel = () => {
    const backgroundColor = block.styles.backgroundColor || '#ffffff';
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 text-sm">Background</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                className="flex-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded focus:border-purple-400 focus:outline-none"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBorderPanel = () => {
    const border = (block.styles.border as any) || {};
    const borderColor = border.color || '#000000';
    const borderWidth = border.width || 0;
    const borderRadius = border.radius || 0;
    const borderStyle = border.style || 'solid';
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 text-sm">Border</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width</label>
            <input
              type="number"
              value={borderWidth}
              onChange={(e) => onStyleUpdate('border', { ...border, width: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded focus:border-purple-400 focus:outline-none"
              min="0"
              max="20"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Style</label>
            <select
              value={borderStyle}
              onChange={(e) => onStyleUpdate('border', { ...border, style: e.target.value })}
              className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded focus:border-purple-400 focus:outline-none"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => onStyleUpdate('border', { ...border, color: e.target.value })}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => onStyleUpdate('border', { ...border, color: e.target.value })}
                className="flex-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded focus:border-purple-400 focus:outline-none"
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Radius</label>
            <input
              type="number"
              value={borderRadius}
              onChange={(e) => onStyleUpdate('border', { ...border, radius: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded focus:border-purple-400 focus:outline-none"
              min="0"
              max="50"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderImageAlignPanel = () => {
    const imageAlign = block.styles.imageAlign || 'center';
    
    const alignmentOptions = [
      { value: 'left', label: 'Left', icon: 'M3 6h18M3 12h12M3 18h18' },
      { value: 'center', label: 'Center', icon: 'M6 6h12M3 12h18M6 18h12' },
      { value: 'right', label: 'Right', icon: 'M3 6h18M9 12h12M3 18h18' }
    ];
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 text-sm">Align to page</h4>
        <div className="grid grid-cols-3 gap-2">
          {alignmentOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onStyleUpdate('imageAlign', option.value)}
              className={`p-3 rounded-lg border transition-all text-sm font-medium flex flex-col items-center gap-2 ${
                imageAlign === option.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
              </svg>
              <span className="text-xs">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderTextColorPanel = () => {
    const textColor = block.styles.textColor || '#000000';
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 text-sm">Text Color</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => onStyleUpdate('textColor', e.target.value)}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => onStyleUpdate('textColor', e.target.value)}
                className="flex-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded focus:border-purple-400 focus:outline-none"
                placeholder="#000000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-gray-600">Quick Colors</label>
            <div className="grid grid-cols-6 gap-1">
              {['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'].map(color => (
                <button
                  key={color}
                  onClick={() => onStyleUpdate('textColor', color)}
                  className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  switch (panelType) {
    case 'margin': return renderSpacingPanel('margin');
    case 'padding': return renderSpacingPanel('padding');
    case 'background': return renderBackgroundPanel();
    case 'border': return renderBorderPanel();
    case 'textColor': return renderTextColorPanel();
    case 'imageAlign': return renderImageAlignPanel();
    default: return null;
  }
};

export default FloatingPanelContent;
