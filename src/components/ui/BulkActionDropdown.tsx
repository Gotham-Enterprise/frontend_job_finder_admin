import React, { useState, useRef, useEffect } from 'react';
import Button from './button/Button';
import { ChevronDownIcon } from '@/icons';

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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hasSelectedItems = selectedItems.length > 0;
  const buttonDisabled = !hasSelectedItems || isDeleting || isUpdatingStatus;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <Button
        variant="text-primary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={buttonDisabled}
        endIcon={<ChevronDownIcon className="w-4 h-4" />}
        className={`px-4 py-2 w-[140px] ${
          hasSelectedItems 
            ? "bg-green-600 hover:bg-green-700 text-white" 
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isDeleting ? 'Deleting...' : isUpdatingStatus ? 'Updating...' : 'Bulk Actions'}
      </Button>

      {isOpen && hasSelectedItems && (
        <div 
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-gray-800 focus:outline-none" 
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
        >
          <div className="py-2">
            {/* Status Update Options - only show for posts */}
            {itemType === 'posts' && onBulkPublish && (
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
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Set selected {itemType} as published
                  </div>
                </div>
              </button>
            )}
            
       
            {itemType === 'posts' && onBulkPublish && onBulkDraft && (
              <div className="border-t border-gray-100 dark:border-gray-700 mx-2"></div>
            )}
            
            {itemType === 'posts' && onBulkDraft && (
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
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Set selected {itemType} as draft
                  </div>
                </div>
              </button>
            )}
            
            {/* Add separator if status options are shown */}
            {itemType === 'posts' && (onBulkPublish || onBulkDraft) && (
              <div className="border-t border-gray-100 dark:border-gray-700 mx-2"></div>
            )}
            
            <button
              onClick={() => {
                onBulkDelete();
                setIsOpen(false);
              }}
              disabled={isDeleting}
              className="flex w-full items-start px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {itemType === 'users' ? 'Inactive Users' : 'Archive'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {itemType === 'users' 
                    ? 'Move to inactive users' 
                    : `Move to archive selected ${itemType}`
                  }
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActionDropdown;
