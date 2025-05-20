// components/RecentlyViewedProducts.jsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from "@/components/ProductCard";
import Addtocart from "@/components/AddToCart";
import { motion, useAnimation, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "react-feather";
const RecentlyViewedProducts = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 5; // Number of visible items at once

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      setRecentProducts(JSON.parse(stored));
    }
  }, []);

  // Slice visible products for carousel
  const visible = recentProducts.slice(startIndex, startIndex + visibleCount);

  // Handlers for carousel buttons
  const prev = () => {
    if (startIndex > 0) setStartIndex(startIndex - 1);
  };

  const next = () => {
    if (startIndex + visibleCount < recentProducts.length) {
      setStartIndex(startIndex + 1);
    }
  };

  if (recentProducts.length === 0) return null;

  return (
     <section className="mb-10 px-2 pt-15">
      <div className="bg-gray-100 rounded-[23px] px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-2xl font-bold">Recently Visited</h5>
          <div className="flex gap-3">
            <button
              onClick={prev}
              disabled={startIndex === 0}
              className="p-2 border border-gray-300 rounded-full hover:bg-blue-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              disabled={startIndex + visibleCount >= recentProducts.length}
              className="p-2 border border-gray-300 rounded-full hover:bg-blue-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {visible.map((product) => (
            <div key={product._id} className="w-full">
              <motion.div 
                whileHover={{ y: -5 }} 
                className="relative border rounded-lg shadow p-4 transition-all duration-300 hover:border-blue-500 hover:shadow-lg group bg-white h-full"
              >
                {product.special_price && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2 py-1 text-xs text-white bg-red-500 rounded">
                      {Math.round(((product.price - product.special_price) / product.price) * 100)}% OFF
                    </span>
                  </div>
                )}

                <Link
                    href={`/product/${product.slug || product._id}`}
                    className="block" // or any other styling you need
                  >
                    <div className="h-48 flex items-center justify-center mt-4">
                      <img
                        src={
                          product.images?.[0]
                            ? `/uploads/products/${product.images[0]}`
                            : "/uploads/products/placeholder.jpg"
                        }
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/uploads/products/placeholder.jpg";
                        }}
                      />
                    </div>

                    <h3 className="mt-3 font-semibold group-hover:text-blue-600 line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-lg font-bold text-blue-600">
                      Rs. {product.special_price || product.price}
                      {product.special_price && (
                        <span className="line-through text-gray-400 text-sm ml-1">
                          Rs. {product.price}
                        </span>
                      )}
                    </p>

                    {/* <p className="text-sm text-gray-600">
                      ⭐ {product.rating || "N/A"} <span className="text-gray-400">(17k)</span>
                    </p> */}
                </Link>


                <div className="mt-3 flex items-center justify-between gap-2">
                  <Addtocart productId={product._id} className="flex-1" />
                  <a 
                    href={`https://wa.me/?text=Check this out: ${product.name}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-300 flex items-center justify-center"
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
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>

  );
};

export default RecentlyViewedProducts;
