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


return (
    <div className="container mx-auto px-4 py-2">
      <div className="max-w-7xl mx-auto">
        {/* <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Search Results for "{query}"
          {category && ` in ${category}`}
        </h1> */}

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
              <div key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="relative aspect-square bg-gray-50 rounded-t-xl overflow-hidden">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0].startsWith('http') ? product.images[0] : `/uploads/products/${product.images[0]}`}
                      alt={product.name}
                      fill
                      className="object-contain p-4 hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 33vw, 25vw"
                      unoptimized
                    />
                  )}
                  {product.special_price < product.price && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {Math.round(100 - (product.special_price / product.price) * 100)}% OFF
                    </span>
                  )}
                  <div className="absolute top-3 right-3">
                    <ProductCard productId={product._id} />
                  </div>
                </div>

                <div className="p-2 md:p-4">
                                    <Link href={`/product/${product.slug}`} className="block mb-1 md:mb-2">
                                      <h3 className="text-xs sm:text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-2">
                                        {product.name}
                                      </h3>
                                    </Link>
                                    
                                    <div className="flex items-center gap-2 mb-3">
                                      {product.special_price && product.special_price !== product.price && (
                                        <span className="text-xs text-gray-500 line-through">₹{product.price.toLocaleString()}</span>
                                      )}
                                      <span className="text-base font-semibold text-blue-600">₹{(product.special_price || product.price).toLocaleString()}</span>
                                    </div>
                
                                    <Addtocart productId={product._id} className="w-full text-xs sm:text-sm py-1.5"  />
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