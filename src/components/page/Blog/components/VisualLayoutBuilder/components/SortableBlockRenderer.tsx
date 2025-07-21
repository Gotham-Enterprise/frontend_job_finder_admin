import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BlockRenderer from './BlockRenderer';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';

interface SortableBlockRendererProps {
  block: LayoutBlock;
  isSelected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  onContentUpdate?: (field: string, value: any) => void;
  onStyleUpdate?: (field: string, value: any) => void;
  onOpenSettings?: (type: 'image' | 'video' | 'paragraph' | 'button' | 'list', block: LayoutBlock) => void;
}

const DRAG_STATES = {
  idle: 'transition-all duration-200 ease-in-out',
  dragging: 'opacity-50 transform scale-105 z-50 transition-none shadow-2xl',
  over: 'ring-2 ring-blue-400 ring-opacity-50 shadow-lg'
};

const DRAG_HANDLE_ICON = 'M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z';

const SortableBlockRenderer: React.FC<SortableBlockRendererProps> = (props) => {
  const { block } = props;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({ id: block.id });

  const createDragStyle = () => ({
    transform: CSS.Transform.toString(transform),
    transition,
  });

  const createDragClasses = () => [
    isDragging ? DRAG_STATES.dragging : DRAG_STATES.idle,
    isOver ? DRAG_STATES.over : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={setNodeRef}
      style={createDragStyle()}
      className={`relative group ${createDragClasses()}`}
      {...attributes}
    >
      <div
        {...listeners}
        className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 hover:border-gray-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center z-10 shadow-md hover:shadow-lg"
        title="Drag to reorder"
      >
        <svg className="w-4 h-4 text-gray-500 hover:text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d={DRAG_HANDLE_ICON} />
        </svg>
      </div>
      
      <BlockRenderer {...props} />
    </div>
  );
};

export default SortableBlockRenderer;
