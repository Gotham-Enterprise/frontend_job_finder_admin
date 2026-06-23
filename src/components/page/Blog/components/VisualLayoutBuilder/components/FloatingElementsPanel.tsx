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
    type: 'ad' as BlockType,
    label: 'Ad',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    color: 'bg-amber-500',
    description: 'Add a clickable ad with image and link'
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
        className="fixed left-6 top-24 p-2 rounded-md transition-colors bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl z-50 group"
        title="Show Elements Panel"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
