"use client";

import { ThemeProvider } from "next-themes";

interface ThemeProvidersProps {
  children: React.ReactNode;
  attribute: string;
  forcedTheme?: string;
}

export default function ThemeProviders({
  children,
  attribute,
  forcedTheme,
}: ThemeProvidersProps) {
  return (
    <ThemeProvider attribute={attribute} forcedTheme={forcedTheme}>
      {children}
    </ThemeProvider>
  );
}
