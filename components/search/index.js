"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import Addtocart from "@/components/AddToCart";
import { ToastContainer, toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

export default function SearchComponent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('');
  const [brandMap, setBrandMap] = useState({});
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        let url = '/api/search?';
        
        if (query) {
          url += `query=${encodeURIComponent(query)}`;
        }
        
        if (category) {
          if (query) url += '&';
          url += `category=${encodeURIComponent(category)}`;
        }

        const res = await axios.get(url);
        setProducts(res.data);
      } catch (err) {
        toast.error("Failed to load search results");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (query || category) {
      fetchResults();
    } else {
      setLoading(false);
      setProducts([]);
    }
  }, [query, category]);

  const fetchBrand = async () => {
    try {
      const response = await fetch("/api/brand");
      const result = await response.json();
      if (result.error) {
        console.error(result.error);
      } else {
        const data = result.data;
        const map = {};
        data.forEach((b) => {
          map[b._id] = b.brand_name;
        });
        setBrandMap(map);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchBrand();
  }, []);

  const getSortedProducts = () => {
    const sortedProducts = [...products];
    switch(sortOption) {
      case 'price-low-high':
        return sortedProducts.sort((a, b) => a.special_price - b.special_price);
      case 'price-high-low':
        return sortedProducts.sort((a, b) => b.special_price - a.special_price);
      case 'name-a-z':
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-z-a':
        return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sortedProducts;
    }
  };

  const handleProductClick = (product) => {
    // You can add any tracking logic here if needed
  };

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Search Results for "{query}"
          {category && ` in ${category}`}
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-1 gap-4">
          <p className="text-gray-600">
            {products.length} result{products.length !== 1 ? 's' : ''} found
          </p>
          
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sort by Featured</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-a-z">Name: A-Z</option>
            <option value="name-z-a">Name: Z-A</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getSortedProducts().map(product => (
              <div key={product._id} className="group relative bg-white rounded-lg border hover:border-blue-200 transition-all shadow-sm hover:shadow-md flex flex-col h-full">
                <div className="relative aspect-square bg-white">
                  {product.images?.[0] && (
                    <Image
                      src={
                        product.images[0].startsWith("http")
                          ? product.images[0]
                          : `/uploads/products/${product.images[0]}`
                      }
                      alt={product.name}
                      fill
                      className="object-contain p-2 md:p-4 transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 33vw, 25vw"
                      unoptimized
                    />
                  )}
                
                  {Number(product.special_price) > 0 &&
                    Number(product.special_price) < Number(product.price) && (
                      <span className="absolute top-3 left-2 bg-red-500 text-white text-xs font-bold px-4 py-0.5 rounded z-10">
                        {Math.round(100 - (Number(product.special_price) / Number(product.price)) * 100)}% OFF
                      </span>
                  )}
                
                  <div className="absolute top-2 right-2">
                    <ProductCard productId={product._id} />
                  </div>
                </div>
            
                <div className="p-2 md:p-4 flex flex-col h-full">
                  <h4 className="text-xs text-gray-500 mb-2 uppercase">
                  <Link
                                          href={`/brand/${brandMap[product.brand] ? brandMap[product.brand].toLowerCase().replace(/\s+/g, "-") : ""}`}
                                          className="hover:text-blue-600"
                                        >
                                          {brandMap[product.brand] || ""}
                                        </Link>
                                        </h4>
                  <Link
                    href={`/product/${product.slug}`}
                    className="block mb-2"
                    onClick={() => handleProductClick(product)}
                  >
                    <h3 className="text-xs sm:text-sm font-medium text-[#0069c6] hover:text-[#00badb] line-clamp-2 min-h-[40px]">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base font-semibold text-red-600">
                      ₹ {(
                        product.special_price &&
                        product.special_price > 0 &&
                        product.special_price != '0' &&
                        product.special_price != 0 &&
                        product.special_price < product.price
                          ? Math.round(product.special_price)
                          : Math.round(product.price)
                      ).toLocaleString()}
                    </span>
                
                    {product.special_price > 0 &&
                      product.special_price != '0' &&
                      product.special_price != 0 &&
                      product.special_price &&
                      product.special_price < product.price && (
                        <span className="text-xs text-gray-500 line-through">
                          ₹ {Math.round(product.price).toLocaleString()}
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
                
                  <div className="mt-auto flex items-center justify-between gap-2 ccs">
                    <Addtocart
                      productId={product._id} 
                      stockQuantity={product.quantity}  
                      special_price={product.special_price}
                      className="w-full text-xs sm:text-sm py-1.5"
                    />
                    <a
                      href={`https://wa.me/919865555000?text=${encodeURIComponent(`Check Out This Product:${apiUrl}/product/${product.slug}`)}`} 
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
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <img 
                src="/images/no-productbox.png" 
                alt="No products found" 
                className="mx-auto mb-6 w-48 h-48"
              />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No Products Found
              </h2>
              <p className="text-gray-600">
                Try different search terms or browse our categories
              </p>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}