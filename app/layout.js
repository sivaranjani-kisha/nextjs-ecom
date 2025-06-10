"use client";
 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useState } from 'react';
import CustomHeader from "@/components/Headernew";
import CustomFooter from "@/components/Footer";
import GlobalModals from '@/components/GlobalModals';
import { AuthProvider } from '@/context/AuthContext';
import { usePathname } from "next/navigation";
import Head from "next/head";
import Script from "next/script";
import { AuthModal } from '@/components/AuthModal';
import { ModalProvider } from '@/context/ModalContext';
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from '@/context/CartContext';
 
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
 
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
 
export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState('');
 
  return (
    <html lang="en">
      <Head>
        <link rel="shortcut icon" href="/images/logo/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
       
        <Script defer src="@/app/app.bundle.js" />
        <script
          defer
          src="https://wowtheme7.com/tailwind/marketpro/js/app.bundle.js"
        ></script>
        <style>
          {`
            @font-face {
              font-family: 'Atlassian Sans';
              font-style: normal;
              font-weight: 400 653;
              font-display: swap;
              src: local('AtlassianSans'), local('Atlassian Sans Text'),
                url('/fonts/AtlassianSans-latin.woff2') format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
                U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F,
                U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
           
            /* Prevent scrolling when mobile menu is open */
            body.menu-open {
              overflow: hidden;
              height: 100vh;
            }
          `}
        </style>
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div id="modal-root"></div>
        <ModalProvider>
          <WishlistProvider>
            <CartProvider>
              <AuthProvider>
                {!pathname?.startsWith("/admin") && <CustomHeader />}
                <main className="relative">
                  {children}
                </main>
                {!pathname?.startsWith("/admin") && <CustomFooter />}
                <GlobalModals />
              </AuthProvider>
            </CartProvider>
          </WishlistProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
 