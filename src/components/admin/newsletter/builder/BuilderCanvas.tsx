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
  showHeader?: boolean;
  showFooter?: boolean;
  subject?: string;
}

export function BuilderCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onPropsChange,
  onCanvasClick,
  showHeader = false,
  showFooter = false,
  subject = "",
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
          overflow: "hidden",
          outline: isOver ? "2px dashed #3b82f6" : "2px dashed transparent",
          transition: "outline-color 0.15s",
          display: "flex",
          flexDirection: "column",
        }}
        ref={setNodeRef}
      >
        {/* Default Header mockup — matches preview exactly */}
        {showHeader && (
          <div style={{
            position: "relative",
            backgroundColor: "#0a3d62",
            backgroundImage: "url('/images/email/bg_email.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "180px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <div style={{
              position: "relative",
              zIndex: 1,
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "22px",
              fontWeight: 700,
              color: "#ffffff",
              padding: "10px 20px",
              textAlign: "center",
              lineHeight: 1.3,
            }}>
              {subject || "Newsletter Preview"}
            </div>
            <span style={{
              position: "absolute", top: "6px", right: "8px",
              background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.75)",
              fontSize: "9px", fontWeight: 700, padding: "2px 6px",
              borderRadius: "3px", letterSpacing: "0.06em", pointerEvents: "none",
              textTransform: "uppercase" as const,
            }}>
              Default Header
            </span>
          </div>
        )}

        {/* Blocks area — flex:1 so it grows and pushes footer to bottom */}
        <div style={{ padding: "30px", background: "#ffffff", flex: 1 }}>
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

        {/* Default Footer mockup — matches preview exactly */}
        {showFooter && (
          <div style={{
            position: "relative",
            background: "#f9f9f9",
            borderTop: "1px solid #eeeeee",
            padding: "20px 30px",
            textAlign: "center",
            borderRadius: "0 0 6px 6px",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
              {[
                { src: "/images/email/x_icon.png", alt: "X" },
                { src: "/images/email/linkedin_icon.png", alt: "LinkedIn" },
                { src: "/images/email/pinterest_icon.png", alt: "Pinterest" },
                { src: "/images/email/instagram_icon.png", alt: "Instagram" },
                { src: "/images/email/facebook_icon.png", alt: "Facebook" },
                { src: "/images/email/tiktok_icon.png", alt: "TikTok" },
                { src: "/images/email/youtube_icon.png", alt: "YouTube" },
              ].map((icon) => (
                <div key={icon.alt} style={{ padding: "0 4px" }}>
                  <img src={icon.src} alt={icon.alt} width={24} height={24} style={{ display: "block", border: "none" }} />
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "Inter, Arial, sans-serif", fontSize: "12px", color: "#666666", margin: "0 0 4px 0" }}>
              &copy; {new Date().getFullYear()} Gotham Enterprises Ltd. All rights reserved.
            </p>
            <p style={{ fontFamily: "Inter, Arial, sans-serif", fontSize: "11px", color: "#999999", margin: 0 }}>
              You are receiving this newsletter because you have an account with Gotham Enterprises.
            </p>
            <span style={{
              position: "absolute", top: "6px", right: "8px",
              background: "rgba(0,0,0,0.06)", color: "#9ca3af",
              fontSize: "9px", fontWeight: 700, padding: "2px 6px",
              borderRadius: "3px", letterSpacing: "0.06em", pointerEvents: "none",
              textTransform: "uppercase" as const,
            }}>
              Default Footer
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
