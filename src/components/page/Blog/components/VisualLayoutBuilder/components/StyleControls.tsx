import React from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';

interface StyleControlsProps {
  block: LayoutBlock;
  onFloatingPanelOpen: (panelType: string, event: React.MouseEvent) => void;
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

const StyleControls: React.FC<StyleControlsProps> = ({ block, onFloatingPanelOpen }) => (
  <div className="p-5 space-y-4">
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

export default StyleControls;
