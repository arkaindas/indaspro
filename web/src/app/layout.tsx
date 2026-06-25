import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NetworkBanner } from "@/components/layout/NetworkBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://indaspro.vercel.app"),
  title: "Indaspro — Home services at your doorstep",
  description: "Find trusted electricians, plumbers & more near you",
  manifest: "/manifest.json",
  openGraph: {
    title: "Indaspro — Home services at your doorstep",
    description: "Find trusted electricians, plumbers & more near you",
    images: ["/og-banner.svg"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LangProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <NetworkBanner />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
