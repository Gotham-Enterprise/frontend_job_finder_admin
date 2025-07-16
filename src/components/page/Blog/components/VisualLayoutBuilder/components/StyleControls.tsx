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
  OrderedListIcon 
} from '../../../../../ui/icons';

interface StyleControlsProps {
  block: LayoutBlock;
  onFloatingPanelOpen: (panelType: string, event: React.MouseEvent) => void;
  onStyleUpdate: (field: string, value: any) => void;
}

const spacingButtons = [
  { key: 'margin', label: 'Margin' },
  { key: 'padding', label: 'Padding' },
];

const appearanceButtons = [
  { key: 'background', label: 'Background' },
  { key: 'border', label: 'Border' },
  { key: 'textColor', label: 'Text Color' },
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

          {/* List Options (for future implementation) */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">List Options</label>
            <div className="flex gap-2">
              <button
                onClick={() => console.log('Bullet list - to be implemented')}
                className="w-8 h-8 flex items-center justify-center rounded transition-all border bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                title="Bullet List (Coming Soon)"
                disabled
              >
                <BulletListIcon width={16} height={16} />
              </button>
              
              <button
                onClick={() => console.log('Ordered list - to be implemented')}
                className="w-8 h-8 flex items-center justify-center rounded transition-all border bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                title="Ordered List (Coming Soon)"
                disabled
              >
                <OrderedListIcon width={16} height={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Spacing</h3>
        <div className="grid grid-cols-2 gap-2">
          {spacingButtons.map((button) => (
            <button
              key={button.key}
              onClick={(e) => onFloatingPanelOpen(button.key, e)}
              className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm"
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Appearance</h3>
        <div className="space-y-2">
          {appearanceButtons.map((button) => (
            <button
              key={button.key}
              onClick={(e) => onFloatingPanelOpen(button.key, e)}
              className="w-full px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm text-left"
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StyleControls;
