import React from "react";
import type { HtmlBlock as HtmlBlockType } from "../utils/blockTypes";
import { BlockWrapper } from "./BlockWrapper";
import { stripHtmlDocumentShell } from "../utils/generateEmailHTML";

interface Props {
  block: HtmlBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function HtmlBlock({ block, isSelected, onSelect, onDelete, onDuplicate, dragHandleProps }: Props) {
  const { html, paddingTop, paddingBottom, paddingLeft, paddingRight } = block.props;
  const safeHtml = stripHtmlDocumentShell(html);

  return (
    <BlockWrapper
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      label="Custom HTML"
      dragHandleProps={dragHandleProps}
    >
      <div style={{ position: "relative", overflow: "hidden", maxWidth: "100%" }}>
        {/* Badge */}
        <span
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            zIndex: 1,
            background: "#6366f1",
            color: "#fff",
            fontSize: "9px",
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: "4px",
            letterSpacing: "0.04em",
            pointerEvents: "none",
            fontFamily: "monospace",
          }}
        >
          HTML
        </span>

        {/* Live canvas render */}
        <div
          style={{
            padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
            minHeight: "32px",
            overflow: "hidden",
            maxWidth: "100%",
          }}
          dangerouslySetInnerHTML={{ __html: safeHtml || "<p style=\"color:#9ca3af;font-size:13px;\">Empty HTML block — edit in the properties panel.</p>" }}
        />
      </div>
    </BlockWrapper>
  );
}
