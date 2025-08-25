import type { Metadata } from "next";
import { Providers } from './providers'
import './globals.css'
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

  return (
    <html lang="en" suppressHydrationWarning className={fonts.lora.className}>
      <body suppressHydrationWarning>
        <Providers>
          <Header />
          <div className="min-h-screen max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
