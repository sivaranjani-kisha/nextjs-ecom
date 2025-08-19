"use client";
 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useState, useEffect } from "react";
import CustomHeader from "@/components/Headernew";
import CustomFooter from "@/components/Footer";
import GlobalModals from '@/components/GlobalModals';
import { AuthProvider } from '@/context/AuthContext';
import { usePathname, useParams } from "next/navigation";
import Head from "next/head";
import Script from "next/script";
import { AuthModal } from '@/components/AuthModal';
import { ModalProvider } from '@/context/ModalContext';
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from '@/context/CartContext';
import { HeaderProvider } from '@/context/HeaderContext';

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
  const { slug } = useParams();
  // const [showAuthModal, setShowAuthModal] = useState(false);
  // const [authError, setAuthError] = useState('');
 
  const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
  
    useEffect(() => {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/product/${slug}`);
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
  
          // If API returns an array
          if (Array.isArray(data)) {
            const foundProduct = data.find((p) => p.slug === slug);
            if (!foundProduct) throw new Error("Product not found");
            setProduct(foundProduct);
          }
          // If API returns a single object
          else if (data && data.slug) {
            setProduct(data);
          } else {
            throw new Error("Invalid product data");
          }
  
          if (data?.images?.length > 0) {
            setSelectedImage(`/uploads/products/${data.images[0]}`);
          }
        } catch (err) {
          console.error("Fetch error:", err);
          setError(err.message || "Something went wrong");
          setProduct(null);
        } finally {
          setLoading(false);
        }
      };
  
      if (slug) {
        fetchProduct();
      }
    }, [slug]);

     return (
    <html lang="en">
      <Head>
        <link rel="shortcut icon" href="/images/logo/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />





        <title>{product?.title || "Bharath Electronics"}</title>
        <meta name="description" content={product?.shortDescription || ""} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={product?.title || ""} />
        <meta property="og:description" content={product?.shortDescription || ""} />
        <meta
  property="og:image"
  content={
    product?.images?.length > 0
      ? `https://bea.divinfosys.com/uploads/products/${product.images[0]}`
      : ""
  }
/>

        <meta
          property="og:url"
          content={`https://bea.divinfosys.com/product/${product?.slug || ""}`}
        />
        <meta property="og:site_name" content="Bharath Electronics" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product?.title || ""} />
        <meta name="twitter:description" content={product?.shortDescription || ""} />
        <meta
  property="og:image"
  content={
    product?.images?.length > 0
      ? `https://bea.divinfosys.com/uploads/products/${product.images[0]}`
      : ""
  }
/>

       





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
        <HeaderProvider>
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
        </HeaderProvider>
      </body>
    </html>
  );
}
 