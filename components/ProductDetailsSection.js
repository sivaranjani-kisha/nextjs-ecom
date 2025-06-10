'use client';
import { useState, useEffect } from "react";
import { SiTicktick } from "react-icons/si";
import Image from "next/image";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import Link from "next/link";

export default function ProductDetailsSection({ product }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loadingRecentlyViewed, setLoadingRecentlyViewed] = useState(false);

  const tabData = {
    overview: product.overview || "No overview available.",
    description: product.description || "No description available.",
    videos: product.videos || [],
    reviews: {
      rating: product.rating || 0,
      count: product.reviews || 0,
      items: product.reviewItems || []
    }
  };

  useEffect(() => {
    if ((activeTab === "relatedProducts" || activeTab === "recentlyViewed") && product.category?._id) {
      if (activeTab === "relatedProducts" && relatedProducts.length === 0) {
        fetchRelatedProducts();
      }
      if (activeTab === "recentlyViewed" && recentlyViewed.length === 0) {
        fetchRecentlyViewed();
      }
    }
  }, [activeTab, product.category?._id]);

  const fetchRelatedProducts = async () => {
    try {
      setLoadingRelated(true);
      const response = await fetch(
        `/api/product/related?categoryId=${product.category._id}&excludeId=${product._id}&limit=4`
      );
      const data = await response.json();
      if (data.success) {
        setRelatedProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const fetchRecentlyViewed = async () => {
    try {
      setLoadingRecentlyViewed(true);
      const response = await fetch(`/api/product/recently-viewed?limit=4`);
      const data = await response.json();
      if (data.success) {
        setRecentlyViewed(data.products);
      }
    } catch (error) {
      console.error("Error fetching recently viewed products:", error);
    } finally {
      setLoadingRecentlyViewed(false);
    }
  };

  const renderProductCard = (product) => {
    const discountPercentage = product.special_price 
      ? Math.round(((product.price - product.special_price) / product.price) * 100)
      : 0;

    return (
      <div key={product._id} className="border rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow relative">
        {discountPercentage > 0 && (
          <span className={`px-1 sm:px-2 py-1 text-xs font-bold text-white rounded absolute top-1 sm:top-2 left-1 sm:left-2 ${
            discountPercentage > 30 ? "bg-blue-500" : "bg-red-500"
          }`}>
            {discountPercentage}% OFF
          </span>
        )}
        
        <Link href={`/product/${product.slug || product._id}`}>
          <div className="relative h-32 sm:h-40 w-full">
            <Image 
              src={`/uploads/products/${product.images?.[0]}` || "/placeholder.jpg"} 
              alt={product.name} 
              fill
              className="object-contain rounded-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder.jpg";
              }}
            />
          </div>
        </Link>

        <Link href={`/product/${product.slug || product._id}`}>
          <h3 className="text-xs sm:text-sm font-medium mt-1 sm:mt-2 hover:text-blue-600 line-clamp-2">{product.name}</h3>
        </Link>
        <p className="text-gray-600 text-xs">By {product.brand?.brand_name || "Our Store"}</p>
        <div className="flex items-center mt-1">
          <p className="text-sm sm:text-lg font-bold">${product.special_price || product.price}</p>
          {product.special_price && (
            <p className="text-gray-500 text-xs sm:text-sm line-through ml-1 sm:ml-2">${product.price}</p>
          )}
        </div>
        <div className="flex items-center text-xs sm:text-sm mt-1">
          <FaStar className="text-yellow-400 text-xs sm:text-sm" /> 
          <span className="px-1">{product.rating?.toFixed(1) || "0.0"}</span>
          <span className="text-gray-500">({product.reviews || 0})</span>
        </div>
        <button 
          className="w-full mt-1 sm:mt-2 py-1 sm:py-2 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition duration-300"
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
          Add To Cart <FaShoppingCart className="text-xs sm:text-sm" />
        </button>
      </div>
    );
  };

  const renderLoadingSkeleton = (count = 4) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {[...Array(count)].map((_, index) => (
          <div key={index} className="border rounded-lg p-2 sm:p-3 shadow-md animate-pulse">
            <div className="bg-gray-200 h-32 sm:h-40 rounded-md"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded mt-1 sm:mt-2"></div>
            <div className="h-2 sm:h-3 bg-gray-200 rounded mt-1 w-3/4"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded mt-1 sm:mt-2 w-1/2"></div>
            <div className="h-8 sm:h-10 bg-gray-200 rounded-lg mt-1 sm:mt-2"></div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-4 sm:mt-8 border border-gray-400 rounded-lg p-3 sm:p-6 bg-white shadow-sm">
      {/* Tabs */}
      <div className="w-full overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 w-max min-w-full pb-2">
          <button
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "overview" ? "bg-customBlue text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "description" ? "bg-customBlue text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("description")}
          >
            Detailed Specs
          </button>
          <button
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "videos" ? "bg-customBlue text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("videos")}
          >
            Videos
          </button>
          <button
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "reviews" ? "bg-customBlue text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
          <button
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "recentlyViewed" ? "bg-customBlue text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("recentlyViewed")}
          >
            Recently Viewed
          </button>
          <button
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "relatedProducts" ? "bg-customBlue text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("relatedProducts")}
          >
            Related
          </button>
          
          <div className="ml-2 sm:ml-auto px-2 sm:px-4 py-1 sm:py-2 text-blue-600 font-medium flex items-center text-xs sm:text-sm whitespace-nowrap">
            <SiTicktick className="text-customBlue mr-1 text-xs sm:text-sm" /> 100% Satisfaction
          </div>
        </div>

        {/* Move border lower */}
        <div className="border-b border-gray-300 mt-1 sm:mt-2"></div>
      </div>

      {/* Tab Content */}
      <div className="p-2 sm:p-4">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Product Overview</h2>
            <p className="text-gray-700 mt-1 sm:mt-2 text-sm sm:text-base">{tabData.overview}</p>
            
            {product.features?.length > 0 && (
              <>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mt-3 sm:mt-6">Highlights</h2>
                <ul className="list-disc pl-4 sm:pl-5 mt-1 sm:mt-3 text-gray-700 text-sm sm:text-base">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {activeTab === "description" && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Product Description</h2>
            <p className="text-gray-700 mt-1 sm:mt-2 text-sm sm:text-base">{tabData.description}</p>

            {product.features?.length > 0 && (
              <>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mt-3 sm:mt-6">Key Features</h2>
                <ul className="list-disc pl-4 sm:pl-5 mt-1 sm:mt-3 text-gray-700 text-sm sm:text-base">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </>
            )}

            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mt-3 sm:mt-6">Product Specifications</h2>
            <ul className="mt-1 sm:mt-2 space-y-1 text-gray-700 text-sm sm:text-base">
              <li>✅ <strong>Product Type:</strong> {product.category?.category_name || "N/A"}</li>
              <li>✅ <strong>Brand:</strong> {product.brand?.brand_name || "N/A"}</li>
              <li>✅ <strong>Size/Count:</strong> {product.quantity || "N/A"}</li>
              <li>✅ <strong>Item Code:</strong> {product.item_code || "N/A"}</li>
              {product.ingredients && (
                <li>✅ <strong>Ingredients:</strong> {product.ingredients}</li>
              )}
              {product.weight && (
                <li>✅ <strong>Weight:</strong> {product.weight}</li>
              )}
              {product.dimensions && (
                <li>✅ <strong>Dimensions:</strong> {product.dimensions}</li>
              )}
            </ul>
          </div>
        )}

        {activeTab === "videos" && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Product Videos</h2>
            {tabData.videos.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-2 sm:mt-4">
                {tabData.videos.map((video, index) => (
                  <div key={index} className="aspect-w-16 aspect-h-9">
                    <iframe
                      className="w-full h-48 sm:h-64 rounded-lg"
                      src={video.url}
                      title={video.title || `Product Video ${index + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    {video.title && (
                      <p className="mt-1 sm:mt-2 font-medium text-gray-800 text-sm sm:text-base">{video.title}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">No videos available for this product.</p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center mt-1 sm:mt-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-lg sm:text-xl ${i < Math.floor(tabData.reviews.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
              <span className="text-gray-700 ml-1 sm:ml-2 text-sm sm:text-base">
                {tabData.reviews.rating.toFixed(1)} ({tabData.reviews.count} Reviews)
              </span>
            </div>
            
            {tabData.reviews.items.length > 0 ? (
              <div className="mt-2 sm:mt-4 space-y-2 sm:space-y-3">
                {tabData.reviews.items.map((review, index) => (
                  <div key={index} className="border-b pb-2 sm:pb-3">
                    <p className="font-medium text-sm sm:text-base">"{review.title}"</p>
                    <div className="flex text-yellow-400 text-xs sm:text-sm mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <p className="text-gray-700 mt-1 sm:mt-2 text-sm sm:text-base">{review.comment}</p>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">By {review.userName} on {new Date(review.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mt-2 sm:mt-4 text-sm sm:text-base">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        )}

        {activeTab === "recentlyViewed" && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recently Viewed Products</h2>
            {loadingRecentlyViewed ? (
              renderLoadingSkeleton()
            ) : recentlyViewed.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-2 sm:mt-4">
                {recentlyViewed.map(renderProductCard)}
              </div>
            ) : (
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">No recently viewed products to display.</p>
            )}
          </div>
        )}

        {activeTab === "relatedProducts" && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Related Products</h2>
            {loadingRelated ? (
              renderLoadingSkeleton()
            ) : relatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-2 sm:mt-4">
                {relatedProducts.map(renderProductCard)}
              </div>
            ) : (
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">No related products found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}