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
