"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid, type Locale } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Calendar } from "./calendar";


interface DatePickerProps {
  /** Date value in "yyyy-MM-dd" string format */
  value?: string;
  /** Callback when date changes, returns "yyyy-MM-dd" string format */
  onChange?: (date: string) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Disable the date picker */
  disabled?: boolean;
  /** Custom class name for the trigger button */
  className?: string;
  /** Locale for date formatting */
  locale?: Locale;
  /** ID for the trigger button */
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className,
  locale = es,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse string date to Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    if (date && onChange) {
      onChange(format(date, "yyyy-MM-dd"));
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="text-muted-foreground" />
          {selectedDate ? (
            <span className="capitalize">
              {format(selectedDate, "PPP", { locale })}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
    <PopoverContent className=" flex w-auto min-w-[280px]  bg-white justify-center p-0" align="center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          locale={locale}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
