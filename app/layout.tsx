 import type { Metadata, Viewport } from 'next'
 import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/toast'

export const metadata: Metadata = {
   title: '临床病人管理助手',
   description: '面向住院医生的移动端病人管理 PWA',
   manifest: '/manifest.json'
 }
 
 export const viewport: Viewport = {
   themeColor: '#2563eb',
   width: 'device-width',
   initialScale: 1,
   maximumScale: 1,
   userScalable: false
 }
 
 export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
     <html lang="zh-CN" suppressHydrationWarning>
      <body className="bg-surface text-main transition-colors duration-300">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
     </html>
   )
 }
