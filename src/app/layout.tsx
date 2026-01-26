import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DemoAuthProvider } from "@/components/DemoAuthProvider";
import ThemeContextWrapper from "@/components/ThemeContextWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mind Namo - Your Safe Space for Mental Wellness",
  description: "Connecting you with certified experts for secure, private, and personalized therapy sessions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeContextWrapper>
          <DemoAuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <FooterWrapper />
            </div>
            <Toaster />
          </DemoAuthProvider>
        </ThemeContextWrapper>
      </body>
    </html>
  );
}
