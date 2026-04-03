import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Open Gauntlet',
    template: '%s — Open Gauntlet',
  },
  description: 'Practice for multi-level progressive coding assessments (CodeSignal ICF, CoderPad) used by Anthropic, Ramp, Coinbase, and Dropbox. One evolving system, four levels, 90 minutes.',
  keywords: ['CodeSignal ICF', 'progressive coding assessment', 'multi-level OA', 'coding interview practice', 'Anthropic interview', 'Ramp interview', 'CoderPad practice'],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Open Gauntlet',
    description: 'Practice for multi-level progressive coding assessments used by Anthropic, Ramp, Coinbase, and Dropbox.',
    type: 'website',
    siteName: 'Open Gauntlet',
  },
  twitter: {
    card: 'summary',
    title: 'Open Gauntlet',
    description: 'Practice for multi-level progressive coding assessments used by Anthropic, Ramp, Coinbase, and Dropbox.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable} dark h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
