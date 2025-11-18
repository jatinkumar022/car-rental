import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, value, ...props }: React.ComponentProps<"input">) {
  // Handle NaN values for number inputs
  const safeValue = type === "number" && (value === undefined || value === null || (typeof value === "number" && isNaN(value))) 
    ? "" 
    : value;

  // For number inputs, use text type to remove increment buttons and allow backspace
  const inputType = type === "number" ? "text" : type;
  
  // Handle number input to only allow digits
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number" && props.onChange) {
      const value = e.target.value;
      // Allow empty string or valid numbers
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        props.onChange(e);
      }
    }
  };

  return (
    <input
      type={inputType}
      data-slot="input"
      value={safeValue}
      inputMode={type === "number" ? "numeric" : undefined}
      pattern={type === "number" ? "[0-9]*" : undefined}
      className={cn(
        "file:text-foreground placeholder:text-[#6C6C80] mt-1.5 selection:bg-[#00D09C] selection:text-white dark:bg-input/30 border-[#E5E5EA] h-12 w-full min-w-0 rounded-lg border bg-white px-4 py-3 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[#00D09C] focus-visible:ring-[#00D09C]/10 focus-visible:ring-[3px] focus-visible:border-2",
        "aria-invalid:ring-[#FF4444]/20 aria-invalid:border-[#FF4444]",
        type === "number" && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
      onChange={type === "number" ? handleNumberInput : props.onChange}
      {...props}
    />
  )
}

export { Input }
