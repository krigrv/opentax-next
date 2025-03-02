import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import DonationNotificationBar from "@/components/common/DonationNotificationBar";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenTax - AI-Powered Tax Advisory Platform",
  description: "AI-powered tax advisory for Indian citizens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <DonationNotificationBar />
          <Header />
          <div className="min-h-screen bg-[hsl(var(--background))] pt-16">
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
