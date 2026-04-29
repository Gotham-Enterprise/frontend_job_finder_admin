"use client";
import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
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
  ColumnPreset,
} from "./utils/blockTypes";
import { MERGE_TAGS } from "./utils/mergeTags";
import { COLUMN_PRESET_WIDTHS } from "./utils/blockTypes";

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

function MergeTagPicker({ onInsert }: { onInsert: (tag: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {MERGE_TAGS.map(({ label, tag }) => (
        <button
          key={tag}
          type="button"
          onClick={() => onInsert(tag)}
          title={`Insert ${tag}`}
          className="px-2 py-0.5 text-xs rounded border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors font-mono"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

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
      <Field label="Merge Tags">
        <MergeTagPicker onInsert={(tag) => set({ text: block.props.text + tag })} />
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
          mergeTags={[...MERGE_TAGS]}
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded border-2 border-dashed border-brand-400 dark:border-brand-600 bg-brand-50 dark:bg-brand-950/30 hover:bg-brand-100 dark:hover:bg-brand-950/50 text-brand-700 dark:text-brand-400 font-medium text-sm transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Choose Image
        </button>
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleFile} 
          className="hidden" 
        />
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
        <p className="text-[10px] text-amber-400 mt-0.5">
          Paste HTML snippets only — full documents (&lt;html&gt;, &lt;head&gt;, &lt;body&gt;) are stripped automatically.
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

// ---- Section panel helpers ----

const PRESET_OPTIONS: { value: ColumnPreset; label: string; widths: number[] }[] = (
  Object.entries(COLUMN_PRESET_WIDTHS) as [ColumnPreset, number[]][]
).map(([value, widths]) => ({ value, label: widths.map((w) => `${w}%`).join(" / "), widths }));

function PresetButton({
  option,
  isActive,
  onClick,
}: {
  option: (typeof PRESET_OPTIONS)[number];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={option.label}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "6px 4px",
        background: isActive ? "#eff6ff" : "#f9fafb",
        border: isActive ? "1.5px solid #3b82f6" : "1.5px solid #e5e7eb",
        borderRadius: "6px",
        cursor: "pointer",
        width: "100%",
        transition: "all 0.12s",
      }}
      className="dark:bg-gray-700 dark:border-gray-600"
    >
      <div style={{ display: "flex", gap: "2px", width: "44px", height: "20px" }}>
        {option.widths.map((w, i) => (
          <div
            key={i}
            style={{
              flex: w,
              background: isActive ? "#3b82f6" : "#d1d5db",
              borderRadius: "2px",
              transition: "background 0.12s",
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: "9px",
          fontWeight: 600,
          color: isActive ? "#2563eb" : "#6b7280",
          whiteSpace: "nowrap",
          lineHeight: 1.2,
        }}
      >
        {option.label}
      </span>
    </button>
  );
}

function SectionPanel({ block, onChange }: { block: SectionBlock; onChange: (b: SectionBlock) => void }) {
  const [pendingPreset, setPendingPreset] = useState<{
    preset: ColumnPreset;
    message: string;
    hasContent: boolean;
  } | null>(null);
  const [activeColTab, setActiveColTab] = useState(0);

  function set(partial: Partial<SectionBlock["props"]>) {
    onChange({ ...block, props: { ...block.props, ...partial } });
  }

  function handlePresetChange(newPreset: ColumnPreset) {
    const currentCount = block.props.columns.length;
    const newCount = COLUMN_PRESET_WIDTHS[newPreset].length;

    if (newCount < currentCount) {
      const losing = block.props.columns
        .slice(newCount)
        .map((_, i) => `Column ${newCount + i + 1}`)
        .join(", ");
      const hasContent = block.props.columns.slice(newCount).some((col) => col.blocks.length > 0);
      const msg = hasContent
        ? `Switching to this layout will remove ${losing} and all their blocks. This cannot be undone.`
        : `Switching to this layout will remove ${losing}.`;
      setPendingPreset({ preset: newPreset, message: msg, hasContent });
      return;
    } else if (newCount > currentCount) {
      const extras = Array.from({ length: newCount - currentCount }, () => ({
        id: Math.random().toString(36).slice(2),
        bgColor: "#ffffff",
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        borderRadius: 0,
        blocks: [] as SectionBlock["props"]["columns"][number]["blocks"],
      }));
      set({ preset: newPreset, columns: [...block.props.columns, ...extras] });
    } else {
      set({ preset: newPreset });
    }
  }

  function handleBgImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set({ bgImageSrc: reader.result as string });
    reader.readAsDataURL(file);
  }

  function updateColumn(colIdx: number, partial: Partial<SectionBlock["props"]["columns"][number]>) {
    const next = block.props.columns.map((c, i) => (i === colIdx ? { ...c, ...partial } : c));
    set({ columns: next });
  }

  function confirmPresetChange() {
    if (!pendingPreset) return;
    const newCount = COLUMN_PRESET_WIDTHS[pendingPreset.preset].length;
    set({ preset: pendingPreset.preset, columns: block.props.columns.slice(0, newCount) });
    setActiveColTab((prev) => Math.min(prev, newCount - 1));
    setPendingPreset(null);
  }

  return (
    <>
      <ConfirmationDialog
        isOpen={pendingPreset !== null}
        onClose={() => setPendingPreset(null)}
        onConfirm={confirmPresetChange}
        onCancel={() => setPendingPreset(null)}
        title="Change Column Layout"
        message={pendingPreset?.message ?? ""}
        confirmText="Change Layout"
        cancelText="Keep Current"
      />

      <Field label="Column Layout">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px" }}>
          {PRESET_OPTIONS.map((opt) => (
            <PresetButton
              key={opt.value}
              option={opt}
              isActive={block.props.preset === opt.value}
              onClick={() => handlePresetChange(opt.value)}
            />
          ))}
        </div>
      </Field>

      <Field label="Section Background Color">
        <ColorInput value={block.props.bgColor} onChange={(v) => set({ bgColor: v })} />
      </Field>

      <Field label="Background Image">
        {block.props.bgImageSrc && (
          <div style={{ marginBottom: "6px" }}>
            <img
              src={block.props.bgImageSrc}
              alt="Section background"
              style={{ width: "100%", maxHeight: "80px", objectFit: "cover", borderRadius: "4px" }}
            />
            <button
              type="button"
              onClick={() => set({ bgImageSrc: "" })}
              style={{
                marginTop: "4px",
                fontSize: "10px",
                color: "#ef4444",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Remove image
            </button>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleBgImageFile} className="text-xs w-full" />
      </Field>

      <Field label="Section Padding (px)">
        <PaddingFields
          top={block.props.paddingTop}
          bottom={block.props.paddingBottom}
          left={block.props.paddingLeft}
          right={block.props.paddingRight}
          onChange={(field, v) => set({ [field]: v })}
        />
      </Field>

      <Field label="Corner Radius (px)">
        <NumberInput
          value={block.props.borderRadius ?? 0}
          onChange={(v) => set({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>

      {/* Column tabs */}
      <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #e5e7eb" }} className="dark:border-gray-700">
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Column Settings
        </p>
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {block.props.columns.map((col, i) => {
            const w = COLUMN_PRESET_WIDTHS[block.props.preset][i] ?? Math.round(100 / block.props.columns.length);
            const isActive = activeColTab === i;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveColTab(i)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "5px 4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  border: isActive ? "1.5px solid #3b82f6" : "1.5px solid #e5e7eb",
                  background: isActive ? "#eff6ff" : "#f9fafb",
                  color: isActive ? "#2563eb" : "#6b7280",
                  cursor: "pointer",
                  whiteSpace: "nowrap" as const,
                  transition: "all 0.12s",
                }}
                className="dark:bg-gray-700 dark:border-gray-600"
              >
                Col {i + 1} · {w}%
              </button>
            );
          })}
        </div>
        {(() => {
          const col = block.props.columns[activeColTab];
          if (!col) return null;
          return (
            <>
              <Field label="Background Color">
                <ColorInput value={col.bgColor} onChange={(v) => updateColumn(activeColTab, { bgColor: v })} />
              </Field>
              <Field label="Corner Radius (px)">
                <NumberInput
                  value={col.borderRadius ?? 0}
                  onChange={(v) => updateColumn(activeColTab, { borderRadius: v })}
                  min={0}
                  max={48}
                />
              </Field>
              <Field label="Padding (px)">
                <PaddingFields
                  top={col.paddingTop}
                  bottom={col.paddingBottom}
                  left={col.paddingLeft}
                  right={col.paddingRight}
                  onChange={(field, v) => updateColumn(activeColTab, { [field]: v })}
                />
              </Field>
            </>
          );
        })()}
      </div>
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
      case "section":
        return <SectionPanel block={block} onChange={onChange as (b: SectionBlock) => void} />;
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
