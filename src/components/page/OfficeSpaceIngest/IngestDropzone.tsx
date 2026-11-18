"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, UploadCloud, X } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { MAX_INGEST_ROWS } from "@/services/types/officeSpaceIngest";

const ACCEPTED_EXTENSIONS = [".csv", ".json", ".txt"];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // must match the route's jsonLimit

interface IngestDropzoneProps {
  onFileAccepted: (content: string, fileName: string) => void;
  disabled?: boolean;
}

const IngestDropzone: React.FC<IngestDropzoneProps> = ({
  onFileAccepted,
  disabled = false,
}) => {
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleAccepted = useCallback(
    async (acceptedFiles: File[]) => {
      const accepted = acceptedFiles[0];
      if (!accepted) return;

      if (accepted.size > MAX_FILE_BYTES) {
        setFileError(
          `"${accepted.name}" is ${formatBytes(accepted.size)}. The limit is ${formatBytes(
            MAX_FILE_BYTES
          )}.`
        );
        setFile(null);
        return;
      }

      try {
        const content = await accepted.text();
        setFile({ name: accepted.name, size: accepted.size });
        setFileError(null);
        onFileAccepted(content, accepted.name);
      } catch {
        setFileError(`Could not read "${accepted.name}".`);
        setFile(null);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleAccepted,
    disabled,
    multiple: false,
    accept: ACCEPTED_EXTENSIONS.reduce<Record<string, string[]>>((acc, ext) => {
      acc[ext] = [".csv"];
      return acc;
    }, {}),
  });

  const clearFile = () => {
    setFile(null);
    setFileError(null);
    onFileAccepted("", "");
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          disabled
            ? "cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.02]"
            : isDragActive
              ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10"
              : "border-gray-300 bg-gray-50 hover:border-blue-400 dark:border-gray-700 dark:bg-white/[0.03] dark:hover:border-blue-500"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mb-3 h-8 w-8 text-gray-400 dark:text-gray-500" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDragActive ? "Drop the file here" : "Drag a CSV file here"}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          or{" "}
          <span className="font-medium text-blue-600 dark:text-blue-400">
            browse your files
          </span>
        </p>
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          CSV up to {formatBytes(MAX_FILE_BYTES)}, max {MAX_INGEST_ROWS.toLocaleString()} rows
        </p>
      </div>

      {fileError && (
        <p className="mt-3 flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
          <X className="mt-0.5 h-4 w-4 shrink-0" />
          {fileError}
        </p>
      )}

      {file && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-gray-400" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatBytes(file.size)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFile}
            disabled={disabled}
            aria-label="Remove selected file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default IngestDropzone;