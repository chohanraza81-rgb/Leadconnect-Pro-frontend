// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LeadConnect Pro — Find Leads. Close Deals.',
    template: '%s | LeadConnect Pro',
  },
  description:
    'AI-powered B2B lead generation tool. Find verified business leads, discover local insights, and grow your agency faster.',
  keywords: ['lead generation', 'B2B leads', 'SEO agency', 'email finder', 'local business leads'],
  authors: [{ name: 'LeadConnect Pro' }],
  openGraph: {
    title: 'LeadConnect Pro — Find Leads. Close Deals.',
    description: 'AI-powered B2B lead generation tool.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
