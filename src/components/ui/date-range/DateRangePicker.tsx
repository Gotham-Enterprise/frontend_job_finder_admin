"use client";
import React, { useEffect, useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Button from '../button/Button';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DateRangePickerProps {
  value?: DateRange | undefined;
  onChange?: (range: DateRange | undefined) => void;
  numberOfMonths?: number;
  weekStartsOn?: number;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  numberOfMonths = 2,
  weekStartsOn = 1,
  placeholder = 'Date Range',
  className = '',
  buttonClassName = '',
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(value);

  // Keep internal state in sync
  useEffect(() => { setInternalRange(value); }, [value]);

  const startDate = internalRange?.from ? internalRange.from.toISOString().slice(0,10) : '';
  const endDate = internalRange?.to ? internalRange.to.toISOString().slice(0,10) : '';

  useEffect(() => {
    if (internalRange?.from && internalRange?.to) {
      setOpen(false);
    }
  }, [internalRange]);

  const handleSelect = (range: DateRange | undefined) => {
    setInternalRange(range);
    onChange?.(range);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalRange(undefined);
    onChange?.(undefined);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => !disabled && setOpen(o => !o)}
        className={`flex items-center gap-2 ${buttonClassName}`}
        disabled={disabled}
      >
        <CalendarIcon className="w-4 h-4" />
        <span className="text-xs">
          {startDate && endDate
            ? `${new Date(startDate).toLocaleDateString(undefined,{month:'short',day:'numeric'})} - ${new Date(endDate).toLocaleDateString(undefined,{month:'short',day:'numeric'})}`
            : startDate
              ? new Date(startDate).toLocaleDateString()
              : placeholder}
        </span>
        {(startDate || endDate) && !disabled && (
          <span
            onClick={clear}
            className="ml-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            &times;
          </span>
        )}
      </Button>
      {open && !disabled && (
        <div className="absolute right-0 mt-2 z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3" role="dialog" aria-label="Date range picker">
          <DayPicker
            mode="range"
            selected={internalRange}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
            defaultMonth={internalRange?.from}
            weekStartsOn={weekStartsOn as any}
            className="text-xs"
            classNames={{
              months: 'flex flex-row gap-4',
              caption: 'flex justify-center py-1 mb-1 relative items-center',
              nav: 'space-x-1 flex items-center',
              nav_button: 'h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border',
              table: 'w-full border-collapse',
              head_row: 'flex',
              head_cell: 'text-gray-500 rounded-md w-8 font-normal text-[10px]',
              row: 'flex w-full mt-1',
              cell: 'text-center text-[11px] relative p-0 w-8 h-8',
              day: 'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
                day_selected: 'bg-primary text-white rounded-md',
                day_range_start: 'bg-primary text-white rounded-l-md',
                day_range_end: 'bg-primary text-white rounded-r-md',
                day_range_middle: 'bg-primary/10 text-primary',
              day_outside: 'text-gray-300 opacity-50',
              day_disabled: 'text-gray-300 opacity-50',
                day_today: 'border border-primary'
            }}
          />
        </div>
      )}
    </div>
  );
};

export type { DateRange };
export default DateRangePicker;
