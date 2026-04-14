import type {
  EmailBlock,
  HeadingBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  SpacerBlock,
  TwoColumnBlock,
  QuoteBlock,
  HtmlBlock,
  SectionBlock,
} from "./blockTypes";
import { COLUMN_PRESET_WIDTHS } from "./blockTypes";

function escapeHTML(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * If `html` contains a full HTML document shell (<!DOCTYPE>, <html>, <head>, <body> tags),
 * extract and return only the inner body content. Otherwise return `html` unchanged.
 * This prevents a full pasted HTML document from breaking the canvas or preview layout.
 */
export function stripHtmlDocumentShell(html: string): string {
  if (!html) return html;
  // If there's a <body> tag, extract only its inner content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) return bodyMatch[1];
  // Otherwise strip individual document-level tags
  return html
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<html[^>]*>/gi, "")
    .replace(/<\/html>/gi, "")
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<body[^>]*>/gi, "")
    .replace(/<\/body>/gi, "")
    .trim();
}

function alignToMargin(align: "left" | "center" | "right"): string {
  if (align === "center") return "margin: 0 auto;";
  if (align === "right") return "margin-left: auto;";
  return "";
}

function renderHeading(block: HeadingBlock): string {
  const { text, level, align, color, fontSize, bold } = block.props;
  const tag = `h${level}`;
  const style = [
    `font-size: ${fontSize}px`,
    `color: ${color}`,
    `text-align: ${align}`,
    `font-weight: ${bold ? "700" : "400"}`,
    "margin: 0 0 8px 0",
    "padding: 0",
    "line-height: 1.3",
  ].join("; ");
  return `<${tag} style="${style}">${escapeHTML(text)}</${tag}>`;
}

function renderText(block: TextBlock): string {
  const { html, align, color, fontSize, lineHeight, bgColor, paddingTop, paddingBottom, paddingLeft, paddingRight } =
    block.props;
  const style = [
    `font-size: ${fontSize}px`,
    `color: ${color}`,
    `text-align: ${align}`,
    `line-height: ${lineHeight}`,
    `background-color: ${bgColor}`,
    `padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
  ].join("; ");
  return `<div style="${style}">${html}</div>`;
}

function renderImage(block: ImageBlock): string {
  const { src, alt, width, align, link, borderRadius, caption } = block.props;
  if (!src) return "";

  const imgStyle = [
    `width: ${width}%`,
    "max-width: 100%",
    "height: auto",
    "display: block",
    `border-radius: ${borderRadius}px`,
    alignToMargin(align),
  ].join("; ");

  const img = `<img src="${src}" alt="${escapeHTML(alt)}" style="${imgStyle}" />`;
  const wrapped = link ? `<a href="${escapeHTML(link)}" target="_blank" rel="noopener noreferrer">${img}</a>` : img;
  const captionHtml = caption
    ? `<p style="font-size: 12px; color: #666666; text-align: ${align}; margin: 4px 0 0 0;">${escapeHTML(caption)}</p>`
    : "";
  return `<div style="text-align: ${align};">${wrapped}${captionHtml}</div>`;
}

function renderButton(block: ButtonBlock): string {
  const {
    label,
    href,
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

  const btnStyle = [
    `background-color: ${bgColor}`,
    `color: ${textColor}`,
    `border-radius: ${borderRadius}px`,
    `padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
    "text-decoration: none",
    "font-size: 14px",
    "font-weight: 600",
    "display: inline-block",
    ...(fullWidth ? ["width: 100%", "text-align: center", "box-sizing: border-box"] : []),
  ].join("; ");

  const wrapperStyle = `text-align: ${align};`;
  return `<div style="${wrapperStyle}"><a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer" style="${btnStyle}">${escapeHTML(label)}</a></div>`;
}

function renderDivider(block: DividerBlock): string {
  const { color, thickness, marginTop, marginBottom, style } = block.props;
  const hrStyle = [
    `border: none`,
    `border-top: ${thickness}px ${style} ${color}`,
    `margin: ${marginTop}px 0 ${marginBottom}px 0`,
  ].join("; ");
  return `<hr style="${hrStyle}" />`;
}

function renderSpacer(block: SpacerBlock): string {
  return `<div style="height: ${block.props.height}px; line-height: ${block.props.height}px;">&nbsp;</div>`;
}

function renderTwoColumn(block: TwoColumnBlock): string {
  const { leftHtml, rightHtml, leftWidth, gap, bgColor, paddingTop, paddingBottom } = block.props;
  const rightWidth = 100 - leftWidth;
  const wrapperTdStyle = `background-color: ${bgColor}; padding: ${paddingTop}px 0 ${paddingBottom}px 0;`;
  // Use table for email client compatibility; background-color/padding must be on <td> not <table>
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td bgcolor="${bgColor}" style="${wrapperTdStyle}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="${leftWidth}%" style="vertical-align: top; padding-right: ${Math.round(gap / 2)}px;">
            <div style="font-size: 14px; color: #333333; line-height: 1.6;">${leftHtml}</div>
          </td>
          <td width="${rightWidth}%" style="vertical-align: top; padding-left: ${Math.round(gap / 2)}px;">
            <div style="font-size: 14px; color: #333333; line-height: 1.6;">${rightHtml}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function renderQuote(block: QuoteBlock): string {
  const { html, borderColor, bgColor, textColor, paddingTop, paddingBottom, paddingLeft, paddingRight } = block.props;
  const style = [
    `background-color: ${bgColor}`,
    `border-left: 4px solid ${borderColor}`,
    `color: ${textColor}`,
    `padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
    "font-size: 14px",
    "line-height: 1.6",
    "margin: 0",
  ].join("; ");
  return `<blockquote style="${style}">${html}</blockquote>`;
}

function renderHtml(block: HtmlBlock): string {
  const { html, paddingTop, paddingBottom, paddingLeft, paddingRight } = block.props;
  const style = `padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px; overflow: hidden; max-width: 100%;`;
  return `<div style="${style}">${stripHtmlDocumentShell(html)}</div>`;
}

function renderColumnBlock(block: EmailBlock): string {
  switch (block.type) {
    case "heading":
      return renderHeading(block);
    case "text":
      return renderText(block);
    case "image":
      return renderImage(block);
    case "button":
      return renderButton(block);
    case "quote":
      return renderQuote(block);
    case "html":
      return renderHtml(block);
    default:
      return "";
  }
}

function renderSection(block: SectionBlock): string {
  const { columns, bgColor, bgImageSrc, paddingTop, paddingBottom, paddingLeft, paddingRight, borderRadius } =
    block.props;

  // background-color, padding, and border-radius must be on the <td>, not the <table>,
  // for reliable rendering across email clients (especially Outlook).
  const wrapperTdStyle = [
    `background-color: ${bgColor}`,
    bgImageSrc ? `background-image: url('${bgImageSrc}')` : "",
    bgImageSrc ? "background-size: cover" : "",
    bgImageSrc ? "background-position: center" : "",
    `padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
    borderRadius ? `border-radius: ${borderRadius}px` : "",
  ]
    .filter(Boolean)
    .join("; ");

  const cells = columns.map((col) => {
    const colStyle = [
      `background-color: ${col.bgColor}`,
      `padding: ${col.paddingTop}px ${col.paddingRight}px ${col.paddingBottom}px ${col.paddingLeft}px`,
      col.borderRadius ? `border-radius: ${col.borderRadius}px` : "",
      "vertical-align: top",
    ]
      .filter(Boolean)
      .join("; ");
    const innerHtml = col.blocks.map(renderColumnBlock).join("\n");
    return `<td bgcolor="${col.bgColor}" style="${colStyle}">${innerHtml || ""}</td>`;
  });

  // Build a <td width=N%> for each column
  const widths = COLUMN_PRESET_WIDTHS[block.props.preset];
  const cellsWithWidth = cells.map((cell, i) => {
    const w = widths[i] ?? Math.round(100 / columns.length);
    return cell.replace("<td ", `<td width="${w}%" `);
  });

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td bgcolor="${bgColor}" style="${wrapperTdStyle}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${cellsWithWidth.join("\n          ")}
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export function generateEmailHTML(blocks: EmailBlock[]): string {
  const parts = blocks.map((block) => {
    const wrapperStyle = "max-width: 600px; margin: 0 auto; padding: 8px 30px; font-family: Inter, Arial, sans-serif;";
    let inner = "";

    switch (block.type) {
      case "heading":
        inner = renderHeading(block);
        break;
      case "text":
        inner = renderText(block);
        break;
      case "image":
        inner = renderImage(block);
        break;
      case "button":
        inner = renderButton(block);
        break;
      case "divider":
        inner = renderDivider(block);
        break;
      case "spacer":
        inner = renderSpacer(block);
        break;
      case "two-column":
        inner = renderTwoColumn(block);
        break;
      case "quote":
        inner = renderQuote(block);
        break;
      case "html":
        inner = renderHtml(block);
        break;
      case "section":
        // Section gets its own full-width wrapper (no constrained wrapperStyle)
        return renderSection(block);
    }

    return `<div style="${wrapperStyle}">${inner}</div>`;
  });

  return parts.join("\n");
}
