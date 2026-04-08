import React from "react";
import type { HeadingBlock as HeadingBlockType } from "../utils/blockTypes";
import { BlockWrapper } from "./BlockWrapper";

interface Props {
  block: HeadingBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const TAG_MAP = { 1: "h1", 2: "h2", 3: "h3" } as const;

export function HeadingBlock({ block, isSelected, onSelect, onDelete, onDuplicate, dragHandleProps }: Props) {
  const { text, level, align, color, fontSize, bold } = block.props;
  const Tag = TAG_MAP[level];

  return (
    <BlockWrapper
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      label="Heading"
      dragHandleProps={dragHandleProps}
    >
      <Tag
        style={{
          fontSize: `${fontSize}px`,
          color,
          textAlign: align,
          fontWeight: bold ? 700 : 400,
          margin: 0,
          padding: "4px 0",
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {text || "Heading text…"}
      </Tag>
    </BlockWrapper>
  );
}
