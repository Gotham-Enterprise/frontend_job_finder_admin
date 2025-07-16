import React from 'react';
import { LayoutBlock } from '../../../../../../services/types/visualLayoutTypes';

interface BlockRendererProps {
  block: LayoutBlock;
  isSelected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, isSelected, onClick, onRemove }) => {
  const renderBlockContent = () => {
    switch (block.type) {
      case 'heading':
        const headingLevel = (block.content as any)?.level || 2;
        const headingText = (block.content as any)?.text || 'Sample Heading';
        const headingStyle = {
          fontSize: block.styles.fontSize || '2rem',
          fontWeight: block.styles.fontWeight || 'bold',
          color: block.styles.textColor || '#000000',
          textAlign: block.styles.textAlign || 'left',
          fontFamily: block.styles.fontFamily || 'inherit',
        } as React.CSSProperties;

        const renderHeading = (Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => {
         
          if (headingText.includes('<a ')) {
            return (
              <Tag 
                style={headingStyle}
                dangerouslySetInnerHTML={{ __html: headingText }}
                onClick={(e) => {
               
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'A') {
                    e.stopPropagation();
                  }
                }}
              />
            );
          }
          return <Tag style={headingStyle}>{headingText}</Tag>;
        };

        switch (headingLevel) {
          case 1: return renderHeading('h1');
          case 2: return renderHeading('h2');
          case 3: return renderHeading('h3');
          case 4: return renderHeading('h4');
          case 5: return renderHeading('h5');
          case 6: return renderHeading('h6');
          default: return renderHeading('h2');
        }
      
      case 'paragraph':
        const paragraphText = (block.content as any)?.text || 'Sample paragraph text. Click to edit this content.';
        
        const paragraphStyle = {
          fontSize: block.styles.fontSize || '1rem',
          fontWeight: block.styles.fontWeight || 'normal',
          color: block.styles.textColor || '#000000',
          textAlign: block.styles.textAlign || 'left',
          fontFamily: block.styles.fontFamily || 'inherit',
        } as React.CSSProperties;

        // Check if text contains HTML links
        if (paragraphText.includes('<a ')) {
          return (
            <p 
              style={paragraphStyle}
              dangerouslySetInnerHTML={{ __html: paragraphText }}
              onClick={(e) => {
                // Allow link clicks to work
                const target = e.target as HTMLElement;
                if (target.tagName === 'A') {
                  e.stopPropagation();
                }
              }}
            />
          );
        }
        
        return (
          <p style={paragraphStyle}>
            {paragraphText}
          </p>
        );
      
      case 'image':
        const imageUrl = (block.content as any)?.url;
        return (
          <div className="w-full rounded-lg overflow-hidden bg-gray-100">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={(block.content as any)?.alt || 'Image'} 
                className="w-full h-48 object-cover"
                style={{
                  borderRadius: block.styles.border?.radius ? `${block.styles.border.radius}px` : '8px',
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Click to add image</p>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return <div className="text-gray-500">Unknown block type: {block.type}</div>;
    }
  };

  const getBorderStyle = () => {
    const border = block.styles.border;
    if (!border || !border.width) return {};
    
    return {
      border: `${border.width}px ${border.style || 'solid'} ${border.color || '#000000'}`,
      borderRadius: border.radius ? `${border.radius}px` : undefined,
    };
  };

  return (
    <div 
      onClick={onClick}
      className={`relative group cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'shadow-lg ring-2 ring-purple-200' : ''
      }`}
      style={{
        margin: block.styles.margin ? `${block.styles.margin.top}px ${block.styles.margin.right}px ${block.styles.margin.bottom}px ${block.styles.margin.left}px` : '0',
        padding: block.styles.padding ? `${block.styles.padding.top}px ${block.styles.padding.right}px ${block.styles.padding.bottom}px ${block.styles.padding.left}px` : '16px',
        backgroundColor: block.styles.backgroundColor || 'transparent',
        // Default border if no custom border is set
        ...(!(block.styles.border?.width) && {
          border: isSelected ? '2px solid #a855f7' : '2px solid #e5e7eb',
          borderRadius: '12px',
        }),
        // Custom border styles
        ...getBorderStyle(),
      }}
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
