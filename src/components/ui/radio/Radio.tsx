import React from 'react';

export interface RadioProps {
  id?: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Radio: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  onChange,
  disabled = false,
  className = '',
  children,
}) => {
  return (
    <label 
      className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      htmlFor={id}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-4 w-4 border-gray-300 focus:ring-brand-500 disabled:opacity-50"
        style={{ accentColor: '#006D36' }}
      />
      {children && (
        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
          {children}
        </span>
      )}
    </label>
  );
};

export default Radio;
