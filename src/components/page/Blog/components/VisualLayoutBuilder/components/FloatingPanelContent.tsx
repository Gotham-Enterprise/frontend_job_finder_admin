import React, { useState, useEffect } from 'react';
import { LayoutBlock, getAdBlockType, AdBlock } from '../../../../../../services/types/visualLayoutTypes';

interface FloatingPanelContentProps {
  panelType: string;
  block: LayoutBlock;
  onStyleUpdate: (field: string, value: any) => void;
}

const FloatingPanelContent: React.FC<FloatingPanelContentProps> = ({ panelType, block, onStyleUpdate }) => {
  const [fontSizeInput, setFontSizeInput] = useState((Number(block.styles.fontSize) || 16).toString());
  const [letterSpacingInput, setLetterSpacingInput] = useState((Number(block.styles.letterSpacing) || 0).toString());
  const [lineHeightInput, setLineHeightInput] = useState((Number(block.styles.lineHeight) || 1.5).toString());

  useEffect(() => {
    setFontSizeInput((Number(block.styles.fontSize) || 16).toString());
  }, [block.styles.fontSize]);

  useEffect(() => {
    setLetterSpacingInput((Number(block.styles.letterSpacing) || 0).toString());
  }, [block.styles.letterSpacing]);

  useEffect(() => {
    setLineHeightInput((Number(block.styles.lineHeight) || 1.5).toString());
  }, [block.styles.lineHeight]);

  const renderSpacingPanel = (type: 'margin' | 'padding') => {
    const value = block.styles[type] || { top: 0, right: 0, bottom: 0, left: 0 };
    const updateSpacing = (side: string, newValue: number) => {
      onStyleUpdate(type, { ...value, [side]: Math.max(0, newValue) });
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 max-w-[140px] mx-auto">
          {/* Top input */}
          <div></div>
          <input
            type="number"
            value={value.top}
            onChange={(e) => updateSpacing('top', parseInt(e.target.value) || 0)}
            className="w-14 px-2 py-2 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
            min="0"
          />
          <div></div>
          
          {/* Left input, Center indicator, Right input */}
          <input
            type="number"
            value={value.left}
            onChange={(e) => updateSpacing('left', parseInt(e.target.value) || 0)}
            className="w-14 px-2 py-2 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
            min="0"
          />
          <div className={`${type === 'margin' ? 'bg-gray-200' : 'bg-purple-100'} rounded flex items-center justify-center h-10 w-14`}>
            <span className={`text-sm font-medium ${type === 'margin' ? 'text-gray-600' : 'text-purple-600'}`}>
              {type === 'margin' ? 'M' : 'P'}
            </span>
          </div>
          <input
            type="number"
            value={value.right}
            onChange={(e) => updateSpacing('right', parseInt(e.target.value) || 0)}
            className="w-14 px-2 py-2 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
            min="0"
          />
          
          {/* Bottom input */}
          <div></div>
          <input
            type="number"
            value={value.bottom}
            onChange={(e) => updateSpacing('bottom', parseInt(e.target.value) || 0)}
            className="w-14 px-2 py-2 text-xs bg-gray-50 border border-gray-200 rounded text-center focus:border-purple-400 focus:outline-none"
            min="0"
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
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-2">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                placeholder="#ffffff"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-gray-600">Quick Colors</label>
            <div className="grid grid-cols-6 gap-2">
              {['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#000000'].map(color => (
                <button
                  key={color}
                  onClick={() => onStyleUpdate('backgroundColor', color)}
                  className="w-8 h-8 rounded-lg border-2 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{ 
                    backgroundColor: color,
                    borderColor: backgroundColor === color ? '#8b5cf6' : '#e2e8f0'
                  }}
                  title={color}
                />
              ))}
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
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-2">Width</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStyleUpdate('border', { ...border, width: Math.max(0, borderWidth - 1) })}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                value={borderWidth}
                onChange={(e) => onStyleUpdate('border', { ...border, width: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-16 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-center focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                min="0"
                max="20"
              />
              <button
                onClick={() => onStyleUpdate('border', { ...border, width: Math.min(20, borderWidth + 1) })}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-2">Style</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'solid', label: 'Solid' },
                { value: 'dashed', label: 'Dashed' },
                { value: 'dotted', label: 'Dotted' },
                { value: 'double', label: 'Double' }
              ].map(style => (
                <button
                  key={style.value}
                  onClick={() => onStyleUpdate('border', { ...border, style: style.value })}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                    borderStyle === style.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-2">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => onStyleUpdate('border', { ...border, color: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => onStyleUpdate('border', { ...border, color: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-2">Radius</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStyleUpdate('border', { ...border, radius: Math.max(0, borderRadius - 1) })}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                value={borderRadius}
                onChange={(e) => onStyleUpdate('border', { ...border, radius: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-16 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-center focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                min="0"
                max="50"
              />
              <button
                onClick={() => onStyleUpdate('border', { ...border, radius: Math.min(50, borderRadius + 1) })}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs text-gray-600">Quick Radius</label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 4, 8, 12, 16, 20, 24, 50].map(radius => (
                <button
                  key={radius}
                  onClick={() => onStyleUpdate('border', { ...border, radius })}
                  className={`px-2 py-2 text-xs font-medium rounded-lg border transition-all ${
                    borderRadius === radius
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {radius}px
                </button>
              ))}
            </div>
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

  const renderVideoAlignPanel = () => {
    const videoAlign = block.styles.videoAlign || 'center';
    
    const alignmentOptions = [
      { value: 'left', label: 'Left', icon: 'M3 6h18M3 12h12M3 18h18' },
      { value: 'center', label: 'Center', icon: 'M6 6h12M3 12h18M6 18h12' },
      { value: 'right', label: 'Right', icon: 'M3 6h18M9 12h12M3 18h18' }
    ];
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {alignmentOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onStyleUpdate('videoAlign', option.value)}
              className={`p-3 rounded-lg border transition-all text-sm font-medium flex flex-col items-center gap-2 ${
                videoAlign === option.value
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
    const isLinkAd = block.type === 'ad' && getAdBlockType((block.content as AdBlock['content']) || {}) === 'link';
    const colorField = isLinkAd ? 'linkColor' : 'textColor';
    const textColor = (block.styles as Record<string, string>)[colorField] || (isLinkAd ? '#2563eb' : '#000000');
    
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-2">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={textColor}
                onChange={(e) => onStyleUpdate(colorField, e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => onStyleUpdate(colorField, e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                placeholder={isLinkAd ? '#2563eb' : '#000000'}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-gray-600">Quick Colors</label>
            <div className="grid grid-cols-6 gap-2">
              {['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'].map(color => (
                <button
                  key={color}
                  onClick={() => onStyleUpdate(colorField, color)}
                  className="w-8 h-8 rounded-lg border-2 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{ 
                    backgroundColor: color,
                    borderColor: textColor === color ? '#8b5cf6' : '#e2e8f0'
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFontSizePanel = () => {
    const fontSize = Number(block.styles.fontSize) || 16;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (newValue === '' || /^\d+$/.test(newValue)) {
        setFontSizeInput(newValue);
        
      
        if (newValue !== '') {
          const parsedValue = parseInt(newValue);
          if (!isNaN(parsedValue) && parsedValue >= 8 && parsedValue <= 72) {
            onStyleUpdate('fontSize', parsedValue);
          } else if (parsedValue > 72) {
          
            setFontSizeInput('72');
            onStyleUpdate('fontSize', 72);
          }
        }
      }
    };

    const handleInputBlur = () => {
      // On blur, ensure we have a valid value within constraints
      if (fontSizeInput === '' || isNaN(parseInt(fontSizeInput))) {
        setFontSizeInput(fontSize.toString());
      } else {
        const parsedValue = parseInt(fontSizeInput);
        const clampedValue = Math.max(8, Math.min(72, parsedValue));
        setFontSizeInput(clampedValue.toString());
        onStyleUpdate('fontSize', clampedValue);
      }
    };
    
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-2">Size</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStyleUpdate('fontSize', Math.max(8, fontSize - 1))}
                disabled={fontSize <= 8}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                  fontSize <= 8
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="text"
                value={fontSizeInput}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="w-16 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-center focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                placeholder="16"
                inputMode="numeric"
                pattern="[0-9]*"
                title="Enter font size (8-72px)"
              />
              <button
                onClick={() => onStyleUpdate('fontSize', Math.min(72, fontSize + 1))}
                disabled={fontSize >= 72}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                  fontSize >= 72
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-gray-600">Quick Sizes</label>
            <div className="grid grid-cols-4 gap-2">
              {[12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                <button
                  key={size}
                  onClick={() => onStyleUpdate('fontSize', size)}
                  className={`px-2 py-2 text-xs font-medium rounded-lg border transition-all ${
                    fontSize === size
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLetterSpacingPanel = () => {
    const letterSpacing = Number(block.styles.letterSpacing) || 0;

    const handleLetterSpacingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (newValue === '' || /^-?\d*\.?\d*$/.test(newValue)) {
        setLetterSpacingInput(newValue);
        if (newValue !== '') {
          const parsedValue = parseFloat(newValue);
          if (!isNaN(parsedValue) && parsedValue >= -2 && parsedValue <= 5) {
            onStyleUpdate('letterSpacing', parsedValue);
          }
        }
      }
    };

    const handleLetterSpacingBlur = () => {
      if (letterSpacingInput === '' || isNaN(parseFloat(letterSpacingInput))) {
        setLetterSpacingInput(letterSpacing.toString());
      } else {
        const parsedValue = parseFloat(letterSpacingInput);
        const clampedValue = Math.max(-2, Math.min(5, parsedValue));
        setLetterSpacingInput(clampedValue.toString());
        onStyleUpdate('letterSpacing', clampedValue);
      }
    };
    
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-2">Spacing</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStyleUpdate('letterSpacing', Math.max(-2, letterSpacing - 0.1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="text"
                value={letterSpacingInput}
                onChange={handleLetterSpacingChange}
                onBlur={handleLetterSpacingBlur}
                className="w-16 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-center focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                inputMode="numeric"
              />
              <button
                onClick={() => onStyleUpdate('letterSpacing', Math.min(5, letterSpacing + 0.1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-gray-600">Presets</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: -0.5, label: 'Tight' },
                { value: 0, label: 'Normal' },
                { value: 0.5, label: 'Wide' },
                { value: 1, label: 'Wider' },
                { value: 2, label: 'Widest' }
              ].map(preset => (
                <button
                  key={preset.value}
                  onClick={() => onStyleUpdate('letterSpacing', preset.value)}
                  className={`px-2 py-2 text-xs font-medium rounded-lg border transition-all ${
                    Math.abs(letterSpacing - preset.value) < 0.05
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLineHeightPanel = () => {
    const lineHeight = Number(block.styles.lineHeight) || 1.5;

    const handleLineHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
        setLineHeightInput(newValue);
        if (newValue !== '') {
          const parsedValue = parseFloat(newValue);
          if (!isNaN(parsedValue) && parsedValue >= 0.8 && parsedValue <= 3) {
            onStyleUpdate('lineHeight', parsedValue);
          }
        }
      }
    };

    const handleLineHeightBlur = () => {
      if (lineHeightInput === '' || isNaN(parseFloat(lineHeightInput))) {
        setLineHeightInput(lineHeight.toString());
      } else {
        const parsedValue = parseFloat(lineHeightInput);
        const clampedValue = Math.max(0.8, Math.min(3, parsedValue));
        setLineHeightInput(clampedValue.toString());
        onStyleUpdate('lineHeight', clampedValue);
      }
    };
    
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-2">Height</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStyleUpdate('lineHeight', Math.max(0.8, lineHeight - 0.1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="text"
                value={lineHeightInput}
                onChange={handleLineHeightChange}
                onBlur={handleLineHeightBlur}
                className="w-16 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-center focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                inputMode="numeric"
              />
              <button
                onClick={() => onStyleUpdate('lineHeight', Math.min(3, lineHeight + 0.1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-gray-600">Presets</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 1, label: 'Tight' },
                { value: 1.25, label: 'Snug' },
                { value: 1.5, label: 'Normal' },
                { value: 1.75, label: 'Relaxed' },
                { value: 2, label: 'Loose' }
              ].map(preset => (
                <button
                  key={preset.value}
                  onClick={() => onStyleUpdate('lineHeight', preset.value)}
                  className={`px-2 py-2 text-xs font-medium rounded-lg border transition-all ${
                    Math.abs(lineHeight - preset.value) < 0.05
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
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
    case 'fontSize': return renderFontSizePanel();
    case 'letterSpacing': return renderLetterSpacingPanel();
    case 'lineHeight': return renderLineHeightPanel();
    case 'imageAlign': return renderImageAlignPanel();
    case 'videoAlign': return renderVideoAlignPanel();
    default: return null;
  }
};

export default FloatingPanelContent;
