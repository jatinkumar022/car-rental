'use client';

import * as React from 'react';
import { Calendar } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: Date | string;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  className,
  label,
}: DatePickerProps) {
  const [dateValue, setDateValue] = React.useState<string>('');

  React.useEffect(() => {
    if (value) {
      const date = value instanceof Date ? value : new Date(value);
      setDateValue(date.toISOString().split('T')[0]);
    } else {
      setDateValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDateValue(newValue);
    
    if (onChange) {
      if (newValue) {
        const date = new Date(newValue);
        onChange(date);
      } else {
        onChange(null);
      }
    }
  };

  const minDateStr = minDate ? minDate.toISOString().split('T')[0] : undefined;
  const maxDateStr = maxDate ? maxDate.toISOString().split('T')[0] : undefined;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-[#2D2D44]">{label}</label>
      )}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C6C80] pointer-events-none" />
        <Input
          type="date"
          value={dateValue}
          onChange={handleChange}
          placeholder={placeholder}
          min={minDateStr}
          max={maxDateStr}
          disabled={disabled}
          className="pl-10"
        />
      </div>
    </div>
  );
}

