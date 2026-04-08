import { nanoid } from "nanoid";
import type {
  EmailBlock,
  BlockType,
  HeadingProps,
  TextProps,
  ImageProps,
  ButtonProps,
  DividerProps,
  SpacerProps,
  TwoColumnProps,
  QuoteProps,
  HtmlProps,
} from "./blockTypes";

export function createBlock(type: BlockType): EmailBlock {
  const id = nanoid();

  switch (type) {
    case "heading":
      return {
        id,
        type: "heading",
        props: {
          text: "Your Heading Here",
          level: 2,
          align: "left",
          color: "#1a1a2e",
          fontSize: 28,
          bold: true,
        } satisfies HeadingProps,
      };

    case "text":
      return {
        id,
        type: "text",
        props: {
          html: "<p>Write your text content here. You can <strong>bold</strong>, <em>italicize</em>, and add <a href='#'>links</a>.</p>",
          align: "left",
          color: "#333333",
          fontSize: 14,
          lineHeight: 1.6,
          bgColor: "#ffffff",
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 0,
          paddingRight: 0,
        } satisfies TextProps,
      };

    case "image":
      return {
        id,
        type: "image",
        props: {
          src: "",
          alt: "",
          width: 100,
          align: "center",
          link: "",
          borderRadius: 0,
          caption: "",
        } satisfies ImageProps,
      };

    case "button":
      return {
        id,
        type: "button",
        props: {
          label: "Click Here",
          href: "https://",
          align: "center",
          bgColor: "#0a3d62",
          textColor: "#ffffff",
          borderRadius: 6,
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 28,
          paddingRight: 28,
          fullWidth: false,
        } satisfies ButtonProps,
      };

    case "divider":
      return {
        id,
        type: "divider",
        props: {
          color: "#e5e7eb",
          thickness: 1,
          marginTop: 16,
          marginBottom: 16,
          style: "solid",
        } satisfies DividerProps,
      };

    case "spacer":
      return {
        id,
        type: "spacer",
        props: {
          height: 32,
        } satisfies SpacerProps,
      };

    case "two-column":
      return {
        id,
        type: "two-column",
        props: {
          leftHtml: "<p>Left column content goes here.</p>",
          rightHtml: "<p>Right column content goes here.</p>",
          leftWidth: 50,
          gap: 20,
          bgColor: "#ffffff",
          paddingTop: 8,
          paddingBottom: 8,
        } satisfies TwoColumnProps,
      };

    case "quote":
      return {
        id,
        type: "quote",
        props: {
          html: '<p><em>"An inspiring quote or highlighted callout goes here."</em></p>',
          borderColor: "#0a3d62",
          bgColor: "#f0f7ff",
          textColor: "#1a3a5c",
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 20,
          paddingRight: 20,
        } satisfies QuoteProps,
      };

    case "html":
      return {
        id,
        type: "html",
        props: {
          html: "<p>Your custom HTML goes here.</p>",
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 0,
          paddingRight: 0,
        } satisfies HtmlProps,
      };
  }
}
