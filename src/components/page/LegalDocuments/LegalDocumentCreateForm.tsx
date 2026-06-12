"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/form/input/RichTextEditor";
import Button from "@/components/ui/button/Button";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  useCreateLegalDocumentVersion,
  useLatestLegalDocumentVersion,
} from "@/services/hooks/useLegalDocuments";
import {
  LEGAL_DOCUMENT_LABELS,
  LegalDocumentType,
} from "@/services/types/legalDocuments";

interface LegalDocumentCreateFormProps {
  type: LegalDocumentType;
}

const LegalDocumentCreateForm: React.FC<LegalDocumentCreateFormProps> = ({ type }) => {
  const router = useRouter();
  const labels = LEGAL_DOCUMENT_LABELS[type];
  const basePath = `/admin/legal/${type}`;

  const [content, setContent] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data: latestData, isLoading: isLoadingLatest } =
    useLatestLegalDocumentVersion(type);
  const createMutation = useCreateLegalDocumentVersion(type);

  useEffect(() => {
    if (!initialized && latestData?.data?.content) {
      setContent(latestData.data.content);
      setInitialized(true);
    }
  }, [latestData, initialized]);

  const handleSubmit = async () => {
    if (!content.trim() || content.trim().length < 100) {
      return;
    }

    try {
      const response = await createMutation.mutateAsync({ content });
      router.push(`${basePath}/${response.data.id}`);
    } catch {
      // Toast handled in mutation
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={basePath} className="text-sm text-brand-500 hover:underline">
          &larr; Back to {labels.title} versions
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Create New {labels.title} Version
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This will become the live version shown on the site and used for new user
          agreements.
        </p>
      </div>

      {isLoadingLatest ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-500" />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          {latestData?.data && (
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Pre-filled from current live version #{latestData.data.id}. Edit as needed
              before publishing.
            </p>
          )}

          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder={`Enter the ${labels.singular} content...`}
            minHeight={500}
            hideImageButton
          />

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.push(basePath)}>
              Cancel
            </Button>
            <Button
              disabled={content.trim().length < 100 || createMutation.isPending}
              onClick={() => setShowConfirm(true)}
            >
              Publish New Version
            </Button>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
        title="Publish new version?"
        message={`This will immediately replace the current live ${labels.singular} on the public site. Existing user agreements will remain tied to the version they accepted.`}
        confirmText="Publish"
        cancelText="Cancel"
        isLoading={createMutation.isPending}
      />
    </div>
  );
};

export default LegalDocumentCreateForm;
