"use client";
import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface OptionGroup {
  label: string;
  options: Option[];
}

interface SelectProps {
  options?: Option[];
  /** Renders options under labeled group headers, in the given group order.
   *  Replaces `options` as the list source; search filters within groups. */
  groups?: OptionGroup[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const Select: React.FC<SelectProps> = ({
  options: optionsProp,
  groups,
  placeholder = "",
  onChange,
  className = "",
  defaultValue = "",
  value,
  disabled = false,
  searchable = false,
  searchPlaceholder = "Search...",
}) => {
  const options = groups ? groups.flatMap((group) => group.options) : (optionsProp ?? []);
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const currentValue = value !== undefined ? value : internalValue;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const matchesSearch = (option: Option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase());
  const filteredOptions = searchable ? options.filter(matchesSearch) : options;
  // Grouped filtering keeps the group order; emptied groups are hidden
  const filteredGroups = groups
    ?.map((group) => ({
      ...group,
      options: searchable ? group.options.filter(matchesSearch) : group.options,
    }))
    .filter((group) => group.options.length > 0);

  // Get the selected option label for display
  const selectedOption = options.find((option) => option.value === currentValue);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const handleOptionSelect = (optionValue: string) => {
    if (disabled) return;

    if (value === undefined) {
      setInternalValue(optionValue);
    }

    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen && searchable) {
      // Focus search input when opening dropdown
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const renderOption = (option: Option) => (
    <button
      key={option.value}
      type="button"
      onClick={() => handleOptionSelect(option.value)}
      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
        currentValue === option.value
          ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
          : "text-gray-700 dark:text-gray-300"
      }`}
    >
      {option.label}
    </button>
  );

  if (!searchable) {
    // Fallback to native select when searchable is false
    return (
      <select
        disabled={disabled}
        className={`h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
            : currentValue
              ? "text-gray-800 dark:text-white/90"
              : "text-gray-400 dark:text-gray-400"
        } ${className}`}
        value={currentValue}
        onChange={(e) => handleOptionSelect(e.target.value)}
      >
        <option disabled value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
          {placeholder}
        </option>
        {filteredGroups
          ? filteredGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))
          : options.map((option) => (
              <option key={option.value} value={option.value} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                {option.label}
              </option>
            ))}
      </select>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Custom Select Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className={`h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm text-left shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-800 ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
            : currentValue
              ? "text-gray-800 dark:text-white/90 bg-white dark:bg-gray-900"
              : "text-gray-400 dark:text-gray-400 bg-white dark:bg-gray-900"
        }`}
      >
        <span className="block truncate">{displayValue}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredGroups ? (
                filteredGroups.map((group) => (
                  <div key={group.label}>
                    <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {group.label}
                    </div>
                    {group.options.map(renderOption)}
                  </div>
                ))
              ) : (
                filteredOptions.map(renderOption)
              )
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
