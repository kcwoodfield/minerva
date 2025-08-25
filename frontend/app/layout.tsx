import type { Metadata } from "next";
import { Providers } from './providers'
import GoogleAnalytics from "@/components/GoogleAnalytics";
import NewsletterModal from "@/components/NewsletterModal";
import './globals.css'
import { headers } from 'next/headers';
import { Box } from '@chakra-ui/react';
import { fonts } from './fonts'
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Minerva, organize your books.",
  description: "An inventory system for a home library.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning className={fonts.lora.className}>
      <body suppressHydrationWarning>
        <Providers>
          <GoogleAnalytics />
          {!isLoginPage && <Header />}
          <div className="min-h-screen max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {children}
          </div>
          <NewsletterModal />
        </Providers>
      </body>
    </html>
  );
}
