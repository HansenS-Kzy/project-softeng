import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import ToastContainer from '@/components/ui/ToastContainer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Metro Park — Smart Parking System',
  description:
    'Next-generation smart parking management system with real-time slot monitoring, EV charging integration, and intelligent booking.',
  keywords: ['smart parking', 'EV charging', 'parking management', 'Metro Park'],
  openGraph: {
    title: 'Metro Park — Smart Parking System',
    description: 'Real-time occupancy monitoring and intelligent parking reservations.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AppProvider>
          {children}
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
