"use client";
import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface OptionsDropdownProps {
  options: DropdownOption[];
  triggerText?: string;
  triggerIcon?: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

const OptionsDropdown: React.FC<OptionsDropdownProps> = ({
  options,
  triggerText = "Options",
  triggerIcon,
  trigger,
  className = "",
  align = "right"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    if (isOpen && buttonRef.current) {
  
      setTimeout(() => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const dropdownHeight = options.length * 40 + 16;
          
        
          if (rect.bottom + dropdownHeight > viewportHeight - 20) {
            setDropdownPosition('top');
          } else {
            setDropdownPosition('bottom');
          }
        }
      }, 10);
    }
  }, [isOpen, options.length]);

  const handleOptionClick = (option: DropdownOption) => {
    if (!option.disabled) {
      option.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {trigger ? (
        <div
          ref={buttonRef as any}
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer"
        >
          {trigger}
        </div>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {triggerIcon}
          <span className="ml-2">{triggerText}</span>
          <svg
            className={`ml-2 h-4 w-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      {isOpen && (
        <div
          className={`absolute z-[999999] w-48 rounded-lg shadow-lg bg-white border-0 focus:outline-none ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          style={{ 
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)' 
          }}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.id}
                className={`group flex items-center w-full px-4 py-2 text-sm transition-colors ${
                  option.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : option.variant === 'danger'
                    ? 'text-red-700 hover:bg-red-50 hover:text-red-800'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => handleOptionClick(option)}
                disabled={option.disabled}
              >
                <span className={`mr-3 flex-shrink-0 ${
                  option.disabled
                    ? 'text-gray-300'
                    : option.variant === 'danger'
                    ? 'text-red-500 group-hover:text-red-600'
                    : 'text-gray-400 group-hover:text-gray-500'
                }`}>
                  {option.icon}
                </span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionsDropdown;
