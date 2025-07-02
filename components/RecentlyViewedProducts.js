// components/RecentlyViewedProducts.jsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Addtocart from "@/components/AddToCart";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "react-feather";
import ProductCard from "@/components/ProductCard";
const RecentlyViewedProducts = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // useEffect(() => {
  //   const stored = localStorage.getItem('recentlyViewed');
  //   if (stored) {
  //     setRecentProducts(JSON.parse(stored));
  //   }

  //   const checkIfMobile = () => {
  //     setIsMobile(window.innerWidth < 768);
  //   };

  //   checkIfMobile();
  //   window.addEventListener('resize', checkIfMobile);
  //   return () => window.removeEventListener('resize', checkIfMobile);
  // }, []);
useEffect(() => {
  const stored = localStorage.getItem('recentlyViewed');
  if (stored) {
    const parsed = JSON.parse(stored);
    setRecentProducts(parsed);
  }

  const checkIfMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);

  // Fetch brand names if only ObjectIds exist
  fetch('/api/brand/get')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setRecentProducts(prev =>
          prev.map(product => {
            const brandMatch = data.brands.find(b => b.id === product.brand);
            return {
              ...product,
              brand: brandMatch?.brand_name || product.brand // overwrite ObjectId with name if matched
            };
          })
        );
      }
    });

  return () => window.removeEventListener('resize', checkIfMobile);
}, []);

  const visibleCount = isMobile ? 3 : 5;
  const visibleProducts = recentProducts.slice(startIndex, startIndex + visibleCount);

  const handleProductClick = (product) => {
    if (navigating) return;
    
    setNavigating(true);
    const stored = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    const updated = stored.filter(p => p._id !== product._id);
    updated.unshift(product);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated.slice(0, 10)));
    router.push(`/product/${product.slug || product._id}`);
  };

  useEffect(() => {
    const handleRouteChange = () => setNavigating(false);
    if (!router?.events?.on) return;
    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('routeChangeError', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('routeChangeError', handleRouteChange);
    };
  }, [router]);

  const prev = () => {
    const step = isMobile ? 3 : 1;
    setStartIndex(Math.max(0, startIndex - step));
  };

  const next = () => {
    const step = isMobile ? 3 : 1;
    setStartIndex(Math.min(startIndex + step, recentProducts.length - visibleCount));
  };

  if (recentProducts.length === 0) return null;

  return (
    <>
      {navigating && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black bg-opacity-30">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}
      
     <section className="mb-10 px-4">
  <div className="bg-gray-100 rounded-2xl p-6">
    <div className="flex justify-between items-center mb-6">
      <h5 className="text-xl font-bold">Recently Visited</h5>
      <div className="flex gap-3">
        <button
          onClick={prev}
          disabled={startIndex === 0}
          className="p-2 border border-gray-300 rounded-full hover:bg-blue-600 hover:text-white transition disabled:opacity-50"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          disabled={startIndex + visibleCount >= recentProducts.length}
          className="p-2 border border-gray-300 rounded-full hover:bg-blue-600 hover:text-white transition disabled:opacity-50"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>

    {/* Wider grid layout */}
    <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 overflow-x-auto sm:overflow-visible px-1">
      {visibleProducts.map((product) => (
        <div key={product._id} className="w-full min-w-[220px]">
          <motion.div 
            whileHover={{ y: -5 }}
            className="relative border rounded-xl shadow-lg p-4 transition-all duration-300 hover:border-blue-500 hover:shadow-xl bg-white h-full flex flex-col"
          >
            {/* Discount badge */}
            {product.special_price && (
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2 py-1 text-xs text-white bg-red-500 rounded">
                  {Math.round(((product.price - product.special_price) / product.price) * 100)}% OFF
                </span>
              </div>
            )}
 <div className="absolute top-2 right-2 z-10 hover:text-red-500">
                                  <ProductCard productId={product._id} />
                                </div>
            {/* Product Image */}
            <Link
              href={`/product/${product.slug || product._id}`}
              className="block flex-grow"
              onClick={(e) => {
                e.preventDefault();
                handleProductClick(product);
              }}
            >
              <div className="h-40 sm:h-48 flex items-center justify-center mb-3">
                <img
                  src={product.images?.[0] ? `/uploads/products/${product.images[0]}` : "/uploads/products/placeholder.jpg"}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/uploads/products/placeholder.jpg";
                  }}
                />
              </div>

              <h3 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                {product.name}
              </h3>
  {/* {product.brand && (
                          <p className="text-sm text-gray-500 mt-1">
                            Brand: <span className="font-medium text-gray-700">{product.brand}</span>
                          </p>
                        )} */}
              <p className="text-sm sm:text-base font-bold text-blue-600">
                Rs. {product.special_price || product.price}
                {product.special_price && (
                  <span className="line-through text-gray-400 text-xs ml-1">
                    Rs. {product.price}
                  </span>
                )}
              </p>
            </Link>

            {/* Cart and Share Buttons */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <Addtocart 
                productId={product._id} 
                className="flex-1 py-2 text-xs" 
              />
              <a 
                href={`https://wa.me/?text=Check this out: ${product.name}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-full transition-colors duration-300 flex items-center justify-center"
              >
                <svg 
                  className="w-4 h-4" 
                  viewBox="0 0 32 32" 
                  fill="currentColor" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.773.736 5.368 2.009 7.629L2 30l6.565-2.643A13.254 13.254 0 0016.003 29.333C23.36 29.333 29.333 23.36 29.333 16c0-7.36-5.973-13.333-13.33-13.333zm7.608 18.565c-.32.894-1.87 1.749-2.574 1.865-.657.104-1.479.148-2.385-.148-.55-.175-1.256-.412-2.162-.812-3.8-1.648-6.294-5.77-6.49-6.04-.192-.269-1.55-2.066-1.55-3.943 0-1.878.982-2.801 1.33-3.168.346-.364.75-.456 1.001-.456.25 0 .5.002.719.013.231.01.539-.088.845.643.32.768 1.085 2.669 1.18 2.863.096.192.16.423.03.683-.134.26-.2.423-.39.65-.192.231-.413.512-.589.689-.192.192-.391.401-.173.788.222.392.986 1.625 2.116 2.636 1.454 1.298 2.682 1.7 3.075 1.894.393.192.618.173.845-.096.23-.27.975-1.136 1.237-1.527.262-.392.524-.32.894-.192.375.13 2.35 1.107 2.75 1.308.393.205.656.308.75.48.096.173.096 1.003-.224 1.897z" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  </div>
</section>
    </>
  );
};

export default RecentlyViewedProducts;