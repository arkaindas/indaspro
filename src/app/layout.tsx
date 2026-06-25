import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/context/RoleContext';
import { LanguageProvider } from '@/context/LanguageContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Indaspro - আপনার ঘরের সেবা, এক ক্লিকে',
  description: 'Hyperlocal home services marketplace for West Bengal',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-background antialiased">
        <LanguageProvider>
          <AuthProvider>
            <RoleProvider>
              {children}
              <Toaster position="top-center" />
            </RoleProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
