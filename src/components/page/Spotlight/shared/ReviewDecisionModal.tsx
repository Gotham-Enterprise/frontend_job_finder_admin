import { FC, ReactNode, useEffect, useState } from "react";

import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { ReviewDecision } from "@/services/types/spotlight";

interface Props {
  isOpen: boolean;
  /** The decision being confirmed; approvals need no note. */
  decision: ReviewDecision | "suspend" | null;
  subject: string;
  isSaving: boolean;
  /** Extra content shown above the note, e.g. per-creative choices. */
  children?: ReactNode;
  /** Force the note on, e.g. an approval where some ads are not approved. */
  requireNote?: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

const COPY: Record<NonNullable<Props["decision"]>, { title: string; action: string; hint: string; danger: boolean }> = {
  approved: {
    title: "Approve",
    action: "Approve",
    hint: "The advertiser is notified by email.",
    danger: false,
  },
  changes_requested: {
    title: "Request changes",
    action: "Request changes",
    hint: "Tell the advertiser exactly what to fix. This is shown to them and sent by email.",
    danger: false,
  },
  rejected: {
    title: "Reject",
    action: "Reject",
    hint: "Explain why it can't be approved. This is shown to the advertiser and sent by email.",
    danger: true,
  },
  suspend: {
    title: "Suspend advertiser",
    action: "Suspend",
    hint: "All of this advertiser's ads stop serving right away. The reason is emailed to them.",
    danger: true,
  },
};

const ReviewDecisionModal: FC<Props> = ({ isOpen, decision, subject, isSaving, children, requireNote, onClose, onConfirm }) => {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) setNote("");
  }, [isOpen, decision]);

  if (!decision) return null;
  const copy = COPY[decision];
  const needsNote = decision !== "approved" || Boolean(requireNote);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[560px] p-6 rounded-2xl" isFullscreen={false}>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-gray-900 dark:text-white text-xl font-semibold">{copy.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subject}</p>
        </div>
        {children}
        <p className="text-sm text-gray-500">
          {requireNote && decision === "approved"
            ? "Some ads are not approved. Tell the advertiser what to fix; this is shown to them and sent by email."
            : copy.hint}
        </p>
        {needsNote && (
          <TextArea
            placeholder="e.g. The business registration document is unreadable. Please upload a clearer copy."
            rows={4}
            value={note}
            onChange={setNote}
            maxLength={2000}
          />
        )}
        <div className="flex flex-row gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            className={copy.danger ? "bg-red-600 dark:bg-red-800 hover:bg-red-800" : undefined}
            disabled={isSaving || (needsNote && !note.trim())}
            onClick={() => onConfirm(note.trim())}
          >
            {isSaving ? "Saving..." : copy.action}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewDecisionModal;
