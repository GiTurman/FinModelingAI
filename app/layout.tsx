import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import StoreProvider from '@/components/layout/StoreProvider'

export const metadata: Metadata = {
  title: 'FM — Georgia Financial Model',
  description: '60-Month Financial Model • Tbilisi, Georgia • GEL',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <StoreProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-5 bg-slate-50 dark:bg-slate-950">
                  {children}
                </main>
              </div>
            </div>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
