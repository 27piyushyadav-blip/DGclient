/*
 * File: src/components/TimezoneSelect.js
 * SR-DEV: Timezone Selector with Auto-Detection
 * Used in the BookingModal to ensure accurate scheduling.
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to get formatted timezone list
const getTimezoneList = () => {
  const timezones = Intl.supportedValuesOf("timeZone");
  
  // Format to show offset (e.g., "(UTC+05:30) Asia/Kolkata")
  return timezones.map(tz => {
    try {
      const offset = new Date().toLocaleTimeString("en-US", {
        timeZone: tz,
        timeZoneName: "shortOffset",
      }).split(" ")[0]; // Just get the +XX:XX part
      
      const parts = offset.match(/[\+\-]\d{1,2}:\d{2}/) || ["UTC"]; // Extract the offset
      const offsetString = parts[0];

      // Format TZ string for display
      const formattedOffset = offsetString === "UTC" ? "(UTC)" : `(UTC${offsetString})`;

      return {
        value: tz,
        label: `${formattedOffset} ${tz}`,
      };
    } catch (e) {
      // Fallback for less common timezones
      return { value: tz, label: tz };
    }
  });
};

export default function TimezoneSelect({ defaultValue, onSelect, className }: { 
  defaultValue?: string; 
  onSelect: (value: string) => void; 
  className?: string; 
}) {
  const [selectedTz, setSelectedTz] = useState<string | null>(null);
  
  // Memoize the large list of timezones for performance
  const timezoneOptions = useMemo(() => getTimezoneList(), []);
  
  // Auto-detect and set user's local timezone on mount
  useEffect(() => {
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const initialTz = defaultValue || localTz;
    setSelectedTz(initialTz);
    onSelect(initialTz);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  // Handle selection change
  const handleSelect = (value) => {
    setSelectedTz(value);
    onSelect(value);
  };

  const selectedLabel = useMemo(() => {
    return timezoneOptions.find(opt => opt.value === selectedTz)?.label || "Select Timezone";
  }, [selectedTz, timezoneOptions]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="timezone-select" className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
        <Clock className="w-4 h-4" /> Your Timezone
      </Label>
      <Select value={selectedTz || undefined} onValueChange={handleSelect}>
        <SelectTrigger id="timezone-select" className="w-full h-11 text-base bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
          <SelectValue placeholder="Select Timezone">
            {selectedLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72 overflow-y-auto">
          {timezoneOptions.map(tz => (
            <SelectItem key={tz.value} value={tz.value} className="text-sm">
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        All times displayed are based on your selected timezone ({selectedTz || 'Loading...'}).
      </p>
    </div>
  );
}