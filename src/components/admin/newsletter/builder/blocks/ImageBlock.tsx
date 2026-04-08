import React, { useRef } from "react";
import type { ImageBlock as ImageBlockType } from "../utils/blockTypes";
import { BlockWrapper } from "./BlockWrapper";

interface Props {
  block: ImageBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPropsChange: (partial: Partial<ImageBlockType["props"]>) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function ImageBlock({ block, isSelected, onSelect, onDelete, onDuplicate, onPropsChange, dragHandleProps }: Props) {
  const { src, alt, width, align, link, borderRadius, caption } = block.props;
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onPropsChange({ src: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  const alignStyle: React.CSSProperties = {
    textAlign: align,
  };

  return (
    <BlockWrapper
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      label="Image"
      dragHandleProps={dragHandleProps}
    >
      <div style={alignStyle}>
        {src ? (
          <>
            {link ? (
              <a href={link} target="_blank" rel="noopener noreferrer">
                <img
                  src={src}
                  alt={alt}
                  style={{
                    width: `${width}%`,
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: `${borderRadius}px`,
                    display: "inline-block",
                  }}
                />
              </a>
            ) : (
              <img
                src={src}
                alt={alt}
                style={{
                  width: `${width}%`,
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: `${borderRadius}px`,
                  display: "inline-block",
                }}
              />
            )}
            {caption && (
              <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0 0", textAlign: align }}>
                {caption}
              </p>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileRef.current?.click();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "8px",
              width: "100%",
              minHeight: "120px",
              border: "2px dashed #d1d5db",
              borderRadius: "8px",
              background: "#f9fafb",
              color: "#9ca3af",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            Click to upload image
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
    </BlockWrapper>
  );
}
