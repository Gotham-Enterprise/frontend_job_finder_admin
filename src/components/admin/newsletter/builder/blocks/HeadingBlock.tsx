"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import type { HeadingBlock as HeadingBlockType, HeadingProps } from "../utils/blockTypes";
import { BlockWrapper } from "./BlockWrapper";

interface Props {
  block: HeadingBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onPropsChange?: (partial: Partial<HeadingProps>) => void;
}

const TAG_MAP: Record<1 | 2 | 3, "h1" | "h2" | "h3"> = { 1: "h1", 2: "h2", 3: "h3" };

export function HeadingBlock({ block, isSelected, onSelect, onDelete, onDuplicate, dragHandleProps, onPropsChange }: Props) {
  const { text, level, align, color, fontSize, bold, fontFamily } = block.props;
  const Tag = TAG_MAP[level];

  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.innerText = text || "";
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

  const commit = useCallback(() => {
    if (!editRef.current) return;
    onPropsChange?.({ text: editRef.current.innerText.trim() });
    setIsEditing(false);
  }, [onPropsChange]);

  const handleBlur = useCallback(() => {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      setIsEditing(false);
      return;
    }
    commit();
  }, [commit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Escape") { cancelledRef.current = true; editRef.current?.blur(); }
  }, [commit]);

  const tagStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    color,
    textAlign: align,
    fontWeight: bold ? 700 : 400,
    fontFamily,
    margin: 0,
    padding: "4px 0",
    lineHeight: 1.3,
    wordBreak: "break-word",
    outline: "none",
  };

  return (
    <BlockWrapper
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      label="Heading"
      dragHandleProps={dragHandleProps}
    >
      {isEditing ? (
        <>
          <Tag
            ref={editRef as any}
            contentEditable
            suppressContentEditableWarning
            style={{
              ...tagStyle,
              cursor: "text",
              boxShadow: "0 0 0 2px #60a5fa",
              borderRadius: "3px",
              padding: "4px 6px",
              minWidth: "60px",
              display: "block",
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
          <div style={{ fontSize: "10px", color: "#6b7280", textAlign: "center", marginTop: "4px" }}>
            ↵ Enter to save · Esc to cancel
          </div>
        </>
      ) : (
        <Tag
          style={{
            ...tagStyle,
            cursor: onPropsChange ? "text" : "default",
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (!onPropsChange) return;
            setIsEditing(true);
          }}
          title={onPropsChange ? "Double-click to edit" : undefined}
        >
          {text || "Heading text…"}
        </Tag>
      )}
    </BlockWrapper>
  );
}
