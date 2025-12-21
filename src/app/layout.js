/*
 * File: src/app/layout.js
 * SR-DEV: Root layout, fonts, metadata.
 * ACTION: FIXED Missing <body> tag error (Error 1) by placing ThemeContextWrapper inside <body>.
 */

import { Inter } from "next/font/google";
import { getServerSession } from "next-auth/next";
import "./globals.css";

import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import FooterWrapper from "@/components/FooterWrapper";
import { Toaster } from "@/components/ui/sonner";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import ThemeContextWrapper from "@/components/ThemeContextWrapper"; // File 124

const inter = Inter({ 
  subsets: ["latin"], 
  display: "swap",
  variable: "--font-inter",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "Mind Namo | Mental Wellness Platform",
    template: "%s | Mind Namo",
  },
  description: "Connect with verified experts for therapy, counseling, and life coaching. Secure video sessions and instant booking.",
  keywords: ["mental health", "therapy", "counseling", "psychologist", "video call", "wellness", "India"],
  authors: [{ name: "Mind Namo Team" }],
  creator: "Mind Namo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Mind Namo | Your Mental Wellness Partner",
    description: "Expert support at your fingertips. Book sessions with top psychologists today.",
    siteName: "Mind Namo",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mind Namo Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mind Namo",
    description: "Connect with certified experts for personalized mental health support.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-[100dvh] flex flex-col">
        {/* ThemeProvider (Client Component) now wraps the content *inside* body */}
        <ThemeContextWrapper> 
          <AuthProvider session={session}>
            <Header />
            
            <main className="flex-1 flex flex-col relative">
              {children}
            </main>
            
            <FooterWrapper />
            
            {/* Global Toast Notifications */}
            <Toaster position="bottom-right" richColors />
          </AuthProvider>
        </ThemeContextWrapper>
      </body>
    </html>
  );
}