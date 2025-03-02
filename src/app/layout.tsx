import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import DonationNotificationBar from "@/components/common/DonationNotificationBar";

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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <DonationNotificationBar />
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
