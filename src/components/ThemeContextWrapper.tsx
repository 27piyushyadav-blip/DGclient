/*
 * File: src/components/ThemeContextWrapper.tsx
 * SR-DEV: Client Component Wrapper for next-themes ThemeProvider.
 * ACTION: Removed redundant 'mounted' check since the component is now correctly placed inside <body>.
 */
"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

interface ThemeContextWrapperProps {
  children: ReactNode;
}

export default function ThemeContextWrapper({ children }: ThemeContextWrapperProps) {
  // Note: The direct placement inside <body> in layout.tsx fixes the script errors (2, 3, 4).
  // The ThemeProvider component handles the remaining client-side logic itself.

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
