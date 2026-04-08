export type BlockType =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "two-column"
  | "quote"
  | "html";

// --------------- Heading ---------------
export interface HeadingProps {
  text: string;
  level: 1 | 2 | 3;
  align: "left" | "center" | "right";
  color: string;
  fontSize: number; // px
  bold: boolean;
}

export interface HeadingBlock {
  id: string;
  type: "heading";
  props: HeadingProps;
}

// --------------- Text ---------------
export interface TextProps {
  html: string;
  align: "left" | "center" | "right";
  color: string;
  fontSize: number;
  lineHeight: number; // e.g. 1.6
  bgColor: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface TextBlock {
  id: string;
  type: "text";
  props: TextProps;
}

// --------------- Image ---------------
export interface ImageProps {
  src: string; // base64 data URL or https URL
  alt: string;
  width: number; // percent 10-100
  align: "left" | "center" | "right";
  link: string; // href, empty = no link
  borderRadius: number;
  caption: string;
}

export interface ImageBlock {
  id: string;
  type: "image";
  props: ImageProps;
}

// --------------- Button ---------------
export interface ButtonProps {
  label: string;
  href: string;
  align: "left" | "center" | "right";
  bgColor: string;
  textColor: string;
  borderRadius: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  fullWidth: boolean;
}

export interface ButtonBlock {
  id: string;
  type: "button";
  props: ButtonProps;
}

// --------------- Divider ---------------
export interface DividerProps {
  color: string;
  thickness: number; // px
  marginTop: number;
  marginBottom: number;
  style: "solid" | "dashed" | "dotted";
}

export interface DividerBlock {
  id: string;
  type: "divider";
  props: DividerProps;
}

// --------------- Spacer ---------------
export interface SpacerProps {
  height: number; // px
}

export interface SpacerBlock {
  id: string;
  type: "spacer";
  props: SpacerProps;
}

// --------------- Two-Column ---------------
export interface TwoColumnProps {
  leftHtml: string;
  rightHtml: string;
  leftWidth: 33 | 40 | 50; // percent for left; right = 100 - leftWidth
  gap: number; // px
  bgColor: string;
  paddingTop: number;
  paddingBottom: number;
}

export interface TwoColumnBlock {
  id: string;
  type: "two-column";
  props: TwoColumnProps;
}

// --------------- Quote ---------------
export interface QuoteProps {
  html: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface QuoteBlock {
  id: string;
  type: "quote";
  props: QuoteProps;
}

// --------------- HTML ---------------
export interface HtmlProps {
  html: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface HtmlBlock {
  id: string;
  type: "html";
  props: HtmlProps;
}

// --------------- Union ---------------
export type EmailBlock =
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | SpacerBlock
  | TwoColumnBlock
  | QuoteBlock
  | HtmlBlock;
