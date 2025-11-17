'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar } from './calendar';

interface DatePickerSingleProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  disabledDates?: string[]; // Array of date strings in YYYY-MM-DD format
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  placeholder?: string;
  label?: string;
  highlightedDates?: Date[];
  lockedDates?: Date[];
}

export function DatePickerSingle({
  date,
  onDateChange,
  disabledDates = [],
  minDate,
  maxDate,
  className,
  placeholder = 'Select date',
  label,
  highlightedDates = [],
  lockedDates = [],
}: DatePickerSingleProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  // Convert disabled date strings to Date objects
  const disabledDateObjects = React.useMemo(() => {
    return disabledDates.map((dateStr) => {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      return date;
    });
  }, [disabledDates]);

  const highlightedDateObjects = React.useMemo(() => {
    return highlightedDates.map((highlightDate) => {
      const date = new Date(highlightDate);
      date.setHours(0, 0, 0, 0);
      return date;
    });
  }, [highlightedDates]);

  const lockedDateObjects = React.useMemo(() => {
    return lockedDates.map((lockedDate) => {
      const date = new Date(lockedDate);
      date.setHours(0, 0, 0, 0);
      return date;
    });
  }, [lockedDates]);

  // Check if a date is disabled
  const isDateDisabled = (date: Date) => {
    // Normalize date to start of day for comparison
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    // Check if date is before minDate
    if (minDate) {
      const normalizedMinDate = new Date(minDate);
      normalizedMinDate.setHours(0, 0, 0, 0);
      if (normalizedDate < normalizedMinDate) {
        return true;
      }
    }

    // Check if date is after maxDate
    if (maxDate) {
      const normalizedMaxDate = new Date(maxDate);
      normalizedMaxDate.setHours(0, 0, 0, 0);
      if (normalizedDate > normalizedMaxDate) {
        return true;
      }
    }

    // Check if date is locked
    const isLocked = lockedDateObjects.some(
      (lockedDate) => lockedDate.getTime() === normalizedDate.getTime()
    );
    if (isLocked) {
      return true;
    }

    // Check if date is in disabledDates
    const dateStr = format(normalizedDate, 'yyyy-MM-dd');
    return disabledDates.includes(dateStr);
  };

  const handleSelect = (selected: Date | undefined) => {
    setSelectedDate(selected);
    
    if (onDateChange) {
      onDateChange(selected);
    }

    // Close popover when date is selected
    if (selected) {
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(undefined);
    if (onDateChange) {
      onDateChange(undefined);
    }
    setIsOpen(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-xs sm:text-sm font-medium text-[#1A1A2E]">{label}</Label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal h-9 sm:h-10 md:h-12 rounded-lg sm:rounded-xl border-2 border-[#E5E5EA] hover:border-[#00D09C] transition-all text-xs sm:text-sm',
              !selectedDate && 'text-muted-foreground',
              selectedDate && 'border-[#00D09C] bg-[#E6FFF9]'
            )}
          >
            <CalendarIcon className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#00D09C] shrink-0" />
            {selectedDate ? (
              <span className="font-medium text-[#1A1A2E] truncate">
                {format(selectedDate, 'LLL dd, y')}
              </span>
            ) : (
              <span className="text-[#6C6C80] truncate">{placeholder}</span>
            )}
            {selectedDate && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear date"
                className="ml-auto inline-flex items-center justify-center rounded-full p-0.5 hover:bg-[#E5E5EA] text-[#6C6C80] hover:text-[#1A1A2E] transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border-2 border-[#E5E5EA] max-w-[95vw] mx-auto" align="center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={isDateDisabled}
            modifiers={{
              booked: disabledDateObjects,
              highlighted: highlightedDateObjects,
              locked: lockedDateObjects,
            }}
            modifiersClassNames={{
              booked: 'bg-red-100 text-red-600 cursor-not-allowed opacity-70',
              highlighted:
                'bg-[#E6FFF9] text-[#00D09C] font-semibold border border-[#00D09C] rounded-md',
              locked:
                'bg-[#00D09C] text-white font-semibold cursor-not-allowed rounded-md',
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

