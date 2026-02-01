import React from "react"
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import TelegramProvider from '@/components/providers/telegram-provider'
import Background3D from '@/components/layouts/Background3D'
import { Toaster } from '@/components/ui/Toaster'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { DynamicLayout } from '@/components/layout/DynamicLayout'
import InstallPWA from '@/components/InstallPWA'
import { DemoBanner } from '@/components/DemoBanner'
import { validateEnv } from '@/lib/env'

// Проверяем environment variables при старте (только на сервере)
if (typeof window === 'undefined') {
  validateEnv()
}

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap'
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'ШЕФ-МОНТАЖ — Маркетплейс монтажников',
  description: 'Найди надежную бригаду за 5 минут. Репутация, цифровые подтверждения, прозрачность.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Шеф-Монтаж',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: ['/apple-icon.png', '/icon-192.png'],
  },
  openGraph: {
    title: 'ШЕФ-МОНТАЖ',
    description: 'Маркетплейс монтажников для мероприятий',
    url: 'https://v0-sh-ef-montaz-h.vercel.app',
    type: 'website',
    images: [
      {
        url: 'https://v0-sh-ef-montaz-h.vercel.app/images/helmets-3-hard-hats.png',
        width: 1200,
        height: 630,
        alt: 'ШЕФ-МОНТАЖ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ШЕФ-МОНТАЖ',
    description: 'Маркетплейс монтажников для мероприятий',
    images: ['https://v0-sh-ef-montaz-h.vercel.app/images/helmets-3-hard-hats.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#E85D2F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} font-inter text-white min-h-screen`}
        style={{
          backgroundImage: 'url(/images/bg-dashboard.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <DemoBanner />
        <TelegramProvider>
          <ToastProvider>
            <DynamicLayout>
              {children}
            </DynamicLayout>
          </ToastProvider>
        </TelegramProvider>
        <InstallPWA />
        <Analytics />
      </body>
    </html>
  )
}
