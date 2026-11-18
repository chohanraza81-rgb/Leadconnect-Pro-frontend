// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
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
  keywords: [
    'lead generation',
    'B2B leads',
    'SEO agency',
    'email finder',
    'local business leads',
  ],
  authors: [{ name: 'LeadConnect Pro' }],
  openGraph: {
    title: 'LeadConnect Pro — Find Leads. Close Deals.',
    description: 'AI-powered B2B lead generation tool.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      dynamic
      appearance={{
        variables: {
          colorPrimary: '#4f46e5',
          borderRadius: '0.75rem',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} font-sans antialiased`}
          style={{
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
          }}
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
