import React from "react"
import type { Metadata } from 'next'
import { Montserrat, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import TelegramProvider from '@/components/providers/telegram-provider'

const _montserrat = Montserrat({ 
  weight: ['400', '500', '600', '700', '800'], 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-montserrat',
  display: 'swap'
})
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'ШЕФ-МОНТАЖ — Маркетплейс монтажников',
  description: 'Найди надежную бригаду за 5 минут. Репутация, цифровые подтверждения, прозрачность.',
  generator: 'v0.app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={_montserrat.variable}>
      <head>
        <meta name="theme-color" content="#2A2A2A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className={`font-montserrat antialiased overflow-hidden`}>
        <TelegramProvider>
          {children}
        </TelegramProvider>
        <Analytics />
      </body>
    </html>
  )
}
