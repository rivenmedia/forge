import type { ReactNode } from 'react'

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import { ThemeProvider } from 'next-themes'

import '@/app/globals.css'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import { siteConfig } from '@/config/site'
import { UserProvider } from '@/lib/auth'
import { getUser } from '@/lib/db/queries'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: siteConfig.name,
    description: siteConfig.description
}

export const viewport: Viewport = {
    maximumScale: 1
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    const userPromise = getUser()

    return (
        // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
        // https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors
        <html suppressHydrationWarning lang='en'>
            <body className={`${inter.className} bg-background text-foreground min-h-[100dvh] antialiased`}>
                <ThemeProvider attribute='class'>
                    <UserProvider userPromise={userPromise}>{children}</UserProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}
