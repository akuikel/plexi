import type React from 'react';
import type { Metadata } from 'next';
import { Space_Grotesk, DM_Sans } from 'next/font/google';
import './globals.css';

// Initialize scheduler only in production runtime (not during build)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  // Only run in development to avoid deployment issues
  setTimeout(async () => {
    try {
      const { initializeScheduler } = await import('@/db/services');
      initializeScheduler();
    } catch (error) {
      console.warn('Scheduler initialization skipped:', error instanceof Error ? error.message : String(error));
    }
  }, 1000); // Delay to ensure everything is loaded
}

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'Persa - AI Voice Assistant',
  description: 'AI-powered voice assistant that makes and receives calls on your behalf',
  generator: 'v0.app',
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
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
      <body className="font-sans" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
