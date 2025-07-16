import React from 'react';
import { BlockType } from '../../../../../../services/types/visualLayoutTypes';

interface ElementsSidebarProps {
  onAddBlock: (type: BlockType) => void;
}

const sidebarElements = [
  {
    type: 'heading' as BlockType,
    label: 'Heading',
    icon: 'H',
    title: 'Add Heading'
  },
  {
    type: 'paragraph' as BlockType,
    label: 'Text',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
    title: 'Add Text'
  },
  {
    type: 'image' as BlockType,
    label: 'Image',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Add Image'
  }
];

const ElementsSidebar: React.FC<ElementsSidebarProps> = ({ onAddBlock }) => (
  <div className="fixed left-[255px] top-16 w-18 h-[calc(100vh-4rem)] bg-gray-100 border-r border-gray-300 flex flex-col items-center py-6 z-40">
    <div className="flex flex-col gap-6">
      {sidebarElements.map((element) => (
        <div key={element.type} className="flex flex-col items-center">
          <button
            onClick={() => onAddBlock(element.type)}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-all mb-1"
            title={element.title}
          >
            {typeof element.icon === 'string' ? (
              <span className="font-bold text-sm">{element.icon}</span>
            ) : (
              element.icon
            )}
          </button>
          <span className="text-xs text-gray-600 text-center font-medium">{element.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ElementsSidebar;
