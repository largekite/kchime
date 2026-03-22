import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { ClientInit } from '@/components/layout/ClientInit';
import { Providers } from '@/components/layout/Providers';
import { NotificationPrompt } from '@/components/layout/NotificationPrompt';

export const metadata: Metadata = {
  title: 'KChime — AI Reply Assistant',
  description: 'Never wonder how to reply again. KChime suggests the perfect response for texts, emails, and chats — instantly.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KChime',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d9488',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <Providers>
          <ClientInit />
          <Navbar />
          <main className="mx-auto max-w-4xl px-4 py-6 pb-24 md:pb-6 md:pl-56 lg:max-w-5xl lg:pl-64 lg:px-8 lg:py-8 xl:max-w-6xl">{children}</main>
          <NotificationPrompt />
        </Providers>
      </body>
    </html>
  );
}
