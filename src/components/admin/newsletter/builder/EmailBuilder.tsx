"use client";
import React, { useState, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { EmailBlock, BlockType, SectionBlock, SectionColumn } from "./utils/blockTypes";
import { createBlock } from "./utils/blockDefaults";
import { generateEmailHTML } from "./utils/generateEmailHTML";
import { BlockPalette } from "./BlockPalette";
import { BuilderCanvas } from "./BuilderCanvas";
import { BlockPropertiesPanel } from "./BlockPropertiesPanel";
import { PreviewModal } from "./PreviewModal";

interface EmailBuilderProps {
  initialBlocks?: EmailBlock[];
  onChange: (blocks: EmailBlock[], html: string) => void;
  subject?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  onShowHeaderChange?: (val: boolean) => void;
  onShowFooterChange?: (val: boolean) => void;
}

export function EmailBuilder({ initialBlocks = [], onChange, subject = "", showHeader = true, showFooter = true, onShowHeaderChange, onShowFooterChange }: EmailBuilderProps) {
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedColumnBlock, setSelectedColumnBlock] = useState<{
    sectionId: string;
    columnIndex: number;
    blockId: string;
  } | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function notify(updated: EmailBlock[]) {
    const html = generateEmailHTML(updated);
    onChange(updated, html);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
    setActiveDragType(event.active.data.current?.type ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    setActiveDragType(null);
    const { active, over } = event;
    if (!over) return;

    const sourceType = active.data.current?.type;
    const overId = String(over.id);
    const overType = over.data.current?.type as string | undefined;

    if (sourceType === "new-block") {
      // Dropped from palette — insert a new block
      const blockType = active.data.current?.blockType as BlockType;
      const newBlock = createBlock(blockType);

      // Dropped on a section column droppable zone → append to that column
      if (overId.startsWith("section-col:")) {
        const parts = overId.split(":");
        const sectionId = parts[1];
        const colIdx = Number(parts[2]);
        setBlocks((prev) => {
          const next = prev.map((b) => {
            if (b.id !== sectionId || b.type !== "section") return b;
            const section = b as SectionBlock;
            const nextColumns = section.props.columns.map((col, i) =>
              i === colIdx ? { ...col, blocks: [...col.blocks, newBlock] } : col
            );
            return { ...section, props: { ...section.props, columns: nextColumns } } as EmailBlock;
          });
          notify(next);
          return next;
        });
        setSelectedColumnBlock({ sectionId, columnIndex: colIdx, blockId: newBlock.id });
        return;
      }

      // Dropped on a column child block → insert before it
      if (overType === "column-child") {
        const { sectionId, columnIndex } = over.data.current as { sectionId: string; columnIndex: number };
        const overBlockId = overId;
        setBlocks((prev) => {
          const next = prev.map((b) => {
            if (b.id !== sectionId || b.type !== "section") return b;
            const section = b as SectionBlock;
            const nextColumns = section.props.columns.map((col, i) => {
              if (i !== columnIndex) return col;
              const insertIdx = col.blocks.findIndex((cb) => cb.id === overBlockId);
              const atIdx = insertIdx !== -1 ? insertIdx : col.blocks.length;
              return { ...col, blocks: [...col.blocks.slice(0, atIdx), newBlock, ...col.blocks.slice(atIdx)] };
            });
            return { ...section, props: { ...section.props, columns: nextColumns } } as EmailBlock;
          });
          notify(next);
          return next;
        });
        setSelectedColumnBlock({ sectionId, columnIndex, blockId: newBlock.id });
        return;
      }

      // Dropped on canvas — insert into top-level block list
      let insertIndex = blocks.length;
      if (overId !== "canvas-droppable") {
        const overIndex = blocks.findIndex((b) => b.id === overId);
        if (overIndex !== -1) insertIndex = overIndex;
      }
      const updated = [...blocks.slice(0, insertIndex), newBlock, ...blocks.slice(insertIndex)];
      setBlocks(updated);
      setSelectedBlockId(newBlock.id);
      notify(updated);
    } else if (sourceType === "column-child") {
      // Reordering column children within the same column
      const { sectionId, columnIndex } = active.data.current as { sectionId: string; columnIndex: number };
      if (overType === "column-child") {
        const overData = over.data.current as { sectionId: string; columnIndex: number };
        if (overData.sectionId === sectionId && overData.columnIndex === columnIndex) {
          setBlocks((prev) => {
            const next = prev.map((b) => {
              if (b.id !== sectionId || b.type !== "section") return b;
              const section = b as SectionBlock;
              const col = section.props.columns[columnIndex];
              const oldIndex = col.blocks.findIndex((cb) => cb.id === String(active.id));
              const newIndex = col.blocks.findIndex((cb) => cb.id === String(over.id));
              if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return b;
              const reordered = arrayMove(col.blocks, oldIndex, newIndex);
              const nextColumns = section.props.columns.map((c, i) =>
                i === columnIndex ? { ...c, blocks: reordered } : c
              );
              return { ...section, props: { ...section.props, columns: nextColumns } } as EmailBlock;
            });
            notify(next);
            return next;
          });
        }
      }
    } else if (sourceType === "canvas-block") {
      // Reordering within canvas
      const oldIndex = blocks.findIndex((b) => b.id === String(active.id));
      const newIndex = blocks.findIndex((b) => b.id === String(over.id));
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const updated = arrayMove(blocks, oldIndex, newIndex);
        setBlocks(updated);
        notify(updated);
      }
    }
  }

  const handleUpdateBlock = useCallback((updated: EmailBlock) => {
    setBlocks((prev) => {
      const next = prev.map((b) => (b.id === updated.id ? updated : b));
      const html = generateEmailHTML(next);
      onChange(next, html);
      return next;
    });
  }, [onChange]);

  const handlePropsChange = useCallback((blockId: string, partial: Partial<EmailBlock["props"]>) => {
    setBlocks((prev) => {
      const next = prev.map((b) =>
        b.id === blockId ? ({ ...b, props: { ...b.props, ...partial } } as EmailBlock) : b
      );
      const html = generateEmailHTML(next);
      onChange(next, html);
      return next;
    });
  }, [onChange]);

  const handleSelectColumnBlock = useCallback(
    (sectionId: string, columnIndex: number, blockId: string) => {
      setSelectedBlockId(null);
      setSelectedColumnBlock({ sectionId, columnIndex, blockId });
    },
    []
  );

  const handleUpdateColumnBlock = useCallback(
    (sectionId: string, columnIndex: number, updated: EmailBlock) => {
      setBlocks((prev) => {
        const next = prev.map((b) => {
          if (b.id !== sectionId || b.type !== "section") return b;
          const section = b as SectionBlock;
          const nextColumns: SectionColumn[] = section.props.columns.map((col, i) => {
            if (i !== columnIndex) return col;
            return { ...col, blocks: col.blocks.map((cb) => (cb.id === updated.id ? updated : cb)) };
          });
          return { ...section, props: { ...section.props, columns: nextColumns } } as EmailBlock;
        });
        const html = generateEmailHTML(next);
        onChange(next, html);
        return next;
      });
    },
    [onChange]
  );

  function handleDeleteBlock(id: string) {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      notify(next);
      return next;
    });
    if (selectedBlockId === id) setSelectedBlockId(null);
    if (selectedColumnBlock?.sectionId === id) setSelectedColumnBlock(null);
  }

  function handleDuplicateBlock(id: string) {
    const source = blocks.find((b) => b.id === id);
    if (!source) return;
    const duplicate: EmailBlock = { ...source, id: nanoid(), props: { ...source.props } } as EmailBlock;
    const idx = blocks.findIndex((b) => b.id === id);
    const updated = [...blocks.slice(0, idx + 1), duplicate, ...blocks.slice(idx + 1)];
    setBlocks(updated);
    setSelectedBlockId(duplicate.id);
    notify(updated);
  }

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  // Resolve the selected column child block for the right panel
  const selectedColumnChildBlock: EmailBlock | null = (() => {
    if (!selectedColumnBlock) return null;
    const section = blocks.find((b) => b.id === selectedColumnBlock.sectionId);
    if (!section || section.type !== "section") return null;
    const col = (section as SectionBlock).props.columns[selectedColumnBlock.columnIndex];
    return col?.blocks.find((b) => b.id === selectedColumnBlock.blockId) ?? null;
  })();

  return (
    <>
    <div
      style={isFullscreen ? {
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#f9fafb",
        borderRadius: 0,
      } : {
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#f9fafb",
      }}
      className="dark:border-gray-700 dark:bg-gray-900"
    >
      {/* Builder toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "#1e293b",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>Email Builder</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Header toggle */}
          <button
            type="button"
            onClick={() => onShowHeaderChange?.(!showHeader)}
            title={showHeader ? "Disable default header" : "Enable default header"}
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "4px 8px",
              background: showHeader ? "rgba(59,130,246,0.18)" : "#334155",
              color: showHeader ? "#93c5fd" : "#94a3b8",
              border: showHeader ? "1px solid rgba(59,130,246,0.35)" : "1px solid transparent",
              borderRadius: "5px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
            </svg>
            Enable Default Header
          </button>
          {/* Footer toggle */}
          <button
            type="button"
            onClick={() => onShowFooterChange?.(!showFooter)}
            title={showFooter ? "Disable default footer" : "Enable default footer"}
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "4px 8px",
              background: showFooter ? "rgba(59,130,246,0.18)" : "#334155",
              color: showFooter ? "#93c5fd" : "#94a3b8",
              border: showFooter ? "1px solid rgba(59,130,246,0.35)" : "1px solid transparent",
              borderRadius: "5px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 15h18" />
            </svg>
            Enable Default Footer
          </button>
          <div style={{ width: "1px", height: "20px", background: "#334155", margin: "0 2px" }} />
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              background: blocks.length === 0 ? "#334155" : "#3b82f6",
              color: blocks.length === 0 ? "#64748b" : "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: blocks.length === 0 ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
            disabled={blocks.length === 0}
            title={blocks.length === 0 ? "Add blocks to preview" : "Preview email"}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "30px",
              height: "30px",
              background: "#334155",
              color: "#94a3b8",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#475569";
              (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#334155";
              (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
            }}
          >
            {isFullscreen ? (
              // Compress / exit fullscreen icon
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
              </svg>
            ) : (
              // Expand / enter fullscreen icon
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Three-panel layout */}
      <div style={{ display: "flex", height: isFullscreen ? "calc(100vh - 42px)" : "700px", overflow: "hidden" }}>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Left: Palette */}
        <div
          style={{ width: "220px", borderRight: "1px solid #e5e7eb", flexShrink: 0, background: "#fff" }}
          className="dark:border-gray-700 dark:bg-gray-800"
        >
          <BlockPalette />
        </div>

        {/* Center: Canvas */}
        <BuilderCanvas
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={(id) => { setSelectedBlockId(id); setSelectedColumnBlock(null); }}
          onDeleteBlock={handleDeleteBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onPropsChange={handlePropsChange}
          onCanvasClick={() => { setSelectedBlockId(null); setSelectedColumnBlock(null); }}
          showHeader={showHeader}
          showFooter={showFooter}
          subject={subject}
          selectedColumnBlock={selectedColumnBlock}
          onSelectColumnBlock={handleSelectColumnBlock}
        />

        {/* Right: Properties panel */}
        <div
          style={{
            width: isFullscreen ? "340px" : "280px",
            borderLeft: "1px solid #e5e7eb",
            flexShrink: 0,
            background: "#fff",
            overflowY: "auto",
          }}
          className="dark:border-gray-700 dark:bg-gray-800"
        >
          {selectedBlock ? (
            <BlockPropertiesPanel block={selectedBlock} onChange={handleUpdateBlock} />
          ) : selectedColumnChildBlock && selectedColumnBlock ? (
            <BlockPropertiesPanel
              block={selectedColumnChildBlock}
              onChange={(updated) =>
                handleUpdateColumnBlock(
                  selectedColumnBlock.sectionId,
                  selectedColumnBlock.columnIndex,
                  updated
                )
              }
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 px-6 text-center gap-3">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <p className="text-sm">Click a block on the canvas to edit its properties</p>
            </div>
          )}
        </div>

        {/* Drag overlay ghost */}
        <DragOverlay dropAnimation={null}>
          {activeDragId && activeDragType === "new-block" && (
            <div
              style={{
                padding: "8px 12px",
                background: "#3b82f6",
                color: "#fff",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                opacity: 0.9,
                boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
                pointerEvents: "none",
              }}
            >
              + Drop to add block
            </div>
          )}
        </DragOverlay>
      </DndContext>
      </div> {/* close three-panel layout */}
    </div> {/* close outer wrapper */}
    <PreviewModal
      isOpen={previewOpen}
      onClose={() => setPreviewOpen(false)}
      blocks={blocks}
      subject={subject}
      showHeader={showHeader}
      showFooter={showFooter}
    />
    </>
  );
}
