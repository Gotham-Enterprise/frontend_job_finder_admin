import React from "react";
import type { DividerBlock as DividerBlockType } from "../utils/blockTypes";
import { BlockWrapper } from "./BlockWrapper";

interface Props {
  block: DividerBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function DividerBlock({ block, isSelected, onSelect, onDelete, onDuplicate, dragHandleProps }: Props) {
  const { color, thickness, marginTop, marginBottom, style } = block.props;

  return (
    <BlockWrapper
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      label="Divider"
      dragHandleProps={dragHandleProps}
    >
      <hr
        style={{
          border: "none",
          borderTop: `${thickness}px ${style} ${color}`,
          margin: `${marginTop}px 0 ${marginBottom}px 0`,
        }}
      />
    </BlockWrapper>
  );
}
