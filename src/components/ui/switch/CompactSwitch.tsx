'use client';

import React, { useState, useEffect } from 'react';

interface CompactSwitchProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

const CompactSwitch: React.FC<CompactSwitchProps> = ({
  label,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  size = 'xs',
  variant = 'primary',
}) => {
  const [isChecked, setIsChecked] = useState(checked ?? defaultChecked);

  useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const toggleSwitch = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  const sizeConfig = {
    xs: {
      container: 'h-4 w-7',
      knob: 'h-3 w-3',
      translate: 'translate-x-3',
      spacing: 'top-0.5 left-0.5',
    },
    sm: {
      container: 'h-5 w-9',
      knob: 'h-4 w-4',
      translate: 'translate-x-4',
      spacing: 'top-0.5 left-0.5',
    },
    md: {
      container: 'h-6 w-11',
      knob: 'h-5 w-5',
      translate: 'translate-x-5',
      spacing: 'top-0.5 left-0.5',
    },
  };

  const variantConfig = {
    primary: isChecked ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700',
    success: isChecked ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700',
    warning: isChecked ? 'bg-yellow-500' : 'bg-gray-200 dark:bg-gray-700',
    danger: isChecked ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700',
  };

  const config = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleSwitch}
        disabled={disabled}
        className={`
          relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105
          ${config.container}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : variantConfig[variant]}
        `}
      >
        <span
          className={`
            ${config.knob} ${config.spacing}
            pointer-events-none absolute inline-block rounded-full bg-white shadow-lg transform transition-all duration-300 ease-in-out
            ${isChecked ? config.translate : 'translate-x-0'}
            ${isChecked ? 'shadow-md' : 'shadow-sm'}
          `}
        />
      </button>
      <label 
        className={`text-xs font-medium cursor-pointer select-none transition-colors duration-200 ${
          disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
        onClick={toggleSwitch}
      >
        {label}
      </label>
    </div>
  );
};

export default CompactSwitch;
