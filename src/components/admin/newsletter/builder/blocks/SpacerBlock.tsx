import React from "react";
import type { SpacerBlock as SpacerBlockType } from "../utils/blockTypes";
import { BlockWrapper } from "./BlockWrapper";

interface Props {
  block: SpacerBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function SpacerBlock({ block, isSelected, onSelect, onDelete, onDuplicate, dragHandleProps }: Props) {
  const { height } = block.props;

  return (
    <BlockWrapper
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      label="Spacer"
      dragHandleProps={dragHandleProps}
    >
      <div
        style={{
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          background: "repeating-linear-gradient(45deg, #f3f4f6, #f3f4f6 4px, #e5e7eb 4px, #e5e7eb 8px)",
        }}
      >
        <span style={{ fontSize: "11px", color: "#9ca3af", background: "#fff", padding: "2px 6px", borderRadius: "3px" }}>
          {height}px spacer
        </span>
      </div>
    </BlockWrapper>
  );
}
