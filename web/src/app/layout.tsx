import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'
import { WalletProvider } from '../contexts/WalletContext';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Momentum - Blockchain-Powered Task Manager',
  description: 'A modern task manager with blockchain verification',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.className} ${inter.variable} bg-dark-900 text-white min-h-screen overflow-x-hidden`}>
        <WalletProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-dark-900">
              {children}
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
              duration: 5000,
              success: {
                iconTheme: {
                  primary: '#0a84ff',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
} 