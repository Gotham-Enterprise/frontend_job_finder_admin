import React from "react";
import type { TwoColumnBlock as TwoColumnBlockType } from "../utils/blockTypes";
import { BlockWrapper } from "./BlockWrapper";

interface Props {
  block: TwoColumnBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function TwoColumnBlock({ block, isSelected, onSelect, onDelete, onDuplicate, dragHandleProps }: Props) {
  const { leftHtml, rightHtml, leftWidth, gap, bgColor, paddingTop, paddingBottom } = block.props;
  const rightWidth = 100 - leftWidth;

  return (
    <BlockWrapper
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      label="Two Columns"
      dragHandleProps={dragHandleProps}
    >
      <div
        style={{
          display: "flex",
          gap: `${gap}px`,
          backgroundColor: bgColor,
          padding: `${paddingTop}px 0 ${paddingBottom}px 0`,
        }}
      >
        <div
          style={{
            flex: `0 0 calc(${leftWidth}% - ${gap / 2}px)`,
            border: "1px dashed #e5e7eb",
            borderRadius: "4px",
            padding: "8px",
            minHeight: "60px",
            fontSize: "13px",
            color: "#374151",
          }}
          dangerouslySetInnerHTML={{ __html: leftHtml || "<p>Left column…</p>" }}
        />
        <div
          style={{
            flex: `0 0 calc(${rightWidth}% - ${gap / 2}px)`,
            border: "1px dashed #e5e7eb",
            borderRadius: "4px",
            padding: "8px",
            minHeight: "60px",
            fontSize: "13px",
            color: "#374151",
          }}
          dangerouslySetInnerHTML={{ __html: rightHtml || "<p>Right column…</p>" }}
        />
      </div>
    </BlockWrapper>
  );
}
