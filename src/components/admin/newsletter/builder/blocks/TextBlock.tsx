"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import type { TextBlock as TextBlockType, TextProps } from "../utils/blockTypes";
import { BlockWrapper } from "./BlockWrapper";

interface Props {
  block: TextBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onPropsChange?: (partial: Partial<TextProps>) => void;
}

export function TextBlock({ block, isSelected, onSelect, onDelete, onDuplicate, dragHandleProps, onPropsChange }: Props) {
  const { html, align, color, fontSize, lineHeight, bgColor, paddingTop, paddingBottom, paddingLeft, paddingRight } =
    block.props;

  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);

  const divStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    color,
    textAlign: align,
    lineHeight,
    backgroundColor: bgColor,
    padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
    wordBreak: "break-word",
    outline: "none",
    minHeight: "24px",
  };

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.innerHTML = html || "<p>Text content…</p>";
      editRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      cancelledRef.current = false;
    }
  }, [isEditing]);

  const handleBlur = useCallback(() => {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      setIsEditing(false);
      return;
    }
    if (!editRef.current) return;
    onPropsChange?.({ html: editRef.current.innerHTML });
    setIsEditing(false);
  }, [onPropsChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      cancelledRef.current = true;
      editRef.current?.blur();
    }
  }, []);

  return (
    <BlockWrapper
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      label="Text"
      dragHandleProps={dragHandleProps}
    >
      {isEditing ? (
        <>
          <div
            ref={editRef}
            contentEditable
            suppressContentEditableWarning
            className="newsletter-block-text"
            style={{
              ...divStyle,
              cursor: "text",
              boxShadow: "0 0 0 2px #60a5fa",
              borderRadius: "3px",
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
          <div style={{ fontSize: "10px", color: "#6b7280", textAlign: "center", marginTop: "4px" }}>
            Click outside to save · Esc to cancel
          </div>
        </>
      ) : (
        <div
          style={{
            ...divStyle,
            cursor: onPropsChange ? "text" : "default",
          }}
          className="newsletter-block-text"
          dangerouslySetInnerHTML={{ __html: html || "<p>Text content…</p>" }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (!onPropsChange) return;
            setIsEditing(true);
          }}
          title={onPropsChange ? "Double-click to edit" : undefined}
        />
      )}
    </BlockWrapper>
  );
}
