'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import '../styles/globals.scss';
import { ThemeProvider } from '../components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  useEffect(() => {
    const pathname = window.location.pathname;
    const isLoginPage = pathname === '/login';
    const isLogoutPage = pathname.startsWith('/api/');

    if (isLoginPage || isLogoutPage) return;

    // Tab-session check: if this tab has never completed a login,
    // redirect to /api/logout which clears the cookie server-side
    // and then redirects to /login. This handles "close tab = new login required".
    const isAuthorizedInTab = sessionStorage.getItem('estimator_is_authorized');

    if (!isAuthorizedInTab) {
      // No tab-level session — force logout and re-login
      window.location.replace('/api/logout');
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