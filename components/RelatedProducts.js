'use client';
import Image from "next/image";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import Link from "next/link";

const RelatedProducts = ({ currentProductId, categoryId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        // const response = await fetch(`/api/product/related?categoryId=${categoryId}&excludeId=${currentProductId}&limit=6`);
        // const data = await response.json();
        // alert(JSON.stringify(data, null, 2));
        
        // if (data.success) {
        //   setRelatedProducts(data.products);
        // }
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchRelatedProducts();
    }
  }, [categoryId, currentProductId]);

  if (loading) {
    return (
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-5">You Might Also Like</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-md w-56 animate-pulse">
              <div className="bg-gray-200 h-32 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded mt-2"></div>
              <div className="h-3 bg-gray-200 rounded mt-1 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mt-2 w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded mt-1 w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded-lg mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!relatedProducts.length) return null;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-5">You Might Also Like</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {relatedProducts.map((product) => {
          const discountPercentage = product.special_price 
            ? Math.round(((product.price - product.special_price) / product.price) * 100)
            : 0;

          return (
            <div key={product._id} className="border rounded-lg p-4 shadow-md w-56 flex-shrink-0 relative">
              {discountPercentage > 0 && (
                <span className={`px-2 py-1 text-xs font-bold text-white rounded absolute top-2 left-2 ${
                  discountPercentage > 30 ? "bg-blue-500" : "bg-red-500"
                }`}>
                  {discountPercentage}% OFF
                </span>
              )}
              
              <Link href={`/product/${product.slug || product._id}`}>
                <div className="relative h-32 w-full">
                  <Image 
                    src={`/uploads/products/${product.images?.[0]}` || "/placeholder.jpg"} 
                    alt={product.name} 
                    fill
                    className="object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                </div>
              </Link>

              <Link href={`/product/${product.slug || product._id}`}>
                <h3 className="text-sm font-medium mt-2 hover:text-blue-600 line-clamp-2">{product.name}</h3>
              </Link>
              <p className="text-gray-600 text-xs">By {product.brand?.brand_name || "Our Store"}</p>
              <div className="flex items-center mt-1">
                <p className="text-lg font-bold">${product.special_price || product.price}</p>
                {product.special_price && (
                  <p className="text-gray-500 text-sm line-through ml-2">${product.price}</p>
                )}
              </div>
              <div className="flex items-center text-sm mt-1">
                <FaStar className="text-yellow-400" /> 
                <span className="px-1">{product.rating?.toFixed(1) || "0.0"}</span>
                <span className="text-gray-500">({product.reviews || 0})</span>
              </div>
              <button 
                className="w-full mt-2 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition duration-300"
                style={{ backgroundColor: '#e0e7ff', color: '#1d4ed8' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1d4ed8';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#e0e7ff';
                  e.target.style.color = '#1d4ed8';
                }}
              >
                Add To Cart <FaShoppingCart />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;