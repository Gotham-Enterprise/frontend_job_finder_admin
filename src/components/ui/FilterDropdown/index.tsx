import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

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
  className = "",
  onClearAll,
  hasActiveFilters = false,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside a flatpickr calendar
      const isDatePickerClick = 
        (target as HTMLElement).closest?.('.flatpickr-calendar') ||
        (target as HTMLElement).hasAttribute?.('data-filter-datepicker');
      const isInsideDropdown = dropdownRef.current?.contains(target);
      const isInsideTrigger = triggerRef.current?.contains(target);
      const isInsideNestedDropdown = (target as Element).closest?.(
        '[data-filter-nested-dropdown]'
      );
      if (!isDatePickerClick && !isInsideDropdown && !isInsideTrigger && !isInsideNestedDropdown) {
        onClose();
      }
    };

    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", clickOutside);
      document.addEventListener("keydown", escape);
    }

    return () => {
      document.removeEventListener("mousedown", clickOutside);
      document.removeEventListener("keydown", escape);
    };
  }, [isOpen, onClose, triggerRef]);

  useEffect(() => {
    if (isOpen && dropdownRef.current && triggerRef.current) {
      const trigger = triggerRef.current;
      const dropdown = dropdownRef.current;

      const triggerRect = trigger.getBoundingClientRect();
      const dropdownRect = dropdown.getBoundingClientRect();
      const viewportPadding = 16;
      const gap = 8;
      const maxDropdownWidth = window.innerWidth - viewportPadding * 2;
      const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding - gap;
      const spaceAbove = triggerRect.top - viewportPadding - gap;

      let top: number;
      let maxHeight: number;
      const showAbove = spaceAbove > spaceBelow && spaceAbove > 0;

      if (showAbove) {
        top = triggerRect.top - gap;
        maxHeight = Math.min(spaceAbove, 750);
      } else {
        top = triggerRect.bottom + gap;
        maxHeight = Math.min(Math.max(spaceBelow, 0), 750);
      }
      maxHeight = Math.min(maxHeight, window.innerHeight - viewportPadding * 2);

      let left = triggerRect.left;
      const effectiveWidth = Math.min(dropdownRect.width, maxDropdownWidth);
      if (left + effectiveWidth > window.innerWidth - viewportPadding) {
        left = window.innerWidth - effectiveWidth - viewportPadding;
      }
      left = Math.max(viewportPadding, left);

      dropdown.style.top = `${top}px`;
      dropdown.style.left = `${left}px`;
      dropdown.style.maxHeight = `${maxHeight}px`;
      dropdown.style.transform = showAbove ? "translateY(-100%)" : "none";
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className={`fixed z-50 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-y-auto ${className}`}
      style={{
        top: 0,
        left: 0,
        minWidth: "318px",
        maxWidth: "calc(100vw - 20px)",
        maxHeight: "calc(100vh - 20px)",
      }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          {onClearAll && (
            <button
              onClick={onClearAll}
              className={`text-sm font-normal transition-colors ${
                hasActiveFilters
                  ? "text-primary hover:text-primary/80"
                  : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
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
