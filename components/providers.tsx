 'use client'
 
 import { createContext, useContext, useEffect, useState } from 'react'
 import { getSettings } from '@/lib/db'
 
 type Theme = 'light' | 'dark' | 'system'
 
 interface ThemeContextValue {
   theme: Theme
   setTheme: (theme: Theme) => void
 }
 
 const ThemeContext = createContext<ThemeContextValue>({ theme: 'system', setTheme: () => {} })
 
 export function useTheme() {
   return useContext(ThemeContext)
 }
 
 function applyTheme(theme: Theme) {
   const root = document.documentElement
   root.classList.remove('light', 'dark')
   if (theme === 'system') {
     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
     root.classList.add(prefersDark ? 'dark' : 'light')
   } else {
     root.classList.add(theme)
   }
 }
 
 export function Providers({ children }: { children: React.ReactNode }) {
   const [theme, setThemeState] = useState<Theme>('system')
   const [mounted, setMounted] = useState(false)
 
   useEffect(() => {
     setMounted(true)
     getSettings().then((s) => {
       setThemeState(s.theme)
       applyTheme(s.theme)
     })
   }, [])
 
   useEffect(() => {
     if (!mounted) return
     applyTheme(theme)
   }, [theme, mounted])
 
   const setTheme = (t: Theme) => {
     setThemeState(t)
   }
 
   return (
     <ThemeContext.Provider value={{ theme, setTheme }}>
       {children}
     </ThemeContext.Provider>
   )
 }
