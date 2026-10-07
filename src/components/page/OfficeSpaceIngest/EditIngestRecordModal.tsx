"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useUpdateIngestRecord } from "@/services/hooks/useOfficeSpaceIngest";
import {
  IngestEditableFields,
  IngestRecord,
} from "@/services/types/officeSpaceIngest";

interface EditIngestRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: IngestRecord | null;
  onSaved?: () => void;
}

const FIELDS: Array<{
  key: keyof IngestEditableFields;
  label: string;
  type?: "text" | "number";
  hint?: string;
}> = [
  { key: "address1", label: "Address", hint: "Raw scraped value" },
  { key: "address2", label: "City / State", hint: "Raw scraped value" },
  { key: "spaceAvailable", label: "Space available", hint: "Raw scraped value" },
  { key: "details", label: "Details", hint: "Raw scraped value" },
  { key: "contact", label: "Contact", hint: "Raw scraped value" },
  { key: "squareFeet", label: "Square feet", type: "number" },
  { key: "priceText", label: "Price text" },
  { key: "yearBuilt", label: "Year built", type: "number" },
  { key: "propertyTypeHint", label: "Property type hint" },
];

const EditIngestRecordModal: React.FC<EditIngestRecordModalProps> = ({
  isOpen,
  onClose,
  record,
  onSaved,
}) => {
  const [form, setForm] = useState<IngestEditableFields>({});
  const update = useUpdateIngestRecord();

  useEffect(() => {
    if (isOpen && record) {
      setForm({
        address1: record.address1,
        address2: record.address2,
        spaceAvailable: record.spaceAvailable,
        details: record.details,
        description: record.description,
        contact: record.contact,
        squareFeet: record.squareFeet,
        priceText: record.priceText,
        yearBuilt: record.yearBuilt,
        propertyTypeHint: record.propertyTypeHint,
      });
    }
  }, [isOpen, record]);

  const setField = (key: keyof IngestEditableFields, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]:
        value === ""
          ? null
          : prev[key] !== undefined && typeof prev[key] === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleSave = async () => {
    if (!record) return;
    await update.mutateAsync({ id: record.id, data: form });
    onSaved?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} isFullscreen={false}>
      <div className="max-h-[80vh] overflow-y-auto p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Edit ingest record
            </h2>
            <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
              {record?.url}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {FIELDS.map(({ key, label, type, hint }) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>
              <input
                type={type ?? "text"}
                value={form[key] ?? ""}
                onChange={(e) => setField(key, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              {hint && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>
              )}
            </div>
          ))}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description ?? ""}
              onChange={(e) => setField("description", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Raw scraped value
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={update.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditIngestRecordModal;