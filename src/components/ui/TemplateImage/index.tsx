"use client";
import React, { useRef } from 'react';
import Image from 'next/image';

interface TemplateImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onImageChange?: (newSrc: string) => void;
}

const TemplateImage: React.FC<TemplateImageProps> = ({
  src,
  alt = "Template Image",
  className = "",
  style = {},
  onImageChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageClick = () => {
    fileInputRef.current?.click();
  };

  const fileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result && onImageChange) {
          onImageChange(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const defaultStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: 'auto',
    minHeight: '200px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '2px dashed #ccc',
    overflow: 'hidden',
    ...style
  };
  return (
    <>
      <div 
        className={`template-image ${className}`}
        style={defaultStyle}
        onClick={imageClick}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
        title="Click to upload your own image"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{
            objectFit: 'cover',
            borderRadius: '8px',
          }}
          unoptimized={src.startsWith('data:')} 
        />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={fileChange}
      />
    </>
  );
};

export default TemplateImage;
