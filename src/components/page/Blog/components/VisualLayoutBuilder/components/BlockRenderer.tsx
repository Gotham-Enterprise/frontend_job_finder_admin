import React, { useState, useEffect, useRef } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 80)}px`;
    }
  }, [isEditing, editValue]);

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
            style={{
              ...style,
              minHeight: '1.2em',
              overflow: 'visible',
            }}
            className="w-full bg-transparent border-none outline-none"
            autoFocus
          />
        </div>
      );
    }

    if (text.includes('<a ')) {
      return (
        <Tag 
          style={{
            ...style,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            lineHeight: '1.3'
          }}
          dangerouslySetInnerHTML={{ __html: text }}
          onClick={preventClickPropagation}
          onDoubleClick={() => startEditing(text.replace(/<[^>]*>/g, ''))}
        />
      );
    }

    return (
      <Tag 
        style={{
          ...style,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          lineHeight: '1.3'
        }}
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
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') cancelEdit();
          }}
          style={{
            ...style,
            minHeight: '80px',
            resize: 'none',
            overflow: 'hidden',
          }}
          className="w-full bg-transparent border-none outline-none resize-none"
          autoFocus
          onInput={(e) => {
         
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.max(target.scrollHeight, 80)}px`;
          }}
        />
      );
    }

    if (text.includes('<a ')) {
      return (
        <p 
          style={{
            ...style,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            lineHeight: '1.6'
          }}
          dangerouslySetInnerHTML={{ __html: text }}
          onClick={preventClickPropagation}
          onDoubleClick={() => startEditing(text.replace(/<[^>]*>/g, ''))}
        />
      );
    }

    return (
      <p 
        style={{
          ...style,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          lineHeight: '1.6'
        }}
        onDoubleClick={() => startEditing(text)}
      >
        {text}
      </p>
    );
  };

  const renderImage = () => {
    const imageUrl = (block.content as any)?.url;
    const altText = (block.content as any)?.alt || 'Image';
    const imageWidth = block.styles.width || 100;
    const imageHeight = block.styles.height || 400;
    const widthUnit = block.styles.widthUnit || '%';
    const heightUnit = block.styles.heightUnit || 'px';
    const borderRadius = block.styles.border?.radius || 8;
    
    const imageStyle = {
      width: `${imageWidth}${widthUnit}`,
      height: `${imageHeight}${heightUnit}`,
      borderRadius: `${borderRadius}px`,
      objectFit: 'cover' as const,
      display: 'block',
    };

    if (!imageUrl) {
      return (
        <div 
          className="bg-gray-200 rounded flex items-center justify-center mx-auto" 
          style={{ 
            width: `${imageWidth}${widthUnit}`, 
            height: `${imageHeight}${heightUnit}`,
            borderRadius: `${borderRadius}px`,
            display: 'block'
          }}
        >
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Click to add image</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <img 
          src={imageUrl} 
          alt={altText}
          style={imageStyle}
          className="border border-gray-200 mx-auto"
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
    
    const defaultMargin = block.type === 'image' ? { top: 16, right: 0, bottom: 16, left: 0 } : { top: 8, right: 0, bottom: 8, left: 0 };
    const actualMargin = margin || defaultMargin;
    
    return {
      margin: `${actualMargin.top || 0}px ${actualMargin.right || 0}px ${actualMargin.bottom || 0}px ${actualMargin.left || 0}px`,
      padding: padding ? `${padding.top || 0}px ${padding.right || 0}px ${padding.bottom || 0}px ${padding.left || 0}px` : '0px',
      backgroundColor: block.styles.backgroundColor || 'transparent',
      minHeight: 'auto',
      overflow: 'hidden',
      position: 'relative' as const,
      width: '100%',
      border: isSelected 
        ? '2px solid #a855f7' 
        : 'transparent',
      borderRadius: hasCustomBorder && block.styles.border?.radius 
        ? `${block.styles.border.radius}px` 
        : '8px',
      ...createBorderStyle(),
    };
  };

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`relative group cursor-pointer transition-all duration-200 block clear-both ${
        isSelected ? 'shadow-lg ring-2 ring-purple-200' : 'hover:border-gray-300'
      }`}
      style={createContainerStyle()}
    >
      <div className={`absolute top-2 left-2 transition-opacity duration-200 ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
      }`}>
        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm border">
          {block.type}
        </span>
      </div>
      
      <div className={`absolute top-2 right-2 transition-opacity duration-200 ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
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
