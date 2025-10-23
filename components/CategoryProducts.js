// components/CategoryProducts.jsx
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Addtocart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CategoryProducts = () => {
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [brandMap, setBrandMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const categoryScrollRefs = useRef({});

  const priorityCategories = ["air-conditioner", "mobile-phones", "television", "refrigerator", "washing-machine"];

  const categoryStyles = {
    "air-conditioner": { backgroundImage: "/uploads/categories/category-darling-img/air-conditoner-one.jpg", borderColor: "#060F16" },
    "mobile-phones": { backgroundImage: "/uploads/categories/category-darling-img/smartphone.png", borderColor: "#68778B" },
    "television": { backgroundImage: "/uploads/categories/category-darling-img/television-one.jpg", borderColor: "#A9A097" },
    "refrigerator": { backgroundImage: "/uploads/categories/category-darling-img/refirgrator-two.jpg", borderColor: "#5C8B99" },
    "washing-machine": { backgroundImage: "/uploads/categories/category-darling-img/washine-machine-one.jpg", borderColor: "#69AEA2" }
  };

  const scrollLeft = (categoryId) => {
    if (categoryScrollRefs.current[categoryId]) {
      categoryScrollRefs.current[categoryId].scrollBy({ left: -250, behavior: 'smooth' });
    }
  };

  const scrollRight = (categoryId) => {
    if (categoryScrollRefs.current[categoryId]) {
      categoryScrollRefs.current[categoryId].scrollBy({ left: 250, behavior: 'smooth' });
    }
  };

  const handleProductClick = (product) => {
    setNavigating(true);
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const updated = [product, ...recentlyViewed.filter(p => p._id !== product._id)].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  };

  const BanneritemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/categoryproduct/settings");
        const result = await response.json();
        if (result.ok) setCategoryProducts(result.data);

        const brandResponse = await fetch("/api/brand");
        const brandResult = await brandResponse.json();
        if (!brandResult.error) {
          const map = {};
          brandResult.data.forEach((b) => { map[b._id] = b.brand_name; });
          setBrandMap(map);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (categoryProducts.length === 0) return null;

  return (
    <>
      {navigating && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black bg-opacity-30">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}

      <motion.section id="category-products" initial="hidden" animate="visible" className="category-products px-3 sm:px-6 pt-6">
        <div className="rounded-[23px] py-4">
          <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-4 sm:mb-6">
              <h5 className="text-lg sm:text-2xl font-bold">Shop by Category</h5>
            </div>

            {categoryProducts
              // .filter(cp => priorityCategories.includes(cp.subcategoryId?.category_slug))
              .map((categoryProduct) => {
                const category = categoryProduct.subcategoryId;
                const products = categoryProduct.products || [];
                const alignment = categoryProduct.alignment || "left";

                if (!category || products.length === 0) return null;

                const categoryStyle = categoryStyles[category.category_slug] || {
                  backgroundImage: '/uploads/small-appliance-banner.webp',
                  borderColor: '#1F3A8C'
                };

                return (
                  <div key={categoryProduct._id} className="space-y-4">
                    {/* Banner Section */}
                    {categoryProduct.bannerImage && (
                      <motion.div
                        className="relative w-full aspect-[16/9] max-h-[140px] sm:aspect-[16/6] sm:max-h-[200px] md:max-h-[300px] lg:max-h-[400px]"
                        variants={BanneritemVariants}
                      >
                        <Link href={categoryProduct.bannerRedirectUrl || "#"} className="block w-full h-full">
                          <Image src={categoryProduct.bannerImage} alt="Banner" fill quality={100} className="object-cover rounded-lg" priority />
                        </Link>
                      </motion.div>
                    )}

                    {/* Category Products Section */}
                    <div className={`bg-white flex flex-col md:flex-row mb-8 ${alignment === "right" ? "md:flex-row-reverse" : ""}`}>
                      {/* Category Banner */}
                      <div className="flex-shrink-0 relative w-full md:w-[350px] h-48 sm:h-64 md:h-auto">
                        <div className={`absolute inset-0 bg-cover bg-center    ${alignment === "right" 
      ? "md:rounded-tr-lg md:rounded-br-lg" 
      : "md:rounded-tl-lg md:rounded-bl-lg"
    }`}
                          style={{ backgroundImage: `url(${categoryProduct.categoryImage || categoryStyle.backgroundImage})` }}
                        />
                        <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-6 text-white">
                          <h2 className="text-lg sm:text-2xl font-bold mb-2">{category.category_name}</h2>
                          <Link href={categoryProduct.categoryRedirectUrl || `/category/${category.category_slug}`}
                            className="mt-2 bg-white hover:bg-gray-100 text-blue-700 text-xs sm:text-sm font-semibold py-1.5 px-3 rounded w-fit"
                            onClick={() => setNavigating(true)}
                          >
                            Shop Now →
                          </Link>
                        </div>
                      </div>

                      {/* Products Scroll */}
                      <div className="w-full md:w-[calc(100%-350px)]">
                        <div className={`relative flex-1 py-2 border overflow-hidden ${alignment === "right" ? "pr-3 pl-2" : "pl-3 pr-2"}`}
                          style={{
                            borderTop: `4px solid ${categoryProduct.borderColor || categoryStyle.borderColor}`,
                            borderBottom: `4px solid ${categoryProduct.borderColor || categoryStyle.borderColor}`,
                            borderLeft: alignment === "right" ? `4px solid ${categoryProduct.borderColor || categoryStyle.borderColor}` : `0px`,
                            borderRight: alignment === "left" ? `4px solid ${categoryProduct.borderColor || categoryStyle.borderColor}` : `0px`,
                          }}
                        >
                          {/* Arrows */}
                          <button onClick={() => scrollLeft(categoryProduct._id)}
                            className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white text-black border hover:bg-black hover:text-white shadow-sm z-20 transition"
                          >
                            <FiChevronLeft size={16} />
                          </button>
                          <button onClick={() => scrollRight(categoryProduct._id)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white text-black border hover:bg-black hover:text-white shadow-sm z-20 transition"
                          >
                            <FiChevronRight size={16} />
                          </button>

                          {/* Scrollable products */}
                          <div ref={(el) => (categoryScrollRefs.current[categoryProduct._id] = el)}
                            className="flex overflow-x-auto scrollbar-hide scroll-smooth gap-3 sm:gap-4 py-3"
                          >
                            {products.slice(0, 15).map((product) => (
                              <div key={product._id}
                                className="relative bg-white flex-shrink-0 w-44 sm:w-56 flex flex-col justify-between p-2 rounded-lg border border-gray-200 hover:border-[#0069c1] hover:shadow-md transition cursor-pointer"
                              >
                                {/* Image */}
                                <div className="relative aspect-square bg-white">
                                  <Link href={`/product/${product.slug}`} onClick={() => handleProductClick(product)} className="block mb-1">
                                  {product.images?.[0] && (
                                    <>
                                      <Image
                                        src={product.images[0].startsWith("http") ? product.images[0] : `/uploads/products/${product.images[0]}`}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-2 sm:p-4"
                                        sizes="(max-width: 640px) 50vw, 33vw, 25vw"
                                        unoptimized
                                      />
                                      {Number(product.special_price) > 0 && Number(product.special_price) < Number(product.price) && (
                                        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded">
                                          -{Math.round(100 - (Number(product.special_price) / Number(product.price)) * 100)}%
                                        </span>
                                      )}
                                      <div className="absolute top-2 right-2">
                                        <ProductCard productId={product._id} />
                                      </div>
                                    </>
                                  )}
                                  </Link>
                                </div>

                                {/* Info */}
                                <div className="p-2 flex flex-col h-full">
                                  <h4 className="text-[10px] sm:text-xs text-gray-500 mb-1 uppercase">
                                    <Link href={`/brand/${brandMap[product.brand]?.toLowerCase().replace(/\s+/g, "-") || ""}`} className="hover:text-blue-600">
                                      {brandMap[product.brand] || ""}
                                    </Link>
                                  </h4>

                                  <Link href={`/product/${product.slug}`} onClick={() => handleProductClick(product)} className="block mb-1">
                                    <h3 className="text-xs sm:text-sm font-medium text-[#0069c6] hover:text-[#00badb] line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                                      {product.name}
                                    </h3>
                                  </Link>

                                  {/* Price */}
                                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                    <span className="text-sm sm:text-base font-semibold text-red-600">
                                      ₹ {(product.special_price > 0 && product.special_price < product.price
                                        ? Math.round(product.special_price)
                                        : Math.round(product.price)
                                      ).toLocaleString()}
                                    </span>
                                    {product.special_price > 0 && product.special_price < product.price && (
                                      <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                                        ₹ {Math.round(product.price).toLocaleString()}
                                      </span>
                                    )}
                                  </div>

                                  <h4 className={`text-[10px] sm:text-xs mb-2 ${product.stock_status === "In Stock" ? "text-green-600" : "text-red-600"}`}>
                                    {product.stock_status}{product.stock_status === "In Stock" && product.quantity ? `, ${product.quantity} units` : ""}
                                  </h4>

                                  {/* Actions */}
                                  <div className="mt-auto flex items-center justify-between gap-2">
                                    <Addtocart productId={product._id} stockQuantity={product.quantity} special_price={product.special_price}
                                      className="w-full text-[10px] sm:text-sm py-1.5"
                                    />
                                    <a href={`https://wa.me/919865555000?text=${encodeURIComponent(`Check Out This Product: ${typeof window !== 'undefined' ? window.location.origin : ''}/product/${product.slug}`)}`}
                                      target="_blank" rel="noopener noreferrer"
                                      className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-full flex items-center justify-center"
                                    >
                                      <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 32 32" fill="currentColor">
                                        <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.773.736 5.368 2.009 7.629L2 30l6.565-2.643A13.254 13.254 0 0016.003 29.333C23.36 29.333 29.333 23.36 29.333 16c0-7.36-5.973-13.333-13.33-13.333zm7.608 18.565c-.32.894-1.87 1.749-2.574 1.865-.657.104-1.479.148-2.385-.148-.55-.175-1.256-.412-2.162-.812-3.8-1.648-6.294-5.77-6.49-6.04-.192-.269-1.55-2.066-1.55-3.943 0-1.878.982-2.801 1.33-3.168.346-.364.75-.456 1.001-.456.25 0 .5.002.719.013.231.01.539-.088.845.643.32.768 1.085 2.669 1.18 2.863.096.192.16.423.03.683-.134.26-.2.423-.39.65-.192.231-.413.512-.589.689-.192.192-.391.401-.173.788.222.392.986 1.625 2.116 2.636 1.454 1.298 2.682 1.7 3.075 1.894.393.192.618.173.845-.096.23-.27.975-1.136 1.237-1.527.262-.392.524-.32.894-.192.375.13 2.35 1.107 2.75 1.308.393.205.656.308.75.48.096.173.096 1.003-.224 1.897z" />
                                      </svg>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </motion.section>
    </>
  );
};

export default CategoryProducts;
