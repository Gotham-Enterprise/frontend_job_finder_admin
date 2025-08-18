import React from 'react';

interface FloatingPanelProps {
  isVisible: boolean;
  position: { x: number; y: number };
  panelType: string | null;
  onClose: () => void;
  children: React.ReactNode;
}

const FloatingPanel: React.FC<FloatingPanelProps> = ({
  isVisible,
  position,
  panelType,
  onClose,
  children
}) => {
  if (!isVisible || !panelType) return null;

  const getPanelTitle = (type: string) => {
    const titleMap: { [key: string]: string } = {
      'textColor': 'Text Color',
      'backgroundColor': 'Background Color',
      'border': 'Border',
      'margin': 'Margin',
      'padding': 'Padding',
      'fontSize': 'Font Size',
      'fontWeight': 'Font Weight',
      'fontFamily': 'Font Family',
      'textAlign': 'Text Align',
      'letterSpacing': 'Letter Spacing',
      'lineHeight': 'Line Height'
    };
    return titleMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div
      className="fixed bg-white shadow-2xl border border-gray-200 rounded-2xl p-4 z-[50] min-w-[280px] max-w-[350px]"
      style={{
        left: `${Math.min(position.x, window.innerWidth - 350)}px`,
        top: `${Math.min(position.y, window.innerHeight - 400)}px`,
        transform: position.x > window.innerWidth - 350 ? 'translateX(-100%)' : 'none'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">{getPanelTitle(panelType)}</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  );
};

export default FloatingPanel;
