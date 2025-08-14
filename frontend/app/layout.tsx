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
          <Box minH="100vh" maxW="7xl" mx="auto" py={6} px={{ base: 4, sm: 6, lg: 8 }}>
              {/* {children} */}
              <Box
                mb={8}
                textAlign="center"
                fontWeight="medium"
                color="gray.600"
                py={8}
              >
                A personal library system for you book collection. <br /><br />Coming soon Aug 31, 2025
              </Box>
          </Box>
          <NewsletterModal />
        </Providers>
      </body>
    </html>
  );
}
