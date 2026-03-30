// 'use client';

// import { Inter } from 'next/font/google';
// import '../styles/globals.scss';
// import { ThemeProvider } from '../components/ThemeProvider';

// const inter = Inter({ subsets: ['latin'] })

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <head>
//         <title>3D Building Estimator - Create Your Dream Structure</title>
//         <meta name="description" content="Interactive 3D building estimator for carports, barns, and custom structures" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//       </head>
//       <body className={inter.className} suppressHydrationWarning>
//         <ThemeProvider>
//           {children}
//         </ThemeProvider>
//       </body>
//     </html>
//   )
// }

'use client';

import { Inter } from 'next/font/google';
import '../styles/globals.scss';
import { ThemeProvider } from '../components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>3D Building Estimator - Create Your Dream Structure</title>
        <meta name="description" content="Interactive 3D building estimator for carports, barns, and custom structures" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}