import React from 'react';
import Button from './button/Button';
import { TrashBinIcon } from '@/icons';

interface BulkActionBarProps {
  selectedItems: string[];
  totalItems: number;
  itemType: string; // e.g., "categories", "posts", "tags"
  onBulkDelete: () => void;
  onSelectAll: (selected: boolean) => void;
  onClearSelection: () => void;
  isDeleting?: boolean;
  className?: string;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedItems,
  totalItems,
  itemType,
  onBulkDelete,
  onSelectAll,
  onClearSelection,
  isDeleting = false,
  className = "",
}) => {
  const allSelected = selectedItems.length === totalItems && totalItems > 0;
  const someSelected = selectedItems.length > 0 && !allSelected;

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {selectedItems.length} {itemType} selected
            </span>
            
            {totalItems > selectedItems.length && (
              <button
                onClick={() => onSelectAll(true)}
                className="text-sm text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 underline"
              >
                Select all {totalItems}
              </button>
            )}
          </div>
          
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 underline"
          >
            Clear selection
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkDelete}
            disabled={isDeleting}
            startIcon={<TrashBinIcon />}
            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {isDeleting ? 'Deleting...' : `Delete ${selectedItems.length} ${itemType}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
