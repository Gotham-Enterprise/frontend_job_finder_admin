"use client";
import React, { useCallback } from "react";
import dynamic from "next/dynamic";
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
} from "./utils/blockTypes";

// Dynamically import RichTextEditor to avoid SSR
const RichTextEditor = dynamic(
  () => import("@/components/form/input/RichTextEditor"),
  { ssr: false, loading: () => <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /> }
);

interface Props {
  block: EmailBlock;
  onChange: (updated: EmailBlock) => void;
}

// ---- Shared small components ----

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
    />
  );
}

function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-gray-500 dark:text-gray-400 w-8 shrink-0">{label}</span>}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5 bg-white"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      {label && <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</span>}
    </div>
  );
}

function SelectInput<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function CheckboxInput({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-brand-500"
      />
      <span className="text-xs text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}

function PaddingFields({
  top,
  bottom,
  left,
  right,
  onChange,
}: {
  top: number;
  bottom: number;
  left: number;
  right: number;
  onChange: (field: "paddingTop" | "paddingBottom" | "paddingLeft" | "paddingRight", v: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <NumberInput value={top} onChange={(v) => onChange("paddingTop", v)} label="T" />
      <NumberInput value={bottom} onChange={(v) => onChange("paddingBottom", v)} label="B" />
      <NumberInput value={left} onChange={(v) => onChange("paddingLeft", v)} label="L" />
      <NumberInput value={right} onChange={(v) => onChange("paddingRight", v)} label="R" />
    </div>
  );
}

const ALIGN_OPTIONS = [
  { value: "left" as const, label: "Left" },
  { value: "center" as const, label: "Center" },
  { value: "right" as const, label: "Right" },
];

// ---- Per-block panels ----

function HeadingPanel({ block, onChange }: { block: HeadingBlock; onChange: (b: HeadingBlock) => void }) {
  function set(partial: Partial<HeadingBlock["props"]>) {
    onChange({ ...block, props: { ...block.props, ...partial } });
  }
  return (
    <>
      <Field label="Text">
        <TextInput value={block.props.text} onChange={(v) => set({ text: v })} placeholder="Heading text…" />
      </Field>
      <Field label="Heading Level">
        <SelectInput
          value={String(block.props.level) as "1" | "2" | "3"}
          onChange={(v) => set({ level: Number(v) as 1 | 2 | 3 })}
          options={[
            { value: "1", label: "H1 — Large" },
            { value: "2", label: "H2 — Medium" },
            { value: "3", label: "H3 — Small" },
          ]}
        />
      </Field>
      <Field label="Alignment">
        <SelectInput value={block.props.align} onChange={(v) => set({ align: v })} options={ALIGN_OPTIONS} />
      </Field>
      <Field label="Color">
        <ColorInput value={block.props.color} onChange={(v) => set({ color: v })} />
      </Field>
      <Field label="Font Size (px)">
        <NumberInput value={block.props.fontSize} onChange={(v) => set({ fontSize: v })} min={10} max={80} />
      </Field>
      <Field label="">
        <CheckboxInput checked={block.props.bold} onChange={(v) => set({ bold: v })} label="Bold" />
      </Field>
    </>
  );
}

function TextPanel({ block, onChange }: { block: TextBlock; onChange: (b: TextBlock) => void }) {
  function set(partial: Partial<TextBlock["props"]>) {
    onChange({ ...block, props: { ...block.props, ...partial } });
  }
  return (
    <>
      <Field label="Content">
        <RichTextEditor
          content={block.props.html}
          onChange={(v) => set({ html: v })}
          placeholder="Write content…"
          minHeight={150}
          hideImageButton
        />
      </Field>
      <Field label="Alignment">
        <SelectInput value={block.props.align} onChange={(v) => set({ align: v })} options={ALIGN_OPTIONS} />
      </Field>
      <Field label="Text Color">
        <ColorInput value={block.props.color} onChange={(v) => set({ color: v })} />
      </Field>
      <Field label="Background Color">
        <ColorInput value={block.props.bgColor} onChange={(v) => set({ bgColor: v })} />
      </Field>
      <Field label="Font Size (px)">
        <NumberInput value={block.props.fontSize} onChange={(v) => set({ fontSize: v })} min={10} max={40} />
      </Field>
      <Field label="Line Height">
        <NumberInput value={block.props.lineHeight} onChange={(v) => set({ lineHeight: v })} min={1} max={3} />
      </Field>
      <Field label="Padding (px)">
        <PaddingFields
          top={block.props.paddingTop}
          bottom={block.props.paddingBottom}
          left={block.props.paddingLeft}
          right={block.props.paddingRight}
          onChange={(field, v) => set({ [field]: v })}
        />
      </Field>
    </>
  );
}

function ImagePanel({ block, onChange }: { block: ImageBlock; onChange: (b: ImageBlock) => void }) {
  function set(partial: Partial<ImageBlock["props"]>) {
    onChange({ ...block, props: { ...block.props, ...partial } });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set({ src: reader.result as string });
    reader.readAsDataURL(file);
  }

  return (
    <>
      <Field label="Image">
        {block.props.src && (
          <img src={block.props.src} alt={block.props.alt} className="w-full rounded mb-2 max-h-40 object-contain bg-gray-100 dark:bg-gray-700" />
        )}
        <input type="file" accept="image/*" onChange={handleFile} className="text-xs w-full" />
      </Field>
      <Field label="Alt Text">
        <TextInput value={block.props.alt} onChange={(v) => set({ alt: v })} placeholder="Describe image…" />
      </Field>
      <Field label="Link (optional)">
        <TextInput value={block.props.link} onChange={(v) => set({ link: v })} placeholder="https://" />
      </Field>
      <Field label="Caption (optional)">
        <TextInput value={block.props.caption} onChange={(v) => set({ caption: v })} placeholder="Image caption…" />
      </Field>
      <Field label="Width (%)">
        <NumberInput value={block.props.width} onChange={(v) => set({ width: v })} min={10} max={100} />
      </Field>
      <Field label="Alignment">
        <SelectInput value={block.props.align} onChange={(v) => set({ align: v })} options={ALIGN_OPTIONS} />
      </Field>
      <Field label="Border Radius (px)">
        <NumberInput value={block.props.borderRadius} onChange={(v) => set({ borderRadius: v })} min={0} max={50} />
      </Field>
    </>
  );
}

function ButtonPanel({ block, onChange }: { block: ButtonBlock; onChange: (b: ButtonBlock) => void }) {
  function set(partial: Partial<ButtonBlock["props"]>) {
    onChange({ ...block, props: { ...block.props, ...partial } });
  }
  return (
    <>
      <Field label="Label">
        <TextInput value={block.props.label} onChange={(v) => set({ label: v })} placeholder="Button text…" />
      </Field>
      <Field label="Link URL">
        <TextInput value={block.props.href} onChange={(v) => set({ href: v })} placeholder="https://" />
      </Field>
      <Field label="Alignment">
        <SelectInput value={block.props.align} onChange={(v) => set({ align: v })} options={ALIGN_OPTIONS} />
      </Field>
      <Field label="Background Color">
        <ColorInput value={block.props.bgColor} onChange={(v) => set({ bgColor: v })} />
      </Field>
      <Field label="Text Color">
        <ColorInput value={block.props.textColor} onChange={(v) => set({ textColor: v })} />
      </Field>
      <Field label="Border Radius (px)">
        <NumberInput value={block.props.borderRadius} onChange={(v) => set({ borderRadius: v })} min={0} max={50} />
      </Field>
      <Field label="Padding (px)">
        <PaddingFields
          top={block.props.paddingTop}
          bottom={block.props.paddingBottom}
          left={block.props.paddingLeft}
          right={block.props.paddingRight}
          onChange={(field, v) => set({ [field]: v })}
        />
      </Field>
      <Field label="">
        <CheckboxInput checked={block.props.fullWidth} onChange={(v) => set({ fullWidth: v })} label="Full width" />
      </Field>
    </>
  );
}

function DividerPanel({ block, onChange }: { block: DividerBlock; onChange: (b: DividerBlock) => void }) {
  function set(partial: Partial<DividerBlock["props"]>) {
    onChange({ ...block, props: { ...block.props, ...partial } });
  }
  return (
    <>
      <Field label="Color">
        <ColorInput value={block.props.color} onChange={(v) => set({ color: v })} />
      </Field>
      <Field label="Style">
        <SelectInput
          value={block.props.style}
          onChange={(v) => set({ style: v })}
          options={[
            { value: "solid", label: "Solid" },
            { value: "dashed", label: "Dashed" },
            { value: "dotted", label: "Dotted" },
          ]}
        />
      </Field>
      <Field label="Thickness (px)">
        <NumberInput value={block.props.thickness} onChange={(v) => set({ thickness: v })} min={1} max={10} />
      </Field>
      <Field label="Margin Top (px)">
        <NumberInput value={block.props.marginTop} onChange={(v) => set({ marginTop: v })} min={0} max={80} />
      </Field>
      <Field label="Margin Bottom (px)">
        <NumberInput value={block.props.marginBottom} onChange={(v) => set({ marginBottom: v })} min={0} max={80} />
      </Field>
    </>
  );
}

function SpacerPanel({ block, onChange }: { block: SpacerBlock; onChange: (b: SpacerBlock) => void }) {
  return (
    <Field label="Height (px)">
      <NumberInput
        value={block.props.height}
        onChange={(v) => onChange({ ...block, props: { height: v } })}
        min={4}
        max={200}
      />
    </Field>
  );
}

function TwoColumnPanel({ block, onChange }: { block: TwoColumnBlock; onChange: (b: TwoColumnBlock) => void }) {
  function set(partial: Partial<TwoColumnBlock["props"]>) {
    onChange({ ...block, props: { ...block.props, ...partial } });
  }
  return (
    <>
      <Field label="Left Column Content">
        <RichTextEditor
          content={block.props.leftHtml}
          onChange={(v) => set({ leftHtml: v })}
          placeholder="Left column…"
          minHeight={120}
          hideImageButton
        />
      </Field>
      <Field label="Right Column Content">
        <RichTextEditor
          content={block.props.rightHtml}
          onChange={(v) => set({ rightHtml: v })}
          placeholder="Right column…"
          minHeight={120}
          hideImageButton
        />
      </Field>
      <Field label="Left Column Width (%)">
        <SelectInput
          value={String(block.props.leftWidth) as "33" | "40" | "50"}
          onChange={(v) => set({ leftWidth: Number(v) as 33 | 40 | 50 })}
          options={[
            { value: "33", label: "33% / 67%" },
            { value: "40", label: "40% / 60%" },
            { value: "50", label: "50% / 50%" },
          ]}
        />
      </Field>
      <Field label="Gap (px)">
        <NumberInput value={block.props.gap} onChange={(v) => set({ gap: v })} min={0} max={60} />
      </Field>
      <Field label="Background Color">
        <ColorInput value={block.props.bgColor} onChange={(v) => set({ bgColor: v })} />
      </Field>
      <Field label="Padding Top (px)">
        <NumberInput value={block.props.paddingTop} onChange={(v) => set({ paddingTop: v })} min={0} max={60} />
      </Field>
      <Field label="Padding Bottom (px)">
        <NumberInput value={block.props.paddingBottom} onChange={(v) => set({ paddingBottom: v })} min={0} max={60} />
      </Field>
    </>
  );
}

function QuotePanel({ block, onChange }: { block: QuoteBlock; onChange: (b: QuoteBlock) => void }) {
  function set(partial: Partial<QuoteBlock["props"]>) {
    onChange({ ...block, props: { ...block.props, ...partial } });
  }
  return (
    <>
      <Field label="Content">
        <RichTextEditor
          content={block.props.html}
          onChange={(v) => set({ html: v })}
          placeholder="Quote content…"
          minHeight={120}
          hideImageButton
        />
      </Field>
      <Field label="Border Color">
        <ColorInput value={block.props.borderColor} onChange={(v) => set({ borderColor: v })} />
      </Field>
      <Field label="Background Color">
        <ColorInput value={block.props.bgColor} onChange={(v) => set({ bgColor: v })} />
      </Field>
      <Field label="Text Color">
        <ColorInput value={block.props.textColor} onChange={(v) => set({ textColor: v })} />
      </Field>
      <Field label="Padding (px)">
        <PaddingFields
          top={block.props.paddingTop}
          bottom={block.props.paddingBottom}
          left={block.props.paddingLeft}
          right={block.props.paddingRight}
          onChange={(field, v) => set({ [field]: v })}
        />
      </Field>
    </>
  );
}

// ---- Main Panel ----

function HtmlPanel({ block, onChange }: { block: HtmlBlock; onChange: (b: HtmlBlock) => void }) {
  function set(partial: Partial<HtmlBlock["props"]>) {
    onChange({ ...block, props: { ...block.props, ...partial } });
  }
  return (
    <>
      <Field label="HTML">
        <textarea
          value={block.props.html}
          onChange={(e) => set({ html: e.target.value })}
          rows={14}
          spellCheck={false}
          className="w-full font-mono text-xs bg-gray-950 text-green-400 rounded-lg p-3 border border-gray-700 resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="<p>Your custom HTML…</p>"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Rendered live on the canvas. Use inline styles for email compatibility.
        </p>
      </Field>
      <Field label="Padding (px)">
        <PaddingFields
          top={block.props.paddingTop}
          bottom={block.props.paddingBottom}
          left={block.props.paddingLeft}
          right={block.props.paddingRight}
          onChange={(field, v) => set({ [field]: v })}
        />
      </Field>
    </>
  );
}

export function BlockPropertiesPanel({ block, onChange }: Props) {
  const render = useCallback(() => {
    switch (block.type) {
      case "heading":
        return <HeadingPanel block={block} onChange={onChange as (b: HeadingBlock) => void} />;
      case "text":
        return <TextPanel block={block} onChange={onChange as (b: TextBlock) => void} />;
      case "image":
        return <ImagePanel block={block} onChange={onChange as (b: ImageBlock) => void} />;
      case "button":
        return <ButtonPanel block={block} onChange={onChange as (b: ButtonBlock) => void} />;
      case "divider":
        return <DividerPanel block={block} onChange={onChange as (b: DividerBlock) => void} />;
      case "spacer":
        return <SpacerPanel block={block} onChange={onChange as (b: SpacerBlock) => void} />;
      case "two-column":
        return <TwoColumnPanel block={block} onChange={onChange as (b: TwoColumnBlock) => void} />;
      case "quote":
        return <QuotePanel block={block} onChange={onChange as (b: QuoteBlock) => void} />;
      case "html":
        return <HtmlPanel block={block} onChange={onChange as (b: HtmlBlock) => void} />;
    }
  }, [block, onChange]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-white capitalize">
          {block.type.replace("-", " ")} Settings
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">{render()}</div>
    </div>
  );
}
