"use client";

import React, { useState } from "react";
import { FileJson, FileSpreadsheet, Upload } from "lucide-react";
import Button from "@/components/ui/button/Button";
import IngestDropzone from "./IngestDropzone";
import ImportPreviewTable from "./ImportPreviewTable";
import {
  useImportIngestCsv,
  useImportIngestRows,
} from "@/services/hooks/useOfficeSpaceIngest";
import {
  IngestImportResult,
  IngestInputRow,
  IngestSource,
  MAX_INGEST_ROWS,
} from "@/services/types/officeSpaceIngest";

type Mode = "UPLOAD" | "PASTE";
type PasteFormat = "csv" | "json";

interface PendingPayload {
  source: IngestSource;
  fileName?: string;
  csv?: string;
  rows?: IngestInputRow[];
}

/**
 * CSV is handed to the backend as raw text and parsed server-side rather than
 * parsed here, so the preview reflects exactly what a real import stores.
 */
function parsePastedJson(text: string): IngestInputRow[] | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return null;

  const parsed = JSON.parse(trimmed);
  if (Array.isArray(parsed)) return parsed as IngestInputRow[];
  if (parsed && Array.isArray(parsed.rows)) return parsed.rows as IngestInputRow[];
  throw new Error("Expected a JSON array of rows, or an object with a rows array.");
}

const IngestImportPanel: React.FC = () => {
  const [mode, setMode] = useState<Mode>("UPLOAD");
  const [pasteFormat, setPasteFormat] = useState<PasteFormat>("csv");
  const [pasteText, setPasteText] = useState("");
  const [pending, setPending] = useState<PendingPayload | null>(null);
  const [preview, setPreview] = useState<IngestImportResult | null>(null);
  const [result, setResult] = useState<IngestImportResult | null>(null);
  const [pasteError, setPasteError] = useState<string | null>(null);

  const importCsv = useImportIngestCsv();
  const importRows = useImportIngestRows();

  const isBusy = importCsv.isPending || importRows.isPending;

  const reset = () => {
    setPending(null);
    setPreview(null);
    setResult(null);
    setPasteError(null);
    setPasteText("");
  };

  const runPreview = async () => {
    if (!pending) return;

    const res =
      pending.csv !== undefined
        ? await importCsv.mutateAsync({
            csv: pending.csv,
            source: pending.source,
            fileName: pending.fileName,
            dryRun: true,
          })
        : await importRows.mutateAsync({
            rows: pending.rows ?? [],
            source: pending.source,
            fileName: pending.fileName,
            dryRun: true,
          });

    setPreview(res);
  };

  const runImport = async () => {
    if (!pending) return;

    const res =
      pending.csv !== undefined
        ? await importCsv.mutateAsync({
            csv: pending.csv,
            source: pending.source,
            fileName: pending.fileName,
          })
        : await importRows.mutateAsync({
            rows: pending.rows ?? [],
            source: pending.source,
            fileName: pending.fileName,
          });

    setResult(res);
    setPending(null);
    setPreview(null);
    setPasteText("");
  };

  const handleFileAccepted = (content: string, fileName: string) => {
    if (!fileName) {
      setPending(null);
      return;
    }
    // A pasted .json file is uploaded as JSON rows; everything else is CSV.
    const looksLikeJson = fileName.toLowerCase().endsWith(".json");
    if (looksLikeJson) {
      try {
        const rows = parsePastedJson(content);
        if (!rows) throw new Error("Expected a JSON array of rows.");
        setPending({ source: IngestSource.UPLOAD, fileName, rows });
      } catch (err) {
        setPending(null);
        setPasteError(
          err instanceof Error ? err.message : "Could not read that file."
        );
        return;
      }
    } else {
      setPending({ source: IngestSource.UPLOAD, fileName, csv: content });
    }
    setResult(null);
    setPreview(null);
  };

  const handlePreviewPaste = () => {
    setPasteError(null);
    setResult(null);

    if (!pasteText.trim()) {
      setPasteError("Paste some data first.");
      return;
    }

    if (pasteFormat === "json") {
      try {
        const rows = parsePastedJson(pasteText);
        if (!rows) {
          setPasteError("Expected a JSON array of rows.");
          return;
        }
        if (rows.length > MAX_INGEST_ROWS) {
          setPasteError(
            `Too many rows: ${rows.length}. The limit is ${MAX_INGEST_ROWS.toLocaleString()}.`
          );
          return;
        }
        setPending({ source: IngestSource.PASTE, rows });
      } catch (err) {
        setPasteError(
          err instanceof Error ? err.message : "That is not valid JSON."
        );
        return;
      }
    } else {
      setPending({ source: IngestSource.PASTE, csv: pasteText });
    }

    setPreview(null);
  };

  const showPreview = preview ?? result;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {(["UPLOAD", "PASTE"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              reset();
            }}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              mode === m
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {m === "UPLOAD" ? "Upload file" : "Paste data"}
          </button>
        ))}
      </div>

      {mode === "UPLOAD" ? (
        <IngestDropzone onFileAccepted={handleFileAccepted} disabled={isBusy} />
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["csv", "json"] as PasteFormat[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPasteFormat(f)}
                disabled={isBusy}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  pasteFormat === f
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-300"
                    : "border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400"
                }`}
              >
                {f === "csv" ? (
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                ) : (
                  <FileJson className="h-3.5 w-3.5" />
                )}
                {f}
              </button>
            ))}
          </div>

          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            disabled={isBusy}
            rows={10}
            placeholder={
              pasteFormat === "csv"
                ? "url,address_1,address_2,space_available,details,description,contact\nhttps://...,\"35 W 45th St\",\"New York, NY\",..."
                : '[{" url": "https://...", "description": "..." }]'
            }
            className="w-full rounded-xl border border-gray-300 p-3 font-mono text-xs text-gray-800 focus:border-blue-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />

          <Button
            variant="outlinePrimary"
            onClick={handlePreviewPaste}
            disabled={isBusy}
          >
            Use this data
          </Button>
        </div>
      )}

      {pasteError && (
        <p className="text-sm text-red-600 dark:text-red-400">{pasteError}</p>
      )}

      {pending && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Ready to preview{" "}
            {pending.fileName ? <strong>{pending.fileName}</strong> : "pasted data"}.
          </p>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              disabled={isBusy}
            >
              Clear
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={runPreview}
              disabled={isBusy}
            >
              {isBusy ? "Working…" : "Preview"}
            </Button>
            <Button
              size="sm"
              onClick={runImport}
              disabled={isBusy}
            >
              <Upload className="h-4 w-4" />
              {isBusy ? "Importing…" : "Import"}
            </Button>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
          <ImportPreviewTable result={showPreview} />
        </div>
      )}
    </div>
  );
};

export default IngestImportPanel;