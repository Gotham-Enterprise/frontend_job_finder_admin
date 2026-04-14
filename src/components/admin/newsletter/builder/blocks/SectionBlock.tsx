"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { nanoid } from "nanoid";
import type {
  SectionBlock as SectionBlockType,
  SectionColumn,
  EmailBlock,
  ColumnBlockType,
} from "../utils/blockTypes";
import { COLUMN_PRESET_WIDTHS } from "../utils/blockTypes";
import { createBlock } from "../utils/blockDefaults";
import { BlockWrapper } from "./BlockWrapper";

// ---- Column block mini-renderers (lightweight, no wrapper) ----

function renderColumnBlockPreview(block: EmailBlock): React.ReactNode {
  switch (block.type) {
    case "heading": {
      const { text, fontSize, color, align, bold } = block.props;
      return (
        <div
          style={{
            fontSize: `${Math.min(fontSize, 22)}px`,
            color,
            textAlign: align,
            fontWeight: bold ? 700 : 400,
            lineHeight: 1.3,
            wordBreak: "break-word",
          }}
        >
          {text || "Heading…"}
        </div>
      );
    }
    case "text": {
      const { html, align, color, fontSize, lineHeight, bgColor, paddingTop, paddingBottom, paddingLeft, paddingRight } =
        block.props;
      return (
        <div
          style={{
            fontSize: `${fontSize}px`,
            color,
            textAlign: align,
            lineHeight,
            backgroundColor: bgColor,
            padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
            wordBreak: "break-word",
          }}
          dangerouslySetInnerHTML={{ __html: html || "<p>Text content…</p>" }}
        />
      );
    }
    case "image": {
      const { src, alt, width, align, borderRadius } = block.props;
      return (
        <div style={{ textAlign: align }}>
          {src ? (
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
          ) : (
            <div
              style={{
                width: "100%",
                height: "60px",
                border: "2px dashed #d1d5db",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: "11px",
                background: "#f9fafb",
              }}
            >
              No image
            </div>
          )}
        </div>
      );
    }
    case "button": {
      const { label, align, bgColor, textColor, borderRadius, paddingTop, paddingBottom, paddingLeft, paddingRight } =
        block.props;
      return (
        <div style={{ textAlign: align }}>
          <span
            style={{
              display: "inline-block",
              backgroundColor: bgColor,
              color: textColor,
              borderRadius: `${borderRadius}px`,
              padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {label || "Button"}
          </span>
        </div>
      );
    }
    case "quote": {
      const { html, borderColor, bgColor, textColor, paddingTop, paddingBottom, paddingLeft, paddingRight } = block.props;
      return (
        <div
          style={{
            backgroundColor: bgColor,
            borderLeft: `4px solid ${borderColor}`,
            color: textColor,
            padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
            fontSize: "13px",
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: html || "<p>Quote…</p>" }}
        />
      );
    }
    case "html": {
      const { html, paddingTop, paddingBottom, paddingLeft, paddingRight } = block.props;
      return (
        <div
          style={{
            padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
            overflow: "hidden",
            maxWidth: "100%",
            fontSize: "12px",
          }}
          dangerouslySetInnerHTML={{ __html: html || "<p>HTML…</p>" }}
        />
      );
    }
    default:
      return null;
  }
}

// ---- Sortable column child block ----

const COLUMN_BLOCK_LABELS: Record<ColumnBlockType, string> = {
  heading: "Heading",
  text: "Text",
  image: "Image",
  button: "Button",
  html: "HTML",
  quote: "Quote",
};

interface SortableColumnChildProps {
  block: EmailBlock;
  sectionId: string;
  columnIndex: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableColumnChild({ block, sectionId, columnIndex, isSelected, onSelect, onDelete, onDuplicate }: SortableColumnChildProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { type: "column-child", sectionId, columnIndex, blockId: block.id },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    marginBottom: "8px",
    position: "relative",
  };

  const label = block.type in COLUMN_BLOCK_LABELS
    ? COLUMN_BLOCK_LABELS[block.type as ColumnBlockType]
    : block.type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Mini toolbar */}
      <div
        style={{
          position: "absolute",
          top: "-22px",
          left: 0,
          display: "flex",
          alignItems: "center",
          gap: "3px",
          opacity: isSelected ? 1 : 0,
          pointerEvents: isSelected ? "auto" : "none",
          transition: "opacity 0.1s",
          zIndex: 20,
        }}
        className="group-hover/col-child:opacity-100 group-hover/col-child:pointer-events-auto"
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            padding: "1px 5px",
            background: "#3b82f6",
            color: "#fff",
            borderRadius: "3px",
            fontSize: "10px",
            fontWeight: 600,
            cursor: "grab",
            userSelect: "none",
          }}
        >
          <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
            <circle cx="3" cy="3" r="1" /><circle cx="7" cy="3" r="1" />
            <circle cx="3" cy="7" r="1" /><circle cx="7" cy="7" r="1" />
          </svg>
          {label}
        </div>
        {/* Duplicate */}
        <button
          type="button"
          title="Duplicate"
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "20px", height: "20px",
            background: "#6b7280", color: "#fff", border: "none",
            borderRadius: "3px", cursor: "pointer",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        {/* Delete */}
        <button
          type="button"
          title="Delete"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "20px", height: "20px",
            background: "#ef4444", color: "#fff", border: "none",
            borderRadius: "3px", cursor: "pointer",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      </div>

      {/* Block content */}
      <div
        style={{
          outline: isSelected ? "2px solid #3b82f6" : "2px solid transparent",
          borderRadius: "4px",
          transition: "outline-color 0.1s",
          cursor: "pointer",
          padding: "4px",
          minHeight: "24px",
        }}
      >
        {renderColumnBlockPreview(block)}
      </div>
    </div>
  );
}

// ---- Add block picker ----

const ADD_BLOCK_OPTIONS: { type: ColumnBlockType; label: string; icon: React.ReactNode }[] = [
  {
    type: "heading",
    label: "Heading",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M4 12h16M4 6h16M4 18h10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: "text",
    label: "Text",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M4 6h16M4 10h12M4 14h14M4 18h10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: "image",
    label: "Image",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    type: "button",
    label: "Button",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <rect x="2" y="8" width="20" height="8" rx="4" />
        <path d="M9 12h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: "quote",
    label: "Quote",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M3 8h4v5H3V8zM13 8h4v5h-4V8z" />
      </svg>
    ),
  },
  {
    type: "html",
    label: "HTML",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M8 6L4 12l4 6M16 6l4 6-4 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

interface AddBlockPickerProps {
  onAdd: (type: ColumnBlockType) => void;
}

function AddBlockPicker({ onAdd }: AddBlockPickerProps) {
  const [open, setOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close when canvas scrolls (fixed popup won't follow)
  useEffect(() => {
    if (!open) return;
    function onScroll() { setOpen(false); }
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [open]);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const btn = buttonRef.current.getBoundingClientRect();
      const popupW = 170;
      // Position above the button: bottom edge of popup = button top - 6px
      const bottom = window.innerHeight - btn.top + 6;
      // Center horizontally over the button, clamped to viewport
      let left = btn.left + btn.width / 2 - popupW / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - popupW - 8));
      setPopupStyle({ position: "fixed", bottom, left, width: `${popupW}px`, zIndex: 9999 });
    }
    setOpen((p) => !p);
  }

  return (
    <div ref={containerRef} style={{ position: "relative", marginTop: "8px" }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          padding: "5px 8px",
          border: "1.5px dashed #d1d5db",
          borderRadius: "6px",
          background: "transparent",
          color: "#9ca3af",
          fontSize: "11px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#3b82f6";
          (e.currentTarget as HTMLButtonElement).style.color = "#3b82f6";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#d1d5db";
          (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        Add Block
      </button>

      {open && (
        <div
          style={{
            ...popupStyle,
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "6px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
            {ADD_BLOCK_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => { onAdd(opt.type); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 8px",
                  background: "#334155",
                  border: "none",
                  borderRadius: "5px",
                  color: "#e2e8f0",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.1s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#3b82f6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#334155")}
              >
                <span style={{ color: "#94a3b8", flexShrink: 0 }}>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Section Column Area ----

interface SectionColumnAreaProps {
  column: SectionColumn;
  colWidth: number;
  sectionId: string;
  columnIndex: number;
  selectedColumnBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onUpdateColumn: (updated: SectionColumn) => void;
}

function SectionColumnArea({
  column,
  colWidth,
  sectionId,
  columnIndex,
  selectedColumnBlockId,
  onSelectBlock,
  onUpdateColumn,
}: SectionColumnAreaProps) {
  // Droppable zone for palette → column drops (handled by outer DndContext)
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `section-col:${sectionId}:${columnIndex}`,
    data: { type: "section-column", sectionId, columnIndex },
  });

  function handleAddBlock(type: ColumnBlockType) {
    const newBlock = createBlock(type);
    onUpdateColumn({ ...column, blocks: [...column.blocks, newBlock] });
    onSelectBlock(newBlock.id); // auto-select so user can edit immediately
  }

  function handleDeleteBlock(blockId: string) {
    onUpdateColumn({ ...column, blocks: column.blocks.filter((b) => b.id !== blockId) });
  }

  function handleDuplicateBlock(blockId: string) {
    const src = column.blocks.find((b) => b.id === blockId);
    if (!src) return;
    const dup: EmailBlock = { ...src, id: nanoid(), props: { ...src.props } } as EmailBlock;
    const idx = column.blocks.findIndex((b) => b.id === blockId);
    const next = [...column.blocks.slice(0, idx + 1), dup, ...column.blocks.slice(idx + 1)];
    onUpdateColumn({ ...column, blocks: next });
  }

  return (
    <div
      ref={setDropRef}
      style={{
        flex: colWidth,
        minWidth: 0,
        backgroundColor: column.bgColor,
        padding: `${column.paddingTop}px ${column.paddingRight}px ${column.paddingBottom}px ${column.paddingLeft}px`,
        border: isOver ? "1.5px dashed #3b82f6" : "1.5px dashed #e5e7eb",
        borderRadius: column.borderRadius ? `${column.borderRadius}px` : "4px",
        overflow: column.borderRadius ? "hidden" : undefined,
        minHeight: "60px",
        boxSizing: "border-box",
        position: "relative",
        transition: "border-color 0.15s",
        background: isOver ? `color-mix(in srgb, ${column.bgColor} 85%, #3b82f6 15%)` : column.bgColor,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Column width badge */}
      <div
        style={{
          position: "absolute",
          top: "2px",
          right: "4px",
          background: "rgba(0,0,0,0.15)",
          color: "#6b7280",
          fontSize: "9px",
          fontWeight: 700,
          padding: "1px 4px",
          borderRadius: "3px",
          pointerEvents: "none",
          letterSpacing: "0.04em",
        }}
      >
        {colWidth}%
      </div>

      <SortableContext items={column.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        {column.blocks.length === 0 ? (
          <div
            style={{
              minHeight: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isOver ? "#3b82f6" : "#d1d5db",
              fontSize: "11px",
              pointerEvents: "none",
              transition: "color 0.15s",
            }}
          >
            {isOver ? "Drop here" : "Empty column"}
          </div>
        ) : (
          <div style={{ paddingTop: "4px" }}>
            {column.blocks.map((block) => (
              <SortableColumnChild
                key={block.id}
                block={block}
                sectionId={sectionId}
                columnIndex={columnIndex}
                isSelected={selectedColumnBlockId === block.id}
                onSelect={() => onSelectBlock(block.id)}
                onDelete={() => handleDeleteBlock(block.id)}
                onDuplicate={() => handleDuplicateBlock(block.id)}
              />
            ))}
          </div>
        )}
      </SortableContext>

      <AddBlockPicker onAdd={handleAddBlock} />
    </div>
  );
}

// ---- Main SectionBlock ----

interface Props {
  block: SectionBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  selectedColumnBlock: { sectionId: string; columnIndex: number; blockId: string } | null;
  onSelectColumnBlock: (sectionId: string, columnIndex: number, blockId: string) => void;
  onPropsChange: (partial: Partial<SectionBlockType["props"]>) => void;
}

export function SectionBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  dragHandleProps,
  selectedColumnBlock,
  onSelectColumnBlock,
  onPropsChange,
}: Props) {
  const { columns, bgColor, bgImageSrc, paddingTop, paddingBottom, paddingLeft, paddingRight, preset, borderRadius } = block.props;
  const widths = COLUMN_PRESET_WIDTHS[preset];

  const handleUpdateColumn = useCallback(
    (colIdx: number, updated: SectionColumn) => {
      const next = columns.map((c, i) => (i === colIdx ? updated : c));
      onPropsChange({ columns: next });
    },
    [columns, onPropsChange]
  );

  const sectionStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
    position: "relative",
    borderRadius: borderRadius ? `${borderRadius}px` : undefined,
    overflow: borderRadius ? "hidden" : undefined,
    ...(bgImageSrc
      ? {
          backgroundImage: `url(${bgImageSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
  };

  return (
    <BlockWrapper
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      label="Section"
      dragHandleProps={dragHandleProps}
    >
      <div style={sectionStyle}>
        <div style={{ display: "flex", gap: "8px" }}>
          {columns.map((col, colIdx) => {
            const w = widths[colIdx] ?? Math.round(100 / columns.length);
            const isThisColSelected =
              selectedColumnBlock?.sectionId === block.id &&
              selectedColumnBlock.columnIndex === colIdx
                ? selectedColumnBlock.blockId
                : null;

            return (
              <SectionColumnArea
                key={col.id}
                column={col}
                colWidth={w}
                sectionId={block.id}
                columnIndex={colIdx}
                selectedColumnBlockId={isThisColSelected}
                onSelectBlock={(blockId) => onSelectColumnBlock(block.id, colIdx, blockId)}
                onUpdateColumn={(updated) => handleUpdateColumn(colIdx, updated)}
              />
            );
          })}
        </div>
      </div>
    </BlockWrapper>
  );
}
