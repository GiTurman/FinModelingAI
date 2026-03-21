import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import StoreProvider from '@/components/layout/StoreProvider'
import { Sora, IBM_Plex_Mono } from 'next/font/google'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sans',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'FM — Georgia Financial Model',
  description: '60-Month Financial Model • Tbilisi, Georgia • GEL',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" suppressHydrationWarning>
      <body className={`${sora.variable} ${ibmPlexMono.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
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
