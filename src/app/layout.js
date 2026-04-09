'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import '../styles/globals.scss';
import { ThemeProvider } from '../components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {

  useEffect(() => {
    const isAuthPage = window.location.pathname === '/login' || window.location.pathname.startsWith('/api/');

    // Check if this specific tab has been authorized via login
    const isTabAuthorized = sessionStorage.getItem('tab_authorized');

    if (!isTabAuthorized && !isAuthPage) {
      // Clear token and cookie if opening in a new unauthorized tab
      localStorage.removeItem('token');
      document.cookie = 'auth-token=; path=/; max-age=0';
      window.location.href = '/login';
      return;
    }

    const token = localStorage.getItem('token');
    if (!token && !isAuthPage) {
      window.location.href = '/login';
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <title>3D Building Estimator - Create Your Dream Structure</title>
        <meta name="description" content="Interactive 3D building estimator for carports, barns, and custom structures" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}