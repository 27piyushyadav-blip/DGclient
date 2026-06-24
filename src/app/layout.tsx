import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ThemeContextWrapper from "@/components/ThemeContextWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import Header from "@/components/Header";
import BottomNavbar from "@/components/BottomNavbar";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";
import MobileHeader from "@/components/MobileHeader";

const siteUrl = process.env.NEXTAUTH_URL || "https://digitaloffices.com.au";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Mind Namo - Your Safe Space for Mental Wellness",
  description:
    "Connecting you with certified experts for secure, private, and personalized therapy sessions.",
};

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeContextWrapper>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <div className="sticky top-0 z-50 hidden md:block print:hidden">
                <Header />
              </div>
              <div className="block md:hidden print:hidden">
                <MobileHeader />
              </div>
              <main className="flex-1">{children}</main>
              <div className="print:hidden">
                <BottomNavbar />
              </div>
              <div className="print:hidden">
                <FooterWrapper />
              </div>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeContextWrapper>
      </body>
    </html>
  );
}
