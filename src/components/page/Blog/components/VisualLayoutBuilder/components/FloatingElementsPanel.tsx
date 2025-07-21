import React, { useState } from 'react';
import { BlockType } from '../../../../../../services/types/visualLayoutTypes';

interface FloatingElementsPanelProps {
  onAddBlock: (type: BlockType) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const elements = [
  {
    type: 'heading' as BlockType,
    label: 'Heading',
    icon: 'H',
    color: 'bg-blue-500',
    description: 'Add a title or heading'
  },
  {
    type: 'paragraph' as BlockType,
    label: 'Text',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
    color: 'bg-gray-500',
    description: 'Add a paragraph of text'
  },
  {
    type: 'image' as BlockType,
    label: 'Image',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-green-500',
    description: 'Add an image or photo'
  },
  {
    type: 'video' as BlockType,
    label: 'Video',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-red-500',
    description: 'Add a video'
  },
  {
    type: 'list' as BlockType,
    label: 'List',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    color: 'bg-orange-500',
    description: 'Add a bulleted or numbered list'
  },
  {
    type: 'quote' as BlockType,
    label: 'Quote',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: 'bg-yellow-500',
    description: 'Add a quote or citation'
  },
  {
    type: 'button' as BlockType,
    label: 'Button',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
    color: 'bg-purple-500',
    description: 'Add a call-to-action button'
  },
  {
    type: 'column' as BlockType,
    label: 'Column',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
    color: 'bg-indigo-500',
    description: 'Add column layout'
  }
];

const FloatingElementsPanel: React.FC<FloatingElementsPanelProps> = ({ 
  onAddBlock, 
  isVisible, 
  onToggle 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 150, y: 80 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-6 top-24 w-12 h-12 bg-white border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 group"
        title="Show Elements Panel"
      >
        <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className={`fixed bg-white rounded-xl shadow-lg z-50 transition-all duration-200 ${
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: 'auto',
        minWidth: '600px',
        maxWidth: '800px'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Elements Container with Close Button */}
      <div className="p-2 relative">
        <div className="flex gap-2 overflow-x-auto">
          {elements.map((element) => (
            <button
              key={element.type}
              onClick={(e) => {
                e.stopPropagation();
                onAddBlock(element.type);
              }}
              className="group flex flex-col items-center p-3 text-center hover:bg-gray-50 rounded-lg transition-all duration-200 flex-shrink-0 min-w-[70px]"
              title={element.description}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                {typeof element.icon === 'string' ? (
                  <span className="text-gray-600 font-bold text-lg">{element.icon}</span>
                ) : (
                  <div className="text-gray-600">{element.icon}</div>
                )}
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 whitespace-nowrap">
                {element.label}
              </span>
            </button>
          ))}
          
          {/* Close Button positioned at the end of elements */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="group flex flex-col items-center p-3 text-center hover:bg-gray-50 rounded-lg transition-all duration-200 flex-shrink-0 min-w-[70px]"
            title="Hide Elements Panel"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 whitespace-nowrap">
              Close
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingElementsPanel;
