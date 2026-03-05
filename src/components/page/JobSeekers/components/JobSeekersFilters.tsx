import React, { useState, useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import SearchableSelect from '../../../ui/SearchableSelect';
import Label from '../../../form/Label';
import Input from '../../../ui/input/Input';
import { CalenderIcon } from '@/icons';
import { JobSeekersFiltersProps } from '@/services/types/JobSeekersTypes';

const JobSeekersFilters: React.FC<JobSeekersFiltersProps> = ({
  filters,
  onFilterChange,
  occupationOptions,
  stateOptions,
  statusOptions,
  licenseOptions,
  licenseStateOptions,
  hasActiveFilters,
  clearIndividualFilter,
}) => {
  const [cityInput, setCityInput] = useState(filters.city || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const startDatePickerRef = useRef<flatpickr.Instance | null>(null);
  const endDatePickerRef = useRef<flatpickr.Instance | null>(null);

  const radiusOptions = [
    { value: '', label: 'Any Distance' },
    { value: '1', label: '1 mile' },
    { value: '3', label: '3 miles' },
    { value: '5', label: '5 miles' },
    { value: '10', label: '10 miles' },
    { value: '25', label: '25 miles' },
    { value: '50', label: '50 miles' },
    { value: '100', label: '100 miles' },
  ];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange('city', cityInput);
    }, 500); 

    return () => clearTimeout(timeoutId);
  }, [cityInput, onFilterChange]);

  useEffect(() => {
    setCityInput(filters.city || '');
  }, [filters.city]);

  
  const isRadiusDisabled = !filters.city || !filters.location;


  useEffect(() => {
    if (isRadiusDisabled && filters.radius) {
      onFilterChange('radius', undefined);
    }
  }, [isRadiusDisabled, filters.radius, onFilterChange]);

  // Initialize start date picker
  useEffect(() => {
    if (startDateRef.current && !startDatePickerRef.current) {
      startDatePickerRef.current = flatpickr(startDateRef.current, {
        dateFormat: 'Y-m-d',
        defaultDate: filters.registrationStartDate || undefined,
        clickOpens: true,
        allowInput: false,
        disableMobile: true,
        position: 'auto',
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            const date = selectedDates[0];
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            onFilterChange('registrationStartDate', formattedDate);
          }
        },
        onOpen: () => {
          // Mark the calendar as part of the filter component
          const calendar = document.querySelector('.flatpickr-calendar.open');
          if (calendar) {
            calendar.setAttribute('data-filter-datepicker', 'true');
          }
        },
      });
    }

    return () => {
      if (startDatePickerRef.current) {
        startDatePickerRef.current.destroy();
        startDatePickerRef.current = null;
      }
    };
  }, []);

  // Update start date picker when filter changes
  useEffect(() => {
    if (startDatePickerRef.current && filters.registrationStartDate) {
      startDatePickerRef.current.setDate(filters.registrationStartDate, false);
    } else if (startDatePickerRef.current && !filters.registrationStartDate) {
      startDatePickerRef.current.clear();
    }
  }, [filters.registrationStartDate]);

  // Initialize end date picker
  useEffect(() => {
    if (endDateRef.current && !endDatePickerRef.current) {
      endDatePickerRef.current = flatpickr(endDateRef.current, {
        dateFormat: 'Y-m-d',
        defaultDate: filters.registrationEndDate || undefined,
        clickOpens: true,
        allowInput: false,
        disableMobile: true,
        position: 'auto',
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            const date = selectedDates[0];
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            onFilterChange('registrationEndDate', formattedDate);
          }
        },
        onOpen: () => {
          // Mark the calendar as part of the filter component
          const calendar = document.querySelector('.flatpickr-calendar.open');
          if (calendar) {
            calendar.setAttribute('data-filter-datepicker', 'true');
          }
        },
      });
    }

    return () => {
      if (endDatePickerRef.current) {
        endDatePickerRef.current.destroy();
        endDatePickerRef.current = null;
      }
    };
  }, []);

  // Update end date picker when filter changes
  useEffect(() => {
    if (endDatePickerRef.current && filters.registrationEndDate) {
      endDatePickerRef.current.setDate(filters.registrationEndDate, false);
    } else if (endDatePickerRef.current && !filters.registrationEndDate) {
      endDatePickerRef.current.clear();
    }
  }, [filters.registrationEndDate]);

  return (
    <div ref={containerRef} className="space-y-6 max-h-[500px] overflow-y-auto pr-2 pl-1 relative">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Occupation
            </Label>
            {filters.occupationId && (
              <button
                onClick={() => clearIndividualFilter('occupationId')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <SearchableSelect
            value={filters.occupationId?.toString() || ''}
            onChange={(value: string) => onFilterChange('occupationId', value === '' ? undefined : parseInt(value))}
            options={occupationOptions}
            placeholder="Select Occupation..."
            searchPlaceholder="Search occupations..."
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </Label>
            {filters.city && (
              <button
                onClick={() => clearIndividualFilter('city')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <Input
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Enter city..."
            className="w-full"
          />
        </div>
     
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              State
            </Label>
            {filters.location && (
              <button
                onClick={() => clearIndividualFilter('location')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <SearchableSelect
            value={filters.location || ''}
            onChange={(value: string) => onFilterChange('location', value)}
            options={stateOptions}
            placeholder="Select state..."
            searchPlaceholder="Search states..."
            className="w-full"
          />
        </div>
           <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Radius
            </Label>
            {filters.radius && (
              <button
                onClick={() => clearIndividualFilter('radius')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <SearchableSelect
            value={filters.radius?.toString() || ''}
            onChange={(value: string) => {
              const numericValue = value === '' ? undefined : parseInt(value, 10);
              onFilterChange('radius', numericValue);
            }}
            options={radiusOptions}
            placeholder={isRadiusDisabled ? "Select city and state first..." : "Select radius..."}
            searchPlaceholder="Search radius..."
            className="w-full"
            disabled={isRadiusDisabled}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </Label>
            {filters.status && (
              <button
                onClick={() => clearIndividualFilter('status')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <SearchableSelect
            value={filters.status || ''}
            onChange={(value: string) => onFilterChange('status', value === '' ? undefined : value)}
            options={statusOptions}
            placeholder="Select status..."
            searchPlaceholder="Search statuses..."
            className="w-full"
          />
        </div>

        {/* License Name Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              License Name
            </Label>
            {filters.licenseName && (
              <button
                onClick={() => clearIndividualFilter('licenseName')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <SearchableSelect
            value={filters.licenseName || ''}
            onChange={(value: string) => onFilterChange('licenseName', value)}
            options={licenseOptions}
            placeholder="Select license..."
            searchPlaceholder="Search licenses..."
            className="w-full"
          />
        </div>

        {/* License Issuing State Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              License Issuing State
            </Label>
            {filters.licenseIssuingState && (
              <button
                onClick={() => clearIndividualFilter('licenseIssuingState')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <SearchableSelect
            value={filters.licenseIssuingState || ''}
            onChange={(value: string) => onFilterChange('licenseIssuingState', value)}
            options={licenseStateOptions}
            placeholder="Select issuing state..."
            searchPlaceholder="Search issuing states..."
            className="w-full"
          />
        </div>

        {/* Registration Start Date Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Registration Date From
            </Label>
            {filters.registrationStartDate && (
              <button
                onClick={() => {
                  clearIndividualFilter('registrationStartDate');
                  if (startDatePickerRef.current) {
                    startDatePickerRef.current.clear();
                  }
                }}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative">
            <input
              ref={startDateRef}
              type="text"
              placeholder="Select start date..."
              readOnly
              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 bg-white text-gray-900 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800 cursor-pointer"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <CalenderIcon className="size-5" />
            </span>
          </div>
        </div>

        {/* Registration End Date Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Registration Date To
            </Label>
            {filters.registrationEndDate && (
              <button
                onClick={() => {
                  clearIndividualFilter('registrationEndDate');
                  if (endDatePickerRef.current) {
                    endDatePickerRef.current.clear();
                  }
                }}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative">
            <input
              ref={endDateRef}
              type="text"
              placeholder="Select end date..."
              readOnly
              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 bg-white text-gray-900 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800 cursor-pointer"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <CalenderIcon className="size-5" />
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .flatpickr-calendar {
          background-color: #1f2937 !important;
          border: 1px solid #4b5563 !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
          border-radius: 8px !important;
          z-index: 99999 !important;
        }
        .flatpickr-calendar.open {
          display: block !important;
          z-index: 99999 !important;
        }
        .flatpickr-months {
          background-color: #1f2937 !important;
        }
        .flatpickr-month {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
        }
        .flatpickr-current-month {
          color: #f3f4f6 !important;
        }
        .flatpickr-current-month .flatpickr-monthDropdown-months,
        .flatpickr-current-month .cur-year {
          font-weight: 600 !important;
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
        }
        .flatpickr-weekdays {
          background-color: #374151 !important;
        }
        .flatpickr-weekday {
          color: #d1d5db !important;
        }
        .flatpickr-days {
          background-color: #1f2937 !important;
        }
        .flatpickr-day {
          color: #f3f4f6 !important;
          border: none !important;
        }
        .flatpickr-day:hover {
          background-color: #374151 !important;
          border-color: #374151 !important;
        }
        .flatpickr-day.selected {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }
        .flatpickr-day.today {
          border-color: #3b82f6 !important;
          color: #3b82f6 !important;
        }
        .flatpickr-prev-month,
        .flatpickr-next-month {
          color: #f3f4f6 !important;
          fill: #f3f4f6 !important;
        }
        .flatpickr-prev-month:hover,
        .flatpickr-next-month:hover {
          color: #3b82f6 !important;
          fill: #3b82f6 !important;
        }
        .flatpickr-current-month .flatpickr-monthDropdown-months {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
          border: 1px solid #4b5563 !important;
        }
        .flatpickr-current-month input.cur-year {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
          border: 1px solid #4b5563 !important;
        }
        .numInputWrapper span {
          border-color: #4b5563 !important;
          background: #374151 !important;
          color: #f3f4f6 !important;
        }
        .numInputWrapper span:hover {
          background: #4b5563 !important;
        }
      `}</style>
    </div>
  );
};

export default JobSeekersFilters;
