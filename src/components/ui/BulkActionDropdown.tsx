import React, { useState, useRef, useEffect } from "react";
import Button from "./button/Button";
import { ChevronDownIcon } from "@/icons";
import { usePermissions } from "@/hooks/usePermissions";

interface BulkActionDropdownProps {
  selectedItems: string[];
  itemType: string;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  onBulkPublish?: () => void;
  onBulkDraft?: () => void;
  isDeleting?: boolean;
  isUpdatingStatus?: boolean;
  className?: string;
  permissions?: {
    create?: boolean;
    update?: boolean;
    delete?: boolean;
  };
}

const BulkActionDropdown: React.FC<BulkActionDropdownProps> = ({
  selectedItems,
  itemType,
  onBulkDelete,
  onClearSelection,
  onBulkPublish,
  onBulkDraft,
  isDeleting = false,
  isUpdatingStatus = false,
  className = "",
  permissions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const hasSelectedItems = selectedItems.length > 0;
  const buttonDisabled = isDeleting || isUpdatingStatus;

  // Check permissions for different actions based on item type
  const modulePermission =
    itemType === "posts" || itemType === "categories" || itemType === "tags" ? "blog" : "general";
  const canPublish = hasPermission(modulePermission, "edit") && onBulkPublish;
  const canDraft = hasPermission(modulePermission, "edit") && onBulkDraft;
  const canArchive = hasPermission(modulePermission, "delete") && onBulkDelete;

  // Check if there are any available actions based on permissions
  const hasAvailableActions: boolean = !!(canPublish || canDraft || canArchive);

  // Only show the dropdown if there are selected items and at least some actions are available
  if (!hasSelectedItems) {
    return null;
  }

  if (!hasAvailableActions) {
    return null;
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <Button
        variant="text-primary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={buttonDisabled || !hasAvailableActions}
        endIcon={<ChevronDownIcon className="w-4 h-4" />}
        className={`px-4 py-2 w-[140px] ${
          hasAvailableActions && !buttonDisabled
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isDeleting ? "Deleting..." : isUpdatingStatus ? "Updating..." : "Bulk Actions"}
      </Button>

      {isOpen && hasAvailableActions && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-gray-800 focus:outline-none"
          style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
        >
          <div className="py-2">
            {/* Status Update Options - only show for posts */}
            {itemType === "posts" && canPublish && (
              <button
                onClick={() => {
                  onBulkPublish();
                  setIsOpen(false);
                }}
                disabled={isUpdatingStatus}
                className="flex w-full items-start px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">Publish</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Set selected {itemType} as published</div>
                </div>
              </button>
            )}

            {itemType === "posts" && canPublish && canDraft && (
              <div className="border-t border-gray-100 dark:border-gray-700 mx-2"></div>
            )}

            {itemType === "posts" && canDraft && (
              <button
                onClick={() => {
                  onBulkDraft();
                  setIsOpen(false);
                }}
                disabled={isUpdatingStatus}
                className="flex w-full items-start px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">Draft</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Set selected {itemType} as draft</div>
                </div>
              </button>
            )}

            {/* Add separator if status options are shown */}
            {itemType === "posts" && (canPublish || canDraft) && canArchive && (
              <div className="border-t border-gray-100 dark:border-gray-700 mx-2"></div>
            )}

            {/* Only show Archive if user has delete permission */}
            {canArchive && (
              <button
                onClick={() => {
                  onBulkDelete();
                  setIsOpen(false);
                }}
                disabled={isDeleting}
                className="flex w-full items-start px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">Archive</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Move selected {itemType} to Archive</div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActionDropdown;
