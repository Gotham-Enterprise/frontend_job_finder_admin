'use client'

import Select from '@/components/form/Select'

export interface SingleSelectProps {
  label?: string
  options: { value: string; label: string; disabled?: boolean }[]
  name?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  inputClassName?: string
  disabled?: boolean
  errorMessage?: string
  searchable?: boolean
}

const SingleSelect: React.FC<SingleSelectProps> = ({
  label,
  options,
  value,
  onChange,
  disabled,
  placeholder,
  required,
  errorMessage,
  searchable,
}) => {
  return (
    <div className="w-full flex flex-col">
      {label && (
        <label className="text-sm md:text-base mb-1">
          {label}
          {required && <span className="text-primary">*</span>}
        </label>
      )}
      <Select
        options={options}
        value={value || ''}
        onChange={(val) => onChange?.(val)}
        placeholder={placeholder || 'Select an option'}
        disabled={disabled}
        searchable={searchable}
        searchPlaceholder="Type to filter…"
      />
      {errorMessage && (
        <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  )
}

export default SingleSelect
