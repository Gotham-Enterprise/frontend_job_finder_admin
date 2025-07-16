import React from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';

interface FloatingPanelContentProps {
  panelType: string;
  block: LayoutBlock;
  onStyleUpdate: (field: string, value: any) => void;
}

const fontFamilies = [
  'Arial', 'Helvetica', 'Georgia', 'Times New Roman',
  'Verdana', 'Roboto', 'Open Sans', 'Poppins'
];

const fontWeights = [
  { value: '300', label: '300 - Light' },
  { value: 'normal', label: '400 - Normal' },
  { value: '500', label: '500 - Medium' },
  { value: 'bold', label: '700 - Bold' },
];

const textAlignments = [
  { value: 'left', label: 'Left', icon: '⬅' },
  { value: 'center', label: 'Center', icon: '⬌' },
  { value: 'right', label: 'Right', icon: '➡' },
  { value: 'justify', label: 'Justify', icon: '≡' },
];

const FloatingPanelContent: React.FC<FloatingPanelContentProps> = ({ panelType, block, onStyleUpdate }) => {
  const renderFontPanel = () => (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700 text-sm">Font Family</h4>
      <div className="grid grid-cols-2 gap-2">
        {fontFamilies.map((font) => (
          <button
            key={font}
            onClick={() => onStyleUpdate('fontFamily', font)}
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

  const renderWeightPanel = () => (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700 text-sm">Font Weight</h4>
      <div className="grid grid-cols-2 gap-2">
        {fontWeights.map((weight) => (
          <button
            key={weight.value}
            onClick={() => onStyleUpdate('fontWeight', weight.value)}
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

  const renderSizePanel = () => {
    const currentSize = parseInt(block.styles.fontSize?.replace('px', '') || '16');
    const updateSize = (newSize: number) => {
      onStyleUpdate('fontSize', `${Math.max(8, Math.min(72, newSize))}px`);
    };

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700 text-sm">Font Size</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateSize(currentSize - 1)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <input
            type="number"
            value={currentSize}
            onChange={(e) => updateSize(parseInt(e.target.value) || 16)}
            className="w-16 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-800 focus:border-purple-400 focus:outline-none"
            min="8"
            max="72"
          />
          <span className="text-xs text-gray-500">px</span>
          <button
            onClick={() => updateSize(currentSize + 1)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderColorPanel = () => (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700 text-sm">Text Color</h4>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={block.styles.textColor || '#000000'}
          onChange={(e) => onStyleUpdate('textColor', e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
        />
        <input
          type="text"
          value={block.styles.textColor || '#000000'}
          onChange={(e) => onStyleUpdate('textColor', e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-purple-400 focus:outline-none font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const renderAlignPanel = () => (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700 text-sm">Text Alignment</h4>
      <div className="grid grid-cols-2 gap-2">
        {textAlignments.map((align) => (
          <button
            key={align.value}
            onClick={() => onStyleUpdate('textAlign', align.value)}
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
    case 'font': return renderFontPanel();
    case 'weight': return renderWeightPanel();
    case 'size': return renderSizePanel();
    case 'color': return renderColorPanel();
    case 'align': return renderAlignPanel();
    case 'margin': return renderSpacingPanel('margin');
    case 'padding': return renderSpacingPanel('padding');
    default: return null;
  }
};

export default FloatingPanelContent;
