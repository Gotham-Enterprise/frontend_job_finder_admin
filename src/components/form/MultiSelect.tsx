import React, { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  text: string;
  selected: boolean;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  maxDisplayItems?: number;
}

let zIndexCounter = 1000;

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultSelected = [],
  onChange,
  disabled = false,
  className = "",
  placeholder = "Select options...",
  maxDisplayItems = 3,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const [zIndex, setZIndex] = useState(1000);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      zIndexCounter += 10;
      setZIndex(zIndexCounter);
    }
  }, [isOpen]);

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


  useEffect(() => {
    if (isOpen) {
      const event = new CustomEvent('multiselect-open', { detail: { ref: dropdownRef.current } });
      document.dispatchEvent(event);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOtherDropdownOpen = (event: CustomEvent) => {
      if (event.detail.ref !== dropdownRef.current && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('multiselect-open', handleOtherDropdownOpen as EventListener);
    return () => {
      document.removeEventListener('multiselect-open', handleOtherDropdownOpen as EventListener);
    };
  }, [isOpen]);

  const toggleDropdown = (e?: React.MouseEvent) => {
    if (disabled) return;
    if (e) e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const initSelect = (optionValue: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newSelectedOptions = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((value) => value !== optionValue)
      : [...selectedOptions, optionValue];

    setSelectedOptions(newSelectedOptions);
    if (onChange) onChange(newSelectedOptions);
  };

  const removeOption = (value: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newSelectedOptions = selectedOptions.filter((opt) => opt !== value);
    setSelectedOptions(newSelectedOptions);
    if (onChange) onChange(newSelectedOptions);
  };

  const selectedValuesText = selectedOptions.map(
    (value) => options.find((option) => option.value === value)?.text || ""
  );

  const displayedItems = selectedValuesText.slice(0, maxDisplayItems);
  const remainingCount = selectedValuesText.length - maxDisplayItems;  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
      )}

      <div className="relative inline-block w-full">
        <div className="relative flex flex-col items-center">
          <div 
            onClick={toggleDropdown} 
            className={`w-full cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="min-h-[2.75rem] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 shadow-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:focus-within:border-blue-400">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex flex-wrap gap-1.5 min-h-[1.75rem] items-center">
                  {selectedValuesText.length > 0 ? (
                    <>
                      {displayedItems.map((text, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                        >
                          <span className="truncate max-w-[120px]">{text}</span>
                          <button
                            type="button"
                            onClick={(e) => removeOption(selectedOptions[index], e)}
                            className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100 focus:outline-none"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {remainingCount > 0 && (
                        <div className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                          +{remainingCount} more
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {placeholder}
                    </span>
                  )}
                </div>
                <div className="flex-shrink-0 ml-2">
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {isOpen && (
            <div
              className="absolute left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600 max-h-60 overflow-y-auto"
              style={{ zIndex }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                {options.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No options available
                  </div>
                ) : (
                  options.map((option, index) => {
                    const isSelected = selectedOptions.includes(option.value);
                    return (
                      <div
                        key={option.value}
                        className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        onClick={(e) => initSelect(option.value, e)}
                      >
                        {/* Custom Checkbox */}
                        <div className="flex-shrink-0 mr-3">
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? "bg-blue-500 border-blue-500 text-white"
                                : "border-gray-300 dark:border-gray-500 hover:border-blue-400"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-2.5 h-2.5 fill-current"
                                viewBox="0 0 20 20"
                              >
                                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        {/* Option Text */}
                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium transition-colors duration-150 ${
                              isSelected
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {option.text}
                          </div>
                        </div>
                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="flex-shrink-0 ml-2">
                            <svg
                              className="w-4 h-4 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected count indicator */}
      {selectedOptions.length > 0 && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {selectedOptions.length} item{selectedOptions.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
