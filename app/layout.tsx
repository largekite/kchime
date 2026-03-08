import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { ClientInit } from '@/components/layout/ClientInit';
import { AppleSDKInit } from '@/components/layout/AppleSDKInit';
import { Providers } from '@/components/layout/Providers';
import { NotificationPrompt } from '@/components/layout/NotificationPrompt';

export const metadata: Metadata = {
  title: 'KChime — Daily Conversation Coach',
  description: 'Your daily conversation coach for sounding natural in English — smart replies, live listening, and real-world scenarios.',
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
  themeColor: '#4f46e5',
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
          <AppleSDKInit />
          <Navbar />
          <main className="mx-auto max-w-4xl px-4 py-6 pb-24 md:pb-6 md:pl-56">{children}</main>
          <NotificationPrompt />
        </Providers>
      </body>
    </html>
  );
}
