"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/toaster"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
