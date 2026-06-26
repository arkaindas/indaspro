import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NetworkBanner } from "@/components/layout/NetworkBanner";
import { PwaInstallBanner } from "@/components/layout/PwaInstallBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://indaspro.vercel.app"),
  title: "Indaspro — Home services at your doorstep",
  description: "Find trusted electricians, plumbers & more near you",
  manifest: "/manifest.json",
  themeColor: "#0D1B4B",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Indaspro",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "Indaspro — Home services at your doorstep",
    description: "Find trusted electricians, plumbers & more near you",
    images: ["/og-banner.svg"],
    type: "website",
  },
};

const themeScript = `(function(){var t=localStorage.getItem('indaspro-theme')||'system';if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else if(t==='light'){document.documentElement.classList.add('light')}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before CSS to prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <LangProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <NetworkBanner />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <PwaInstallBanner />
          </AuthProvider>
        </LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
