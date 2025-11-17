"use client"

import * as React from "react"
import { Clock3, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const hours = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 1
  return hour < 10 ? `0${hour}` : `${hour}`
})

const minutes = ["00", "15", "30", "45"]
const periods = ["AM", "PM"]

interface TimePickerProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function TimePicker({
  label,
  value,
  onChange,
  placeholder = "Select time",
  className,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hour, setHour] = React.useState<string>("")
  const [minute, setMinute] = React.useState<string>("")
  const [period, setPeriod] = React.useState<string>("AM")

  React.useEffect(() => {
    if (!value) {
      setHour("")
      setMinute("")
      setPeriod("AM")
      return
    }

    const [time, meridiem] = value.split(" ")
    if (!time || !meridiem) return

    const [h, m] = time.split(":")
    if (!h || !m) return

    setHour(h.padStart(2, "0"))
    setMinute(m.padStart(2, "0"))
    setPeriod(meridiem.toUpperCase() === "PM" ? "PM" : "AM")
  }, [value])

  const handleUpdate = (
    newHour = hour,
    newMinute = minute,
    newPeriod = period
  ) => {
    if (newHour && newMinute && newPeriod) {
      const nextValue = `${newHour}:${newMinute} ${newPeriod}`
      onChange?.(nextValue)
      setIsOpen(false)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-xs sm:text-sm font-medium text-[#1A1A2E]">
          {label}
        </label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-9 sm:h-10 md:h-12 rounded-lg sm:rounded-xl border-2 border-[#E5E5EA] hover:border-[#00D09C] transition-all text-xs sm:text-sm",
              !value && "text-muted-foreground",
              value && "border-[#00D09C] bg-[#E6FFF9]"
            )}
          >
            <Clock3 className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#00D09C]" />
            {value ? (
              <span className="font-medium text-[#1A1A2E]">{value}</span>
            ) : (
              <span className="text-[#6C6C80]">{placeholder}</span>
            )}
            <ChevronDown className="ml-auto h-3 w-3 text-[#6C6C80]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] max-w-[calc(100vw-2rem)] p-4 rounded-2xl border-2 border-[#E5E5EA] shadow-xl">
          <div className="flex items-center gap-1">
            <Select
              value={hour || undefined}
              onValueChange={(val) => {
                setHour(val)
                if (minute && period) {
                  const nextValue = `${val}:${minute} ${period}`
                  onChange?.(nextValue)
                }
              }}
            >
              <SelectTrigger className="h-9 w-[77px] rounded-xl border-2 border-[#E5E5EA] focus:ring-[#00D09C] focus:border-[#00D09C]">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-[#E5E5EA]">
                {hours.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-lg font-semibold text-[#6C6C80]">:</span>
            <Select
              value={minute || undefined}
              onValueChange={(val) => {
                setMinute(val)
                if (hour && period) {
                  const nextValue = `${hour}:${val} ${period}`
                  onChange?.(nextValue)
                }
              }}
            >
              <SelectTrigger className="h-9 w-[77px] rounded-xl border-2 border-[#E5E5EA] focus:ring-[#00D09C] focus:border-[#00D09C]">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-[#E5E5EA]">
                {minutes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={period}
              onValueChange={(val) => {
                setPeriod(val)
                if (hour && minute) {
                  const nextValue = `${hour}:${minute} ${val}`
                  onChange?.(nextValue)
                }
              }}
            >
              <SelectTrigger className="h-9 w-[77px] rounded-xl border-2 border-[#E5E5EA] focus:ring-[#00D09C] focus:border-[#00D09C]">
                <SelectValue placeholder="AM" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-[#E5E5EA]">
                {periods.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-3 mt-4">
            <Button
              variant="ghost"
              className="flex-1 text-sm text-[#6C6C80] hover:text-[#00D09C]"
              onClick={() => {
                setHour("")
                setMinute("")
                setPeriod("AM")
                onChange?.("")
                setIsOpen(false)
              }}
            >
              Clear
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleUpdate()}
              disabled={!hour || !minute || !period}
            >
              Set Time
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

