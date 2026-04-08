import React from "react";
import type { TextBlock as TextBlockType } from "../utils/blockTypes";
import { BlockWrapper } from "./BlockWrapper";

interface Props {
  block: TextBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function TextBlock({ block, isSelected, onSelect, onDelete, onDuplicate, dragHandleProps }: Props) {
  const { html, align, color, fontSize, lineHeight, bgColor, paddingTop, paddingBottom, paddingLeft, paddingRight } =
    block.props;

  return (
    <BlockWrapper
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      label="Text"
      dragHandleProps={dragHandleProps}
    >
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
        className="newsletter-block-text"
        dangerouslySetInnerHTML={{ __html: html || "<p>Text content…</p>" }}
      />
    </BlockWrapper>
  );
}
