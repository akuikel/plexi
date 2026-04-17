import type React from 'react';
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(async () => {
    try {
      const { initializeScheduler } = await import('@/db/services');
      initializeScheduler();
    } catch (error) {
      console.warn('Scheduler initialization skipped:', error instanceof Error ? error.message : String(error));
    }
  }, 1000);
}

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Plexi | AI Voice Solutions',
  description: "AI-powered voice agents that handle your calls so you don't have to.",
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable} antialiased`}>
      <body className="font-sans" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
