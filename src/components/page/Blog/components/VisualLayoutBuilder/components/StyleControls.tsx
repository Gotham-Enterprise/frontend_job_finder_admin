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

const TEXT_STYLE_BUTTONS = [
  {
    key: 'fontWeight',
    icon: BoldIcon,
    title: 'Bold',
    activeValue: 'bold',
    inactiveValue: 'normal'
  },
  {
    key: 'fontStyle',
    icon: ItalicIcon,
    title: 'Italic',
    activeValue: 'italic',
    inactiveValue: 'normal'
  },
  {
    key: 'textDecoration',
    icon: UnderlineIcon,
    title: 'Underline',
    activeValue: 'underline',
    inactiveValue: 'none'
  }
];

const ALIGNMENT_OPTIONS = [
  { value: 'left', icon: AlignLeftIcon, title: 'Align Left' },
  { value: 'center', icon: AlignCenterIcon, title: 'Align Center' },
  { value: 'right', icon: AlignRightIcon, title: 'Align Right' }
];

const LIST_OPTIONS = [
  { icon: BulletListIcon, title: 'Bullet List (Coming Soon)', disabled: true },
  { icon: OrderedListIcon, title: 'Ordered List (Coming Soon)', disabled: true }
];

const SPACING_OPTIONS = [
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

const APPEARANCE_OPTIONS = [
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

const TYPOGRAPHY_CONTROLS = [
  {
    key: 'fontSize',
    label: 'Font Size',
    min: 8,
    max: 72,
    defaultValue: '16',
    unit: 'px'
  },
  {
    key: 'letterSpacing',
    label: 'Letter Spacing',
    min: -2,
    max: 10,
    defaultValue: '0',
    unit: 'px'
  },
  {
    key: 'lineHeight',
    label: 'Line Height',
    min: 12,
    max: 80,
    defaultValue: '24',
    unit: 'px'
  }
];

const StyleControls: React.FC<StyleControlsProps> = ({ block, onFloatingPanelOpen, onStyleUpdate }) => {
  const showTextFormatting = ['heading', 'paragraph'].includes(block.type);
  const showImageControls = block.type === 'image';
  const showVideoControls = block.type === 'video';

  const toggleTextStyle = (key: string, activeValue: string, inactiveValue: string) => {
    const currentValue = (block.styles as any)[key];
    const newValue = currentValue === activeValue ? inactiveValue : activeValue;
    onStyleUpdate(key, newValue);
  };

  const updateTextAlignment = (alignment: string) => {
    onStyleUpdate('textAlign', alignment);
  };

  const updateTypography = (key: string, value: string, unit: string) => {
    onStyleUpdate(key, `${value}${unit}`);
  };

  const getTypographyValue = (key: string, defaultValue: string, unit: string) => {
    const styleValue = (block.styles as any)[key];
    if (!styleValue) return defaultValue;
    return styleValue.replace(unit, '') || defaultValue;
  };

  const renderButton = (isActive: boolean, onClick: () => void, title: string, icon: React.ComponentType<any>) => {
    const Icon = icon;
    return (
      <button
        onClick={onClick}
        className={`w-8 h-8 flex items-center justify-center rounded transition-all border ${
          isActive
            ? 'bg-blue-100 text-blue-700 border-blue-300'
            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800'
        }`}
        title={title}
      >
        <Icon width={16} height={16} />
      </button>
    );
  };

  const renderTypographyControl = (control: typeof TYPOGRAPHY_CONTROLS[0]) => {
    const value = getTypographyValue(control.key, control.defaultValue, control.unit);
    const numericValue = parseInt(value);

    const handleIncrement = () => {
      const newValue = Math.min(numericValue + 1, control.max);
      updateTypography(control.key, newValue.toString(), control.unit);
    };

    const handleDecrement = () => {
      const newValue = Math.max(numericValue - 1, control.min);
      updateTypography(control.key, newValue.toString(), control.unit);
    };

    return (
      <div key={control.key} className="space-y-2">
        <label className="text-xs font-medium text-gray-600">{control.label}</label>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={numericValue <= control.min}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title={`Decrease ${control.label}`}
          >
            -
          </button>
          <div className="flex items-center gap-1 min-w-[60px] justify-center">
            <span className="text-sm font-medium text-gray-700">{numericValue}</span>
            <span className="text-xs text-gray-500">{control.unit}</span>
          </div>
          <button
            onClick={handleIncrement}
            disabled={numericValue >= control.max}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title={`Increase ${control.label}`}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-5 space-y-4">
      {showTextFormatting && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Text Formatting</h3>
          
          <div className="flex gap-2 mb-3">
            {TEXT_STYLE_BUTTONS.map((button) => {
              const isActive = (block.styles as any)[button.key] === button.activeValue;
              return (
                <div key={button.key}>
                  {renderButton(
                    isActive,
                    () => toggleTextStyle(button.key, button.activeValue, button.inactiveValue),
                    button.title,
                    button.icon
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Text Alignment</label>
            <div className="flex gap-2">
              {ALIGNMENT_OPTIONS.map((option) => {
                const isActive = block.styles.textAlign === option.value;
                return (
                  <div key={option.value}>
                    {renderButton(
                      isActive,
                      () => updateTextAlignment(option.value),
                      option.title,
                      option.icon
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">List Options</label>
            <div className="flex gap-2">
              {LIST_OPTIONS.map((option, index) => (
                <button
                  key={index}
                  className="w-8 h-8 flex items-center justify-center rounded transition-all border bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                  title={option.title}
                  disabled={option.disabled}
                >
                  <option.icon width={16} height={16} />
                </button>
              ))}
            </div>
          </div>

          {TYPOGRAPHY_CONTROLS.map(renderTypographyControl)}
        </div>
      )}

      {showImageControls && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Image Layout</h3>
          <button
            onClick={(e) => onFloatingPanelOpen('imageAlign', e)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm text-left"
            title="Set image alignment"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m0 0l4 4m0 0l-4 4m4-4H4" />
            </svg>
            <span>Align to page</span>
          </button>
        </div>
      )}

      {showVideoControls && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Video Layout</h3>
          <button
            onClick={(e) => onFloatingPanelOpen('videoAlign', e)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-all hover:shadow-sm text-left"
            title="Set video alignment"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Align to page</span>
          </button>
        </div>
      )}
      
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Spacing</h3>
        <div className="flex gap-2">
          {SPACING_OPTIONS.map((option) => (
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
          {APPEARANCE_OPTIONS.map((option) => (
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
