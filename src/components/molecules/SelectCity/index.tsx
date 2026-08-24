'use client'

import { useState } from 'react'
import { useCitiesByState } from '@/lib/useStatesCities'
import { cn } from '@/lib/utils'

const SelectCity = ({
  value,
  placeholder,
  inputClassName,
  stateValue,
  onChange,
  disabled,
}: {
  value?: string
  placeholder?: string
  inputClassName?: string
  stateValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { data: cities, isLoading } = useCitiesByState(stateValue || null)

  const filteredCities = cities?.filter((city) =>
    city.toLowerCase().includes((value || '').toLowerCase())
  ) || []

  const isDisabled = disabled || !stateValue

  return (
    <div className="relative">
      <input
        type="text"
        value={value || ''}
        onChange={(e) => {
          onChange?.(e.target.value)
          if (!isOpen && e.target.value && stateValue) {
            setIsOpen(true)
          }
        }}
        placeholder={
          placeholder ||
          (!stateValue ? 'Select a state first' : isLoading ? 'Loading cities...' : 'Enter or search city')
        }
        disabled={isDisabled || isLoading}
        onFocus={() => {
          if (stateValue && !isLoading && !isOpen && !disabled) {
            setIsOpen(true)
          }
        }}
        className={cn(
          'h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
          isDisabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800',
          inputClassName,
        )}
      />

      {isOpen && stateValue && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-700">
          <div className="max-h-48 overflow-y-auto">
            {filteredCities.length > 0 ? (
              <>
                {filteredCities.slice(0, 100).map((city) => (
                  <div
                    key={city}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      onChange?.(city)
                      setIsOpen(false)
                    }}
                  >
                    {city}
                  </div>
                ))}
                {filteredCities.length > 100 && (
                  <div className="px-3 py-2 text-xs text-gray-500 border-t bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    Showing first 100 results. Keep typing to narrow down...
                  </div>
                )}
              </>
            ) : value ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No cities found. You can still enter it manually.
              </div>
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                Start typing to search cities
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default SelectCity
