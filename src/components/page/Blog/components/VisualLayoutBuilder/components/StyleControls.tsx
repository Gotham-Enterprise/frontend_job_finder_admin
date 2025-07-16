import React from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon, 
  AlignLeftIcon, 
  AlignCenterIcon, 
  AlignRightIcon, 
  BulletListIcon, 
  OrderedListIcon,
  MarginIcon,
  PaddingIcon,
  BackgroundIcon,
  BorderIcon,
  TextColorIcon
} from '../../../../../ui/icons';

interface StyleControlsProps {
  block: LayoutBlock;
  onFloatingPanelOpen: (panelType: string, event: React.MouseEvent) => void;
  onStyleUpdate: (field: string, value: any) => void;
}

const spacingOptions = [
  { 
    key: 'margin', 
    label: 'Margin', 
    icon: MarginIcon,
    tooltip: 'Set margin spacing'
  },
  { 
    key: 'padding', 
    label: 'Padding', 
    icon: PaddingIcon,
    tooltip: 'Set padding spacing'
  }
];

const appearanceOptions = [
  { 
    key: 'background', 
    label: 'Background', 
    icon: BackgroundIcon,
    tooltip: 'Set background color'
  },
  { 
    key: 'border', 
    label: 'Border', 
    icon: BorderIcon,
    tooltip: 'Set border style'
  },
  { 
    key: 'textColor', 
    label: 'Text Color', 
    icon: TextColorIcon,
    tooltip: 'Set text color'
  }
];

const StyleControls: React.FC<StyleControlsProps> = ({ block, onFloatingPanelOpen, onStyleUpdate }) => {
  
  // Text formatting functions
  const toggleBold = () => {
    const currentWeight = block.styles.fontWeight;
    const newWeight = currentWeight === 'bold' ? 'normal' : 'bold';
    onStyleUpdate('fontWeight', newWeight);
  };

  const toggleItalic = () => {
    const currentStyle = block.styles.fontStyle;
    const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
    onStyleUpdate('fontStyle', newStyle);
  };

  const toggleUnderline = () => {
    const currentDecoration = block.styles.textDecoration;
    const newDecoration = currentDecoration === 'underline' ? 'none' : 'underline';
    onStyleUpdate('textDecoration', newDecoration);
  };

  // List functionality placeholders
  const createBulletList = () => {
    console.log('Bullet list functionality - coming soon');
    // Future implementation: Convert current text to bullet list
  };

  const createOrderedList = () => {
    console.log('Ordered list functionality - coming soon');
    // Future implementation: Convert current text to numbered list
  };

  const setTextAlignment = (alignment: 'left' | 'center' | 'right') => {
    onStyleUpdate('textAlign', alignment);
  };

  // Only show text formatting for text-based blocks
  const showTextFormatting = ['heading', 'paragraph'].includes(block.type);

  return (
    <div className="p-5 space-y-4">
      {showTextFormatting && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Text Formatting</h3>
          
          {/* Text Style Buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={toggleBold}
              className={`w-8 h-8 flex items-center justify-center rounded transition-all border ${
                block.styles.fontWeight === 'bold'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800'
              }`}
              title="Bold"
            >
              <BoldIcon width={16} height={16} />
            </button>
            
            <button
              onClick={toggleItalic}
              className={`w-8 h-8 flex items-center justify-center rounded transition-all border ${
                block.styles.fontStyle === 'italic'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800'
              }`}
              title="Italic"
            >
              <ItalicIcon width={16} height={16} />
            </button>
            
            <button
              onClick={toggleUnderline}
              className={`w-8 h-8 flex items-center justify-center rounded transition-all border ${
                block.styles.textDecoration === 'underline'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800'
              }`}
              title="Underline"
            >
              <UnderlineIcon width={16} height={16} />
            </button>
          </div>

          {/* Text Alignment Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Text Alignment</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTextAlignment('left')}
                className={`w-8 h-8 flex items-center justify-center rounded transition-all border ${
                  block.styles.textAlign === 'left'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800'
                }`}
                title="Align Left"
              >
                <AlignLeftIcon width={16} height={16} />
              </button>
              
              <button
                onClick={() => setTextAlignment('center')}
                className={`w-8 h-8 flex items-center justify-center rounded transition-all border ${
                  block.styles.textAlign === 'center'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800'
                }`}
                title="Align Center"
              >
                <AlignCenterIcon width={16} height={16} />
              </button>
              
              <button
                onClick={() => setTextAlignment('right')}
                className={`w-8 h-8 flex items-center justify-center rounded transition-all border ${
                  block.styles.textAlign === 'right'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800'
                }`}
                title="Align Right"
              >
                <AlignRightIcon width={16} height={16} />
              </button>
            </div>
          </div>

          {/* List Options */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">List Options</label>
            <div className="flex gap-2">
              <button
                onClick={createBulletList}
                className="w-8 h-8 flex items-center justify-center rounded transition-all border bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                title="Bullet List (Coming Soon)"
                disabled
              >
                <BulletListIcon width={16} height={16} />
              </button>
              
              <button
                onClick={createOrderedList}
                className="w-8 h-8 flex items-center justify-center rounded transition-all border bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                title="Ordered List (Coming Soon)"
                disabled
              >
                <OrderedListIcon width={16} height={16} />
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Font Size</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="range"
                  min="8"
                  max="72"
                  value={parseInt(block.styles.fontSize?.replace('px', '') || '16')}
                  onChange={(e) => onStyleUpdate('fontSize', `${e.target.value}px`)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((parseInt(block.styles.fontSize?.replace('px', '') || '16') - 8) / (72 - 8)) * 100}%, #e5e7eb ${((parseInt(block.styles.fontSize?.replace('px', '') || '16') - 8) / (72 - 8)) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              <div className="w-12">
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={parseInt(block.styles.fontSize?.replace('px', '') || '16')}
                  onChange={(e) => onStyleUpdate('fontSize', `${e.target.value}px`)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded text-center bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <span className="text-xs text-gray-500 w-6">px</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Spacing</h3>
        <div className="flex gap-2">
          {spacingOptions.map((option) => (
            <button
              key={option.key}
              onClick={(e) => onFloatingPanelOpen(option.key, e)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm"
              title={option.tooltip}
            >
              <option.icon width={16} height={16} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Appearance</h3>
        <div className="space-y-2">
          {appearanceOptions.map((option) => (
            <button
              key={option.key}
              onClick={(e) => onFloatingPanelOpen(option.key, e)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm text-left"
              title={option.tooltip}
            >
              <option.icon width={16} height={16} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StyleControls;
