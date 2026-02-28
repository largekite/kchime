import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'KChime — Daily Conversation Coach',
  description: 'Get naturally good at daily English conversations with AI-powered reply suggestions, live listening, and real-world scenarios.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
