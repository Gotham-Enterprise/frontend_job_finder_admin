import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      switch: 'h-5 w-9',
      circle: 'h-4 w-4',
      translate: 'translate-x-4',
      text: 'text-sm'
    },
    md: {
      switch: 'h-5 w-9',
      circle: 'h-4 w-4',
      translate: 'translate-x-4',
      text: 'text-sm'
    },
    lg: {
      switch: 'h-6 w-11',
      circle: 'h-5 w-5',
      translate: 'translate-x-5',
      text: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <label
        id={`${id}-label`}
        htmlFor={id}
        className={`
          ${currentSize.text} font-medium text-gray-700 dark:text-gray-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => !disabled && onChange(!checked)}
      >
        {label}
      </label>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex ${currentSize.switch} rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20
          ${checked 
            ? 'bg-primary' 
            : 'bg-gray-200 dark:bg-gray-700'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:bg-opacity-80'
          }
        `}
      >
        <span
          className={`
            ${currentSize.circle} inline-block rounded-full bg-white shadow-sm
            transform transition duration-200 ease-in-out
            ${checked ? currentSize.translate : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
