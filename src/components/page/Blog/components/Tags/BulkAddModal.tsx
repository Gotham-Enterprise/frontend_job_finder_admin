"use client";
import React from "react";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  bulkTags: string;
  setBulkTags: (value: string) => void;
  onBulkAddTags: () => void;
}

const BulkAddModal: React.FC<BulkAddModalProps> = ({
  isOpen,
  onClose,
  bulkTags,
  setBulkTags,
  onBulkAddTags
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-2xl mx-auto mt-20 rounded-lg"
    >
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bulk Add Tags</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bulkTags">Tags</Label>
            <TextArea
              placeholder="Enter tags separated by commas or new lines&#10;e.g., React, TypeScript, CSS&#10;or&#10;React&#10;TypeScript&#10;CSS"
              rows={8}
              value={bulkTags}
              onChange={(value) => setBulkTags(value)}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Separate tags with commas or put each tag on a new line.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="dark:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={onBulkAddTags}
              disabled={!bulkTags.trim()}
            >
              Add Tags
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BulkAddModal;
