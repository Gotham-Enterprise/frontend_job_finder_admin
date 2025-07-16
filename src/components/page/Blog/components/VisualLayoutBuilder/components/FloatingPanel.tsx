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

  return (
    <div
      className="fixed bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 rounded-2xl p-4 z-[60] min-w-[250px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700 capitalize">{panelType}</span>
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
