import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@/icons';

interface BulkAction {
  key: string;
  label: string;
  variant?: 'danger' | 'primary' | 'secondary';
  icon?: React.ReactNode;
}

interface BulkActionDropdownProps {
  selectedCount: number;
  onAction: (action: string) => void;
  actions: BulkAction[];
  className?: string;
  isLoading?: boolean;
}

const BulkActionDropdown: React.FC<BulkActionDropdownProps> = ({
  selectedCount,
  onAction,
  actions,
  className = "",
  isLoading = false,
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

  const hasSelectedItems = selectedCount > 0;
  const buttonDisabled = !hasSelectedItems || isLoading;

  const getVariantStyles = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20';
      case 'primary':
        return 'text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20';
      case 'secondary':
        return 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/20';
      default:
        return 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/20';
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={buttonDisabled}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          hasSelectedItems 
            ? "bg-primary text-white hover:bg-primary/90 shadow-sm" 
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            Bulk Actions ({selectedCount})
            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && hasSelectedItems && !isLoading && (
        <div 
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" 
        >
          <div className="py-1">
            {actions.map((action) => (
              <button
                key={action.key}
                onClick={() => {
                  onAction(action.key);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors ${getVariantStyles(action.variant)}`}
              >
                {action.icon && (
                  <span className="flex-shrink-0">
                    {action.icon}
                  </span>
                )}
                <span className="flex-1 text-left font-medium">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActionDropdown;
