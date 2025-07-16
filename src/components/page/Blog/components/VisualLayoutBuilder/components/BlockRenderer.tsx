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

        switch (headingLevel) {
          case 1: return <h1 style={headingStyle}>{headingText}</h1>;
          case 2: return <h2 style={headingStyle}>{headingText}</h2>;
          case 3: return <h3 style={headingStyle}>{headingText}</h3>;
          case 4: return <h4 style={headingStyle}>{headingText}</h4>;
          case 5: return <h5 style={headingStyle}>{headingText}</h5>;
          case 6: return <h6 style={headingStyle}>{headingText}</h6>;
          default: return <h2 style={headingStyle}>{headingText}</h2>;
        }
      
      case 'paragraph':
        return (
          <p 
            style={{
              fontSize: block.styles.fontSize || '1rem',
              fontWeight: block.styles.fontWeight || 'normal',
              color: block.styles.textColor || '#000000',
              textAlign: block.styles.textAlign || 'left',
              fontFamily: block.styles.fontFamily || 'inherit',
            }}
          >
            {(block.content as any)?.text || 'Sample paragraph text. Click to edit this content.'}
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

  return (
    <div 
      onClick={onClick}
      className={`relative group p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'border-purple-500 bg-purple-50/30 shadow-lg ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      style={{
        margin: block.styles.margin ? `${block.styles.margin.top}px ${block.styles.margin.right}px ${block.styles.margin.bottom}px ${block.styles.margin.left}px` : '0',
        padding: block.styles.padding ? `${block.styles.padding.top}px ${block.styles.padding.right}px ${block.styles.padding.bottom}px ${block.styles.padding.left}px` : '16px',
        backgroundColor: block.styles.backgroundColor || 'transparent',
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
