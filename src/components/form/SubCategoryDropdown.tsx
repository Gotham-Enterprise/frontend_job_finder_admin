import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SubCategory, SubCategoryDropdownItem } from '@/services/types/subCategoryTypes';

interface SubCategoryDropdownProps {
  selectedSubCategories: Array<{ name: string; id?: string }>;
  availableSubCategories: SubCategory[];
  onSelectionChange: (selected: Array<{ name: string; id?: string }>) => void;
  placeholder?: string;
  maxSelections?: number;
}

export default function SubCategoryDropdown({
  selectedSubCategories,
  availableSubCategories,
  onSelectionChange,
  placeholder = "Search or add subcategories...",
  maxSelections = 10
}: SubCategoryDropdownProps) {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return availableSubCategories;

    const lowerInput = inputValue.toLowerCase();
    return availableSubCategories.filter(subCat =>
      subCat.name.toLowerCase().includes(lowerInput) &&
      !selectedSubCategories.some(selected => selected.id === subCat.id)
    );
  }, [inputValue, availableSubCategories, selectedSubCategories]);

  const shouldShowCreateOption = useMemo(() => {
    if (!inputValue.trim()) return false;
    
    const exactMatch = availableSubCategories.some(
      subCat => subCat.name.toLowerCase() === inputValue.toLowerCase()
    );
    
    const isAlreadySelected = selectedSubCategories.some(
      selected => selected.name.toLowerCase() === inputValue.toLowerCase()
    );

    return !exactMatch && !isAlreadySelected;
  }, [inputValue, availableSubCategories, selectedSubCategories]);

  const allOptions: SubCategoryDropdownItem[] = useMemo(() => {
    const suggestions = filteredSuggestions.map(subCat => ({
      id: subCat.id,
      name: subCat.name,
      isNew: false
    }));

    if (shouldShowCreateOption) {
      suggestions.unshift({
        id: `new-${Date.now()}`,
        name: inputValue.trim(),
        isNew: true
      });
    }

    return suggestions;
  }, [filteredSuggestions, shouldShowCreateOption, inputValue]);

  useEffect(() => {
    const clickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const addSubCategory = (option: SubCategoryDropdownItem) => {
    if (selectedSubCategories.length >= maxSelections) return;

    const newSubCategory = option.isNew 
      ? { name: option.name }
      : { name: option.name, id: option.id };

    onSelectionChange([...selectedSubCategories, newSubCategory]);
    setInputValue('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const removeSubCategory = (index: number) => {
    const updatedSelection = selectedSubCategories.filter((_, i) => i !== index);
    onSelectionChange(updatedSelection);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!isDropdownOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setIsDropdownOpen(true);
      setHighlightedIndex(0);
      return;
    }

    if (!isDropdownOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < allOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : allOptions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && allOptions[highlightedIndex]) {
          addSubCategory(allOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <div className="flex flex-wrap gap-1 mb-1">
            {selectedSubCategories.map((subCat, index) => (
              <span
                key={`${subCat.id || subCat.name}-${index}`}
                className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full"
              >
                {subCat.name}
                <button
                  type="button"
                  onClick={() => removeSubCategory(index)}
                  className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 focus:outline-none"
                  aria-label={`Remove ${subCat.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={selectedSubCategories.length === 0 ? placeholder : ''}
            disabled={selectedSubCategories.length >= maxSelections}
            className="w-full border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
          />
        </div>

        {selectedSubCategories.length >= maxSelections && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Max {maxSelections} items
            </span>
          </div>
        )}
      </div>

      {isDropdownOpen && allOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {allOptions.map((option, index) => (
            <button
              key={option.id}
              type="button"
              onClick={() => addSubCategory(option)}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                index === highlightedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100'
                  : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option.name}</span>
                {option.isNew && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Create new
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {isDropdownOpen && allOptions.length === 0 && inputValue && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            No subcategories found
          </div>
        </div>
      )}
    </div>
  );
}
