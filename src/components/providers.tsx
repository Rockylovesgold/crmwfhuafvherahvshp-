"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <TooltipProvider delayDuration={0}>
          {children}
          <Toaster richColors position="bottom-right" />
        </TooltipProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
