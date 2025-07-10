import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  className?: string;
  onClearAll?: () => void;
  hasActiveFilters?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  className = '',
  onClearAll,
  hasActiveFilters = false,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', clickOutside);
      document.addEventListener('keydown', escape);
    }

    return () => {
      document.removeEventListener('mousedown', clickOutside);
      document.removeEventListener('keydown', escape);
    };
  }, [isOpen, onClose, triggerRef]);

  useEffect(() => {
    if (isOpen && dropdownRef.current && triggerRef.current) {
      const trigger = triggerRef.current;
      const dropdown = dropdownRef.current;
      
      const triggerRect = trigger.getBoundingClientRect();
      const dropdownRect = dropdown.getBoundingClientRect();

      const top = triggerRect.bottom + window.scrollY + 8;
      let left = triggerRect.left + window.scrollX;

      if (left + dropdownRect.width > window.innerWidth) {
        left = window.innerWidth - dropdownRect.width - 16;
      }
      
      if (left < 16) {
        left = 16;
      }
      
      dropdown.style.top = `${top}px`;
      dropdown.style.left = `${left}px`;
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className={`fixed z-50 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 ${className}`}
      style={{ top: 0, left: 0, minWidth: '318px' }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
          {onClearAll && (
            <button
              onClick={onClearAll}
              className={`text-sm font-normal transition-colors ${
                hasActiveFilters
                  ? 'text-primary hover:text-primary/80'
                  : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              disabled={!hasActiveFilters}
            >
              Clear all
            </button>
          )}
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default FilterDropdown;
