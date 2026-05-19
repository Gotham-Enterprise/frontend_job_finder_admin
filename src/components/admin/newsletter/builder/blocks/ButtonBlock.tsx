import React from "react";
import type { ButtonBlock as ButtonBlockType } from "../utils/blockTypes";
import { BlockWrapper } from "./BlockWrapper";

interface Props {
  block: ButtonBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function ButtonBlock({ block, isSelected, onSelect, onDelete, onDuplicate, dragHandleProps }: Props) {
  const {
    label,
    align,
    bgColor,
    textColor,
    borderRadius,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    fullWidth,
  } = block.props;

  return (
    <BlockWrapper
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      label="Button"
      dragHandleProps={dragHandleProps}
    >
      <div style={{ textAlign: align }}>
        <span
          style={{
            display: fullWidth ? "block" : "inline-block",
            backgroundColor: bgColor,
            color: textColor,
            borderRadius: `${borderRadius}px`,
            padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
            textAlign: "center",
            cursor: "default",
            width: fullWidth ? "100%" : undefined,
            boxSizing: "border-box",
          }}
        >
          {label || "Button"}
        </span>
      </div>
    </BlockWrapper>
  );
}
