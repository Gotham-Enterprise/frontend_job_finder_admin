import React, { useState } from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';

interface BlockRendererProps {
  block: LayoutBlock;
  isSelected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  onContentUpdate?: (field: string, value: any) => void;
  onStyleUpdate?: (field: string, value: any) => void;
}

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
type HeadingTag = typeof HEADING_TAGS[number];

const DEFAULT_STYLES = {
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'left' as const,
    fontFamily: 'inherit',
  },
  paragraph: {
    fontSize: '1rem',
    fontWeight: 'normal',
    color: '#000000',
    textAlign: 'left' as const,
    fontFamily: 'inherit',
  },
  image: {
    borderRadius: '8px',
    height: '192px',
  },
};

const BlockRenderer: React.FC<BlockRendererProps> = ({ 
  block, 
  isSelected, 
  onClick, 
  onRemove, 
  onContentUpdate, 
  onStyleUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const createStyle = (type: 'heading' | 'paragraph') => ({
    fontSize: block.styles.fontSize || DEFAULT_STYLES[type].fontSize,
    fontWeight: block.styles.fontWeight || DEFAULT_STYLES[type].fontWeight,
    fontStyle: block.styles.fontStyle || 'normal',
    textDecoration: block.styles.textDecoration || 'none',
    color: block.styles.textColor || DEFAULT_STYLES[type].color,
    textAlign: block.styles.textAlign || DEFAULT_STYLES[type].textAlign,
    fontFamily: block.styles.fontFamily || DEFAULT_STYLES[type].fontFamily,
  } as React.CSSProperties);



  const startEditing = (currentText: string) => {
    setEditValue(currentText);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (onContentUpdate) {
      onContentUpdate('text', editValue);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const preventClickPropagation = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      e.stopPropagation();
    }
  };

  const renderEditableHeading = () => {
    const level = (block.content as any)?.level || 2;
    const text = (block.content as any)?.text || 'Sample Heading';
    const style = createStyle('heading');
    const Tag = HEADING_TAGS[Math.min(Math.max(level - 1, 0), 5)] as HeadingTag;

    if (isEditing) {
      return (
        <div>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            style={style}
            className="w-full bg-transparent border-none outline-none"
            autoFocus
          />
        </div>
      );
    }

    if (text.includes('<a ')) {
      return (
        <Tag 
          style={style}
          dangerouslySetInnerHTML={{ __html: text }}
          onClick={preventClickPropagation}
          onDoubleClick={() => startEditing(text.replace(/<[^>]*>/g, ''))}
        />
      );
    }

    return (
      <Tag 
        style={style}
        onDoubleClick={() => startEditing(text)}
      >
        {text}
      </Tag>
    );
  };

  const renderEditableParagraph = () => {
    const text = (block.content as any)?.text || 'Sample paragraph text. Click to edit this content.';
    const style = createStyle('paragraph');

    if (isEditing) {
      return (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') cancelEdit();
          }}
          style={style}
          className="w-full bg-transparent border-none outline-none resize-none"
          rows={4}
          autoFocus
        />
      );
    }

    if (text.includes('<a ')) {
      return (
        <p 
          style={style}
          dangerouslySetInnerHTML={{ __html: text }}
          onClick={preventClickPropagation}
          onDoubleClick={() => startEditing(text.replace(/<[^>]*>/g, ''))}
        />
      );
    }

    return (
      <p 
        style={style}
        onDoubleClick={() => startEditing(text)}
      >
        {text}
      </p>
    );
  };

  const renderImage = () => {
    const imageUrl = (block.content as any)?.url;
    const altText = (block.content as any)?.alt || 'Image';
    
    const imageStyle = {
      borderRadius: block.styles.border?.radius ? `${block.styles.border.radius}px` : DEFAULT_STYLES.image.borderRadius,
    };

    if (!imageUrl) {
      return (
        <div className="w-full bg-gray-200 rounded flex items-center justify-center" style={{ height: DEFAULT_STYLES.image.height }}>
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Click to add image</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full rounded-lg overflow-hidden bg-gray-100">
        <img 
          src={imageUrl} 
          alt={altText}
          className="w-full object-cover"
          style={{
            ...imageStyle,
            height: DEFAULT_STYLES.image.height,
          }}
        />
      </div>
    );
  };

  const BLOCK_RENDERERS = {
    heading: renderEditableHeading,
    paragraph: renderEditableParagraph,
    image: renderImage,
  };

  const renderBlockContent = () => {
    const renderer = BLOCK_RENDERERS[block.type as keyof typeof BLOCK_RENDERERS];
    return renderer ? renderer() : <div className="text-gray-500">Unknown block type: {block.type}</div>;
  };

  const createBorderStyle = () => {
    const border = block.styles.border;
    if (!border?.width) return {};
    
    return {
      border: `${border.width}px ${border.style || 'solid'} ${border.color || '#000000'}`,
      borderRadius: border.radius ? `${border.radius}px` : undefined,
    };
  };

  const createContainerStyle = () => {
    const margin = block.styles.margin;
    const padding = block.styles.padding;
    const hasCustomBorder = block.styles.border?.width;
    
    return {
      margin: margin ? `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px` : '0',
      padding: padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : '16px',
      backgroundColor: block.styles.backgroundColor || 'transparent',
      ...(!hasCustomBorder && {
        border: isSelected ? '2px solid #a855f7' : '2px solid #e5e7eb',
        borderRadius: '12px',
      }),
      ...createBorderStyle(),
    };
  };

  return (
    <div 
      onClick={onClick}
      className={`relative group cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'shadow-lg ring-2 ring-purple-200' : ''
      }`}
      style={createContainerStyle()}
    >
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm border">
          {block.type}
        </span>
      </div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {renderBlockContent()}
    </div>
  );
};

export default BlockRenderer;
