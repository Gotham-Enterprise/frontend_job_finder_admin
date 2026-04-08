"use client";
import React from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { EmailBlock } from "./utils/blockTypes";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ButtonBlock } from "./blocks/ButtonBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { SpacerBlock } from "./blocks/SpacerBlock";
import { TwoColumnBlock } from "./blocks/TwoColumnBlock";
import { QuoteBlock } from "./blocks/QuoteBlock";
import { HtmlBlock } from "./blocks/HtmlBlock";

interface SortableBlockProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPropsChange: (blockId: string, partial: Partial<EmailBlock["props"]>) => void;
}

function SortableBlock({ block, isSelected, onSelect, onDelete, onDuplicate, onPropsChange }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { type: "canvas-block", blockId: block.id },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    marginBottom: "28px", // room for block toolbar above
    paddingTop: "28px",
    position: "relative",
  };

  const dragHandleProps = { ...attributes, ...listeners };

  const sharedProps = {
    isSelected,
    onSelect,
    onDelete,
    onDuplicate,
    dragHandleProps,
  };

  function renderBlock() {
    switch (block.type) {
      case "heading":
        return <HeadingBlock block={block} {...sharedProps} />;
      case "text":
        return <TextBlock block={block} {...sharedProps} />;
      case "image":
        return (
          <ImageBlock
            block={block}
            {...sharedProps}
            onPropsChange={(partial) => onPropsChange(block.id, partial)}
          />
        );
      case "button":
        return <ButtonBlock block={block} {...sharedProps} />;
      case "divider":
        return <DividerBlock block={block} {...sharedProps} />;
      case "spacer":
        return <SpacerBlock block={block} {...sharedProps} />;
      case "two-column":
        return <TwoColumnBlock block={block} {...sharedProps} />;
      case "quote":
        return <QuoteBlock block={block} {...sharedProps} />;
      case "html":
        return <HtmlBlock block={block} {...sharedProps} />;
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      {renderBlock()}
    </div>
  );
}

interface BuilderCanvasProps {
  blocks: EmailBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onPropsChange: (blockId: string, partial: Partial<EmailBlock["props"]>) => void;
  onCanvasClick: () => void;
}

export function BuilderCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onPropsChange,
  onCanvasClick,
}: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-droppable" });

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-950 p-6"
      onClick={onCanvasClick}
    >
      {/* Email canvas at ~600px */}
      <div
        style={{
          maxWidth: "620px",
          margin: "0 auto",
          minHeight: "500px",
          background: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)",
          padding: "24px",
          outline: isOver ? "2px dashed #3b82f6" : "2px dashed transparent",
          transition: "outline-color 0.15s",
        }}
        ref={setNodeRef}
      >
        {blocks.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              color: "#9ca3af",
              gap: "12px",
              pointerEvents: "none",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500 }}>Drag blocks here to build your email</p>
            <p style={{ fontSize: "12px" }}>Pick from the blocks panel on the left</p>
          </div>
        ) : (
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={() => onSelectBlock(block.id)}
                onDelete={() => onDeleteBlock(block.id)}
                onDuplicate={() => onDuplicateBlock(block.id)}
                onPropsChange={onPropsChange}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
