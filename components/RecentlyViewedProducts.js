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
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    const handleRouteChange = () => setNavigating(false);
    if (router?.events?.on) {
      router.events.on('routeChangeComplete', handleRouteChange);
      router.events.on('routeChangeError', handleRouteChange);
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      if (router?.events?.off) {
        router.events.off('routeChangeComplete', handleRouteChange);
        router.events.off('routeChangeError', handleRouteChange);
      }
    };
  }, [router]);

  useEffect(() => {
    const fetchRecentProductsWithBrands = async () => {
      setIsLoading(true);
      const stored = localStorage.getItem('recentlyViewed');
      if (!stored) {
        setIsLoading(false);
        return;
      }
      const products = JSON.parse(stored);

      try {
        const response = await fetch("/api/brand");
        const result = await response.json();
        
        if (result.error) {
          console.error(result.error);
          setRecentProducts(products); // Use products without brand names if fetch fails
        } else {
          const brandData = result.data;
          const brandMap = {};
          brandData.forEach((b) => {
            brandMap[b._id] = b.brand_name;
          });

          // Map brand names to products before setting state
          const productsWithBrands = products.map(product => ({
            ...product,
            brand: brandMap[product.brand] || product.brand // Use brand name if found, otherwise keep original
          }));
          setRecentProducts(productsWithBrands);
        }
      } catch (error) {
        console.error(error.message);
        setRecentProducts(products); // Fallback to products without brand names
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProductsWithBrands();
  }, []); // Run only once when the component mounts

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

  const prev = () => {
    const step = isMobile ? 3 : 1;
    setStartIndex(Math.max(0, startIndex - step));
  };

  const next = () => {
    const step = isMobile ? 3 : 1;
    setStartIndex(Math.min(startIndex + step, recentProducts.length - visibleCount));
  };

  if (isLoading || recentProducts.length === 0) return null;

  return (
    <>
      {navigating && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black bg-opacity-30">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <section className="mb-14 px-0 sm:px-0 md:px-0 pt-14">
        <div className="bg-gray-100 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6 ">
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

          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto sm:overflow-visible px-0">
            {visibleProducts.map((product) => (
              <div
                key={product._id}
                className="group relative bg-white rounded-lg border hover:border-blue-200 transition-all shadow-sm hover:shadow-md flex flex-col h-full"
              >
               <div className="relative aspect-square w-58 h-58 bg-white flex items-center justify-center rounded-md overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={
                      product.images[0].startsWith("http")
                        ? product.images[0]
                        : `/uploads/products/${product.images[0]}`
                    }
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/uploads/products/placeholder.jpg";
                    }}
                  />
                ) : (
                  <img
                    src="/uploads/products/placeholder.jpg"
                    alt="placeholder"
                    className="w-full h-full object-contain"
                  />
                )}

                {Number(product.special_price) > 0 &&
                  Number(product.special_price) < Number(product.price) && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-4 py-0.5 rounded z-10">
                      {Math.round(
                        100 - (Number(product.special_price) / Number(product.price)) * 100
                      )}
                      % OFF
                    </span>
                  )}

                <div className="absolute top-2 right-2">
                  <ProductCard productId={product._id} />
                </div>
              </div>

                <div className="p-2 md:p-4 flex flex-col h-full">
                  <h4 className="text-xs text-gray-500 mb-2 uppercase hover:text-blue-600">
                    {product.brand}
                  </h4>

                  <Link
                    href={`/product/${product.slug || product._id}`}
                    className="block mb-2"
                    onClick={(e) => {
                      e.preventDefault();
                      handleProductClick(product);
                    }}
                  >
                    <h3 className="text-xs sm:text-sm font-medium text-[#0069c6] hover:text-[#00badb] line-clamp-2 min-h-[40px]">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base font-semibold text-red-600">
                      ₹ {(
                        product.special_price && product.special_price > 0 && product.special_price < product.price
                          ? product.special_price
                          : product.price
                      ).toLocaleString()}
                    </span>

                    {product.special_price > 0 &&
                      product.special_price < product.price && (
                        <span className="text-xs text-gray-500 line-through">
                          ₹ {product.price.toLocaleString()}
                        </span>
                      )}
                  </div>

                  <h4
                    className={`text-xs mb-3 ${
                      product.stock_status === "In Stock" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.stock_status}
                    {product.stock_status === "In Stock" && product.quantity
                      ? `, ${product.quantity} units`
                      : ""}
                  </h4>

                  <div className="mt-auto flex items-center justify-between gap-2">
                    <Addtocart
                      productId={product._id}
                      stockQuantity={product.quantity}
                      special_price={product.special_price}
                      className="w-full text-xs sm:text-sm py-1.5"
                    />
                    <a
                      href={`https://wa.me/919865555000?text=${encodeURIComponent(`Check Out This Product: ${apiUrl}/product/${product.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full transition-colors duration-300 flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 32 32"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.773.736 5.368 2.009 7.629L2 30l6.565-2.643A13.254 13.254 0 0016.003 29.333C23.36 29.333 29.333 23.36 29.333 16c0-7.36-5.973-13.333-13.33-13.333zm7.608 18.565c-.32.894-1.87 1.749-2.574 1.865-.657.104-1.479.148-2.385-.148-.55-.175-1.256-.412-2.162-.812-3.8-1.648-6.294-5.77-6.49-6.04-.192-.269-1.55-2.066-1.55-3.943 0-1.878.982-2.801 1.33-3.168.346-.364.75-.456 1.001-.456.25 0 .5.002.719.013.231.01.539-.088.845.643.32.768 1.085 2.669 1.18 2.863.096.192.16.423.03.683-.134.26-.2.423-.39.65-.192.231-.413.512-.589.689-.192.192-.391.401-.173.788.222.392.986 1.625 2.116 2.636 1.454 1.298 2.682 1.7 3.075 1.894.393.192.618.173.845-.096.23-.27.975-1.136 1.237-1.527.262-.392.524-.32.894-.192.375.13 2.35 1.107 2.75 1.308.393.205.656.308.75.48.096.173.096 1.003-.224 1.897z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default RecentlyViewedProducts;
























