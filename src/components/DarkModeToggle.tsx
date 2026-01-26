/*
 * File: src/components/DarkModeToggle.tsx
 * SR-DEV: Theme Toggle Button (Light/Dark Mode)
 */

"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface DarkModeToggleProps {
  className?: string;
}

export default function DarkModeToggle({ className }: DarkModeToggleProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Switches between 'dark' and 'light'
    // 'system' is handled internally by next-themes
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
      className={className}
    >
      {/* Sun icon for Light theme (default state) */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-zinc-600 dark:text-zinc-400" />
      {/* Moon icon for Dark theme (hidden by default) */}
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-zinc-600 dark:text-zinc-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
