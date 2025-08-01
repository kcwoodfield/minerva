import type { Metadata } from "next";
import { Providers } from './providers'
import MenuBar from "@/components/menubar";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import NewsletterModal from "@/components/NewsletterModal";
import './globals.css'
import { headers } from 'next/headers';
import { Box } from '@chakra-ui/react';
import { fonts } from './fonts'

export const metadata: Metadata = {
  title: "Minerva, organize your books.",
  description: "A simple inventory system for a home library.",
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
          {!isLoginPage && <MenuBar />}
          <Box minH="100vh" maxW="7xl" mx="auto" py={6} px={{ base: 4, sm: 6, lg: 8 }}>
            {children}
          </Box>
          <NewsletterModal />
        </Providers>
      </body>
    </html>
  );
}
