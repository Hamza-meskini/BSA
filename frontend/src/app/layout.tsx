import type {Metadata} from 'next';
import {Roboto, Montserrat} from 'next/font/google';
import './globals.css';
// Navbar import removed

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Brand Buzz Analyzer',
  description: 'Analyze brand sentiment across different platforms.',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/icon.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        url: '/apple-icon.png',
        type: 'image/png',
        sizes: '180x180',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        sizes: '180x180',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${roboto.variable} ${montserrat.variable} antialiased bg-background text-foreground`}>
        {/* Navbar removed from here */}
        <main> {/* Removed padding pt-16, will be handled in page.tsx */}
          {children}
        </main>
      </body>
    </html>
  );
}
