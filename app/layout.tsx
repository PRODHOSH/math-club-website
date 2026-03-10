import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: 'Mathematics Club | VIT Chennai',
  description: "Mathematics Club - VIT Chennai's Mathematics Club. Exploring where logic meets imagination.",
  icons: {
    icon: '/math-club-logo.jpeg',
  },
};

export const viewport: Viewport = {
  themeColor: '#eab308',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextTopLoader color="#eab308" height={2} showSpinner={false} />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
