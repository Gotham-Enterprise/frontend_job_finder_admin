import React from "react";
import type { QuoteBlock as QuoteBlockType } from "../utils/blockTypes";
import { BlockWrapper } from "./BlockWrapper";

interface Props {
  block: QuoteBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function QuoteBlock({ block, isSelected, onSelect, onDelete, onDuplicate, dragHandleProps }: Props) {
  const { html, borderColor, bgColor, textColor, paddingTop, paddingBottom, paddingLeft, paddingRight } = block.props;

  return (
    <BlockWrapper
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      label="Quote / Callout"
      dragHandleProps={dragHandleProps}
    >
      <blockquote
        style={{
          borderLeft: `4px solid ${borderColor}`,
          backgroundColor: bgColor,
          color: textColor,
          padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
          margin: 0,
          fontSize: "14px",
          lineHeight: 1.6,
          wordBreak: "break-word",
        }}
        dangerouslySetInnerHTML={{ __html: html || "<p><em>Quote content…</em></p>" }}
      />
    </BlockWrapper>
  );
}
