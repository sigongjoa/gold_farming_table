'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  console.debug('ThemeProvider: Entering component');
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
