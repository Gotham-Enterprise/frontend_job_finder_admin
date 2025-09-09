import React, { memo, useCallback, useRef } from 'react';
import { ButtonBlock } from '@/services/types/visualLayoutTypes';
import { 
  BUTTON_VARIANTS, 
  BUTTON_SIZES, 
  BUTTON_WIDTHS, 
  BUTTON_ALIGNMENTS, 
  LINK_TARGETS 
} from '../utils/buttonUtils';
import { processHtmlEntities } from '../utils/textUtils';

interface ButtonSettingsProps {
  block: ButtonBlock;
  onContentUpdate: (field: string, value: any) => void;
  onStyleUpdate?: (field: string, value: any) => void;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  className?: string;
}

const SelectField: React.FC<SelectFieldProps> = memo(({ 
  label, 
  value, 
  onChange, 
  options, 
  className = "w-full" 
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-100 transition-all"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
));

SelectField.displayName = 'SelectField';

const ButtonSettings: React.FC<ButtonSettingsProps> = memo(({ 
  block, 
  onContentUpdate, 
  onStyleUpdate 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Handler for button text changes with HTML entity processing
  const handleButtonTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    const { text: processedText, newCursorPosition } = processHtmlEntities(value, cursorPosition);
    
    if (processedText !== value) {
      // HTML entity was processed
      onContentUpdate('text', processedText);
      
      // Set cursor position after state update
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    } else {
      // No entity processing needed, update normally
      onContentUpdate('text', value);
    }
  }, [onContentUpdate]);
  const selectFields = [
    {
      label: 'Style',
      value: block.content.variant,
      field: 'variant',
      options: BUTTON_VARIANTS,
    },
    {
      label: 'Size',
      value: block.content.size,
      field: 'size',
      options: BUTTON_SIZES,
    },
    {
      label: 'Width',
      value: block.content.width,
      field: 'width',
      options: BUTTON_WIDTHS,
    },
    {
      label: 'Position',
      value: block.content.alignment,
      field: 'alignment',
      options: BUTTON_ALIGNMENTS,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What It Says</label>
        <input
          ref={inputRef}
          type="text"
          value={block.content.text}
          onChange={handleButtonTextChange}
          placeholder="Enter button text..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Where It Goes</label>
        <input
          type="url"
          value={block.content.url || ''}
          onChange={(e) => onContentUpdate('url', e.target.value)}
          placeholder="https://example.com"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
        />
      </div>

      <SelectField
        label="Open Link In"
        value={block.content.target || '_self'}
        onChange={(value) => onContentUpdate('target', value)}
        options={LINK_TARGETS}
      />

      <div className="grid grid-cols-2 gap-3">
        {selectFields.slice(0, 2).map((field) => (
          <SelectField
            key={field.field}
            label={field.label}
            value={field.value}
            onChange={(value) => onContentUpdate(field.field, value)}
            options={field.options}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {selectFields.slice(2).map((field) => (
          <SelectField
            key={field.field}
            label={field.label}
            value={field.value}
            onChange={(value) => onContentUpdate(field.field, value)}
            options={field.options}
          />
        ))}
      </div>

      {block.content.width === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Width (px)</label>
          <input
            type="number"
            value={block.content.customWidth || 200}
            onChange={(e) => onContentUpdate('customWidth', parseInt(e.target.value))}
            min="50"
            max="800"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Button Colors</h4>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Background Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={block.styles?.backgroundColor || '#3b82f6'}
              onChange={(e) => onStyleUpdate?.('backgroundColor', e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={block.styles?.backgroundColor || '#3b82f6'}
              onChange={(e) => onStyleUpdate?.('backgroundColor', e.target.value)}
              placeholder="#3b82f6"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={block.styles?.textColor || '#ffffff'}
              onChange={(e) => onStyleUpdate?.('textColor', e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={block.styles?.textColor || '#ffffff'}
              onChange={(e) => onStyleUpdate?.('textColor', e.target.value)}
              placeholder="#ffffff"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Border Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={block.styles?.border?.color || 'transparent'}
              onChange={(e) => onStyleUpdate?.('border', { ...block.styles?.border, color: e.target.value })}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={block.styles?.border?.color || 'transparent'}
              onChange={(e) => onStyleUpdate?.('border', { ...block.styles?.border, color: e.target.value })}
              placeholder="transparent"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Border Width</label>
          <input
            type="number"
            value={block.styles?.border?.width || 0}
            onChange={(e) => onStyleUpdate?.('border', { ...block.styles?.border, width: parseInt(e.target.value) })}
            min="0"
            max="10"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Border Radius</label>
          <input
            type="number"
            value={block.styles?.border?.radius || 6}
            onChange={(e) => onStyleUpdate?.('border', { ...block.styles?.border, radius: parseInt(e.target.value) })}
            min="0"
            max="50"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>
    </div>
  );
});

ButtonSettings.displayName = 'ButtonSettings';

export default ButtonSettings;
