import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import AntdProvider from '@/components/providers/AntdProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import '@/styles/globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ustriy System',
  description: 'Платформа для подачі та обробки заявок на ремонт у студентських кампусах',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="uk" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeProvider>
          <AntdProvider>{children}</AntdProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
