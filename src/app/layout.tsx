import type { Metadata } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fsm.naileditpropertysolutions.com'),
  title: 'Nailed It Property Solutions | Field Service Management (FSM)',
  description: 'Operating system for property maintenance, repair services, scheduling, and billing in Rome, GA.',
  icons: {
    icon: '/logo-icon.png',
    shortcut: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
  openGraph: {
    title: 'Nailed It Property Solutions | Field Service Management',
    description: 'Operating system for property maintenance, repair services, scheduling, and billing in Rome, GA.',
    url: 'https://fsm.naileditpropertysolutions.com',
    siteName: 'Nailed It Property Solutions',
    images: [
      {
        url: '/logo-full.png',
        width: 1200,
        height: 630,
        alt: 'Nailed It Property Solutions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <body className="font-body bg-[#0a0a0a] text-[#fdfbf7] min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
