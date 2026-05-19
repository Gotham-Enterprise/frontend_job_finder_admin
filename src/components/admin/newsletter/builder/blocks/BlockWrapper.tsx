import React from "react";

interface BlockWrapperProps {
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  label: string;
  children: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function BlockWrapper({
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  label,
  children,
  dragHandleProps,
}: BlockWrapperProps) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        position: "relative",
        outline: isSelected ? "2px solid #3b82f6" : "2px solid transparent",
        borderRadius: "6px",
        transition: "outline-color 0.1s",
        cursor: "pointer",
      }}
      className={`block-wrapper group ${isSelected ? "block-wrapper--selected" : ""}`}
    >
      {/* Block label + toolbar — visible on hover or select */}
      <div
        style={{
          position: "absolute",
          top: "-26px",
          left: "0",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          opacity: isSelected ? 1 : 0,
          pointerEvents: isSelected ? "auto" : "none",
          transition: "opacity 0.1s",
          zIndex: 10,
        }}
        className="block-toolbar group-hover:opacity-100 group-hover:pointer-events-auto"
      >
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2px 6px",
            background: "#3b82f6",
            color: "#fff",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "grab",
            userSelect: "none",
            gap: "3px",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <circle cx="3" cy="3" r="1" /><circle cx="7" cy="3" r="1" />
            <circle cx="3" cy="7" r="1" /><circle cx="7" cy="7" r="1" />
          </svg>
          {label}
        </div>

        {/* Duplicate */}
        <button
          type="button"
          title="Duplicate block"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2px 6px",
            background: "#6b7280",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>

        {/* Delete */}
        <button
          type="button"
          title="Delete block"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2px 6px",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>

      {/* Block content */}
      <div style={{ padding: "8px" }}>{children}</div>
    </div>
  );
}
