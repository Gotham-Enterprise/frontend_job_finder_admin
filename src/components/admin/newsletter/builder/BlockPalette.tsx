"use client";
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type { BlockType } from "./utils/blockTypes";

interface PaletteItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: "heading",
    label: "Heading",
    description: "H1, H2 or H3 title",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M4 12h16M4 6h16M4 18h10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: "text",
    label: "Text",
    description: "Paragraph with rich text",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M4 6h16M4 10h12M4 14h14M4 18h10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: "image",
    label: "Image",
    description: "Upload or link an image",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    type: "button",
    label: "Button",
    description: "CTA with custom link",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <rect x="2" y="8" width="20" height="8" rx="4" />
        <path d="M9 12h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: "divider",
    label: "Divider",
    description: "Horizontal rule",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M4 12h16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Vertical whitespace",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M4 8h16M4 16h16" strokeLinecap="round" />
        <path d="M12 8v8" strokeLinecap="round" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    type: "two-column",
    label: "Two Columns",
    description: "Side-by-side layout",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <rect x="3" y="4" width="8" height="16" rx="1" />
        <rect x="13" y="4" width="8" height="16" rx="1" />
      </svg>
    ),
  },
  {
    type: "quote",
    label: "Quote",
    description: "Callout or blockquote",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M3 8h4v5H3V8zM3 8c0-2 1.5-4 4-4M13 8h4v5h-4V8zM13 8c0-2 1.5-4 4-4" />
        <path d="M7 13c0 3-1 5-4 6M17 13c0 3-1 5-4 6" />
      </svg>
    ),
  },
  {
    type: "html",
    label: "Custom HTML",
    description: "Raw HTML block",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M8 6L4 12l4 6M16 6l4 6-4 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function DraggablePaletteItem({ item }: { item: PaletteItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: { type: "new-block", blockType: item.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing select-none transition-colors"
    >
      <span className="text-gray-500 dark:text-gray-400 shrink-0">{item.icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight">{item.label}</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight truncate">{item.description}</p>
      </div>
    </div>
  );
}

export function BlockPalette() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-white">Blocks</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Drag onto the canvas</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {PALETTE_ITEMS.map((item) => (
          <DraggablePaletteItem key={item.type} item={item} />
        ))}
      </div>
    </div>
  );
}
