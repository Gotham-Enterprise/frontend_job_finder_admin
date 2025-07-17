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
  },
  {
    type: 'video' as BlockType,
    label: 'Video',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Add Video'
  },
  {
    type: 'columns' as BlockType,
    label: 'Columns',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4M9 4v16M9 4h6M15 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4M15 4v16M9 4V2M15 4V2M9 20v2M15 20v2" />
      </svg>
    ),
    title: 'Add Columns'
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
