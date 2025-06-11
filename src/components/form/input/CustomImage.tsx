import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import React from 'react';

interface TemplateImageProps {
  node: ProseMirrorNode;
  updateAttributes: (attributes: Record<string, any>) => void;
  getPos: () => number;
}

const TemplateImageComponent: React.FC<TemplateImageProps> = ({ node, updateAttributes, getPos }) => {
  const { src, alt } = node.attrs;
  const isTemplate = node.attrs['data-template-image'] === 'true' || src?.includes('image-placeholder.jpg');

  const imageClick = () => {
    if (!isTemplate) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newSrc = e.target?.result as string;
          if (newSrc) {
            updateAttributes({
              src: newSrc,
              alt: file.name,
              'data-template-image': 'false'
            });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <img
      src={src}
      alt={alt || ''}
      onClick={imageClick}
      style={{
        cursor: isTemplate ? 'pointer' : 'default',
        border: isTemplate ? '2px dashed #ccc' : 'none',
        borderRadius: '8px',
        maxWidth: '100%',
        height: 'auto',
      }}
      title={isTemplate ? 'Click to replace this image' : alt}
      className="template-image"
    />
  );
};

export const CustomImage = Node.create({
  name: 'image',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      'data-template-image': {
        default: 'false',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TemplateImageComponent);
  },
});
