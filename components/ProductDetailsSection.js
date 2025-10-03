'use client';
// import { useState, useEffect } from "react";
import { useState, useEffect, useRef } from "react";
import { SiTicktick } from "react-icons/si";
import { TbBrandAppgallery } from "react-icons/tb";
import { FiBox, FiHash } from "react-icons/fi";
import Image from "next/image";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import Link from "next/link";
import { Poppins } from "next/font/google";
const poppins = Poppins({ subsets: ["latin"], weight: ["400","500","600"] });
import { formatDistanceToNow, format } from "date-fns";
import { useHeaderdetails } from '@/context/HeaderContext';
import { ToastContainer, toast } from 'react-toastify';

export default function ProductDetailsSection({ product, reviews=[], avgRating=0, reviewCount=0}) {

  const [brand, setBrand] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loadingRecentlyViewed, setLoadingRecentlyViewed] = useState(false);
  const { updateHeaderdetails, setIsLoggedIn, setUserData,setIsAdmin } = useHeaderdetails();
  const flixScriptRef = useRef(null);
  const flixInitializedRef = useRef(false);
  const [brandName, setBrandName] = useState("");
 
  const tabData = {
    overview: product.overview || "No overview available.",
    description: product.description || "No description available.",
    videos: product.videos || [],
    overview: product.overview || "No overview available.",
    // reviews: {
    //   rating: product.rating || 0,
    //   count: product.reviews || 0,
    //   items: product.reviewItems || []
    // }
    reviews: {
      rating: avgRating,
      count: reviewCount,
      items: reviews.map(r => ({
        title: r.reviews_title,
        rating: r.reviews_rating,
        comment: r.reviews_comments,
        userName: r.user_id?.name || "Anonymous",
        date: r.created_date
      }))
    }
  };
  // Function to check if a tab has content
  const hasTabContent = (tabId) => {
    switch(tabId) {
      case "overview":
        return true;
      
      case "description":
        const descObj = parseJSONSafe(tabData.description);
        if (descObj && typeof descObj === "object" && Object.keys(descObj).length > 0) {
          return true;
        }
        return tabData.description && tabData.description !== "No description available.";
      
      case "videos":
        return true;
      
      case "reviews":
        return true ;
      
      default:
        return true;
    }
  };

   // Function to find the next available tab with content
  const findNextAvailableTab = (currentTab) => {
    const tabs = ["overview", "description", "videos", "reviews"];
    const currentIndex = tabs.indexOf(currentTab);
    
    // Check remaining tabs starting from current position
    for (let i = currentIndex; i < tabs.length; i++) {
      if (hasTabContent(tabs[i])) {
        return tabs[i];
      }
    }
    
    // If no content found in remaining tabs, check from beginning
    for (let i = 0; i < currentIndex; i++) {
      if (hasTabContent(tabs[i])) {
        return tabs[i];
      }
    }
    
    // If no tabs have content, return the first tab
    return tabs[0];
  };

   // Effect to handle tab content availability
    useEffect(() => {
      if (!hasTabContent(activeTab)) {
        const nextTab = findNextAvailableTab(activeTab);
        if (nextTab !== activeTab) {
          setActiveTab(nextTab);
          // toast.info(`No content available in ${activeTab}. Showing ${nextTab} instead.`);
        }
      }
    }, [activeTab, product, reviews]);

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

  const reviewsRef = useRef(null);
 
  useEffect(() => {
    if (window.location.hash === "#reviews") {
      setActiveTab("reviews");
      setTimeout(() => {
        const headerEl = document.querySelector("header"); // get header
        const headerHeight = headerEl ? headerEl.offsetHeight : 0;
  
        if (reviewsRef.current) {
          const y = reviewsRef.current.getBoundingClientRect().top + window.scrollY - headerHeight - 10; 
          // `-10` gives little gap below header
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 300);
    }
  }, []);


 
  const fetchBrand = async () => {
    try {
      const response = await fetch("/api/brand");
      const result = await response.json();
      if (result.error) {
      console.error(result.error);
      } else {
        const data = result.data;
  
        // Format for react-select
        const brandOptions = data.map((b) => ({
          value: b._id,
          label: b.brand_name,
        }));
  
        setBrand(brandOptions);
        // 👉 If you already have the ID and want to get the label (e.g., when editing)
        if (product.brand) {
          const matched = brandOptions.find((b) => b.value === product.brand);
          // if (matched) {
          //   console.log("Selected Brand Name:", matched.label);
          // }
        }
      }
    } catch (error) {
  console.error(error.message);
    }
  };
  
  useEffect(() => {
    fetchBrand();
  }, []);

    useEffect(() => {
    if (activeTab === "overview") {
      const timer = setTimeout(() => {
        initializeFlixMedia();
      }, 300);
 
      return () => clearTimeout(timer);
    }
  }, [activeTab]); // Add brandName as dependency
 
 const initializeFlixMedia = () => {
  console.log("Initializing FlixMedia with brand:", brandName);
 
  // Clean up existing FlixMedia elements
  const existingInpage = document.getElementById("flix-inpage");
  const existingMinisite = document.getElementById("flix-minisite");
 
  if (existingInpage) existingInpage.remove();
  if (existingMinisite) existingMinisite.remove();
 
  // Create containers for FlixMedia
  const overviewTab = document.querySelector("#overview-tab .col-md-12");
  const keyFea = document.querySelector(".key-fea");
 
  if (overviewTab && !document.getElementById("flix-inpage")) {
    const inpageDiv = document.createElement("div");
    inpageDiv.id = "flix-inpage";
    inpageDiv.className = "flix-inpage-container";
    overviewTab.prepend(inpageDiv);
    console.log("Created flix-inpage container");
  }
 
  if (keyFea && !document.getElementById("flix-minisite")) {
    const miniSiteDiv = document.createElement("div");
    miniSiteDiv.id = "flix-minisite";
    miniSiteDiv.className = "flix-minisite-container";
    keyFea.insertAdjacentElement("afterend", miniSiteDiv);
    console.log("Created flix-minisite container");
  }
 
  // Remove existing script
  if (flixScriptRef.current) {
    flixScriptRef.current.remove();
    flixScriptRef.current = null;
  }
 
  // Set up fallback timeout
  const fallbackTimeout = setTimeout(() => {
    if (!flixInitializedRef.current) {
      console.log("FlixMedia failed to load, showing fallback message");
      showFallbackMessage();
    }
  }, 3000); // Wait 3 seconds for FlixMedia to load
 
  // Load FlixMedia script with dynamic brand name
  loadFlixScript(fallbackTimeout);
};
 
const loadFlixScript = (fallbackTimeout) => {
  const headID = document.getElementsByTagName("head")[0];
  console.log(brandName, product);
  const flixScript = document.createElement("script");
  flixScript.type = "text/javascript";
  flixScript.async = true;
  flixScript.src = "//media.flixfacts.com/js/loader.js";
 
  // Use the dynamically fetched brand name
  flixScript.setAttribute("data-flix-distributor", "17089");
  flixScript.setAttribute("data-flix-language", "in");
  flixScript.setAttribute("data-flix-fallback-language", "");
  flixScript.setAttribute("data-flix-ean", product.ean || "");
  flixScript.setAttribute("data-flix-mpn", product.mpn || product.sku || product.item_code);
  flixScript.setAttribute("data-flix-button", "flix-minisite");
  flixScript.setAttribute("data-flix-inpage", "flix-inpage");
  flixScript.setAttribute("data-flix-price", product.price || "");
 
  flixScript.onload = () => {
    console.log("FlixMedia script loaded with brand:", brandName);
    clearTimeout(fallbackTimeout); // Clear the fallback timeout
   
    // Check if FlixMedia actually has content for this product
    checkFlixMediaContent();
  };
 
  flixScript.onerror = (error) => {
    console.error("Failed to load FlixMedia script:", error);
    clearTimeout(fallbackTimeout);
    showFallbackMessage();
  };
 
  headID.appendChild(flixScript);
  flixScriptRef.current = flixScript;
 
  setTimeout(() => {
    if (window.FlixMedia && typeof window.FlixMedia.load === 'function') {
      console.log("Manually triggering FlixMedia.load()");
      window.FlixMedia.load();
    }
  }, 500);
};
 
const checkFlixMediaContent = () => {
  // Check if FlixMedia containers have content after loading
  const checkContent = () => {
    const flixInpage = document.getElementById("flix-inpage");
    const flixMinisite = document.getElementById("flix-minisite");
   
    const hasInpageContent = flixInpage && flixInpage.children.length > 0;
    const hasMinisiteContent = flixMinisite && flixMinisite.children.length > 0;
   
    if (!hasInpageContent && !hasMinisiteContent) {
      // Wait a bit more and check again
      setTimeout(() => {
        const finalCheckInpage = document.getElementById("flix-inpage");
        const finalCheckMinisite = document.getElementById("flix-minisite");
       
        const finalHasInpage = finalCheckInpage && finalCheckInpage.children.length > 0;
        const finalHasMinisite = finalCheckMinisite && finalCheckMinisite.children.length > 0;
       
        if (!finalHasInpage && !finalHasMinisite) {
          console.log("No FlixMedia content found for this product");
          showFallbackMessage();
        } else {
          flixInitializedRef.current = true;
          console.log("FlixMedia content loaded successfully");
        }
      }, 2000); // Wait 2 more seconds for content to render
    } else {
      flixInitializedRef.current = true;
      console.log("FlixMedia content loaded successfully");
    }
    if (!hasInpageContent) {
      const message = document.createElement('div');
      message.textContent = 'Product overview not available';
      message.style.fontStyle = 'italic'; // Optional styling
      message.style.color = '#666';       // Optional styling
      message.style.marginTop ='10px';
 
      flixInpage?.appendChild(message); // Use optional chaining in case flixInpage is null
    }
  };
 
  // Initial check after a short delay
  setTimeout(checkContent, 1000);
};
 
const showFallbackMessage = () => {
  // Remove FlixMedia containers if they exist but are empty
  const flixInpage = document.getElementById("flix-inpage");
  const flixMinisite = document.getElementById("flix-minisite");
 
  if (flixInpage && flixInpage.children.length === 0) {
    flixInpage.remove();
  }
 
  if (flixMinisite && flixMinisite.children.length === 0) {
    flixMinisite.remove();
  }
 
  // Create and show fallback message
  const overviewTab = document.querySelector("#overview-tab .col-md-12");
  if (overviewTab && !document.querySelector(".no-overview-message")) {
    const fallbackMessage = document.createElement("p");
    fallbackMessage.className = "no-overview-message text-gray-500 text-center py-4";
    fallbackMessage.textContent = "There is no product overview available for this item.";
    overviewTab.appendChild(fallbackMessage);
  }
 
  flixInitializedRef.current = false;
};
 
const cleanupFlixMedia = () => {
  console.log("Cleaning up FlixMedia...");
 
  if (flixScriptRef.current) {
    flixScriptRef.current.remove();
    flixScriptRef.current = null;
  }
 
  const flixInpage = document.getElementById("flix-inpage");
  const flixMinisite = document.getElementById("flix-minisite");
 
  if (flixInpage) {
    flixInpage.remove();
  }
 
  if (flixMinisite) {
    flixMinisite.remove();
  }
 
  // Also remove fallback message if it exists
  const fallbackMessage = document.querySelector(".no-overview-message");
  if (fallbackMessage) {
    fallbackMessage.remove();
  }
 
  const flixFrames = document.querySelectorAll('iframe[src*="flixmedia"]');
  flixFrames.forEach(frame => frame.remove());
 
  flixInitializedRef.current = false;
};
 
  useEffect(() => {
    return () => {
      cleanupFlixMedia();
    };
  }, []);


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

  // put this near the top of your component (before return)
  const parseJSONSafe = (value) => {
    if (!value) return null;
    if (typeof value === "object") return value; // already an object
    if (typeof value !== "string") return null;

    const tryParse = (str) => {
      try {
        return JSON.parse(str);
      } catch {
        return undefined;
      }
    };

    let s = value.trim();

    // 1) direct parse
    let parsed = tryParse(s);
    if (parsed !== undefined) {
      // if parsed is a string again (double-encoded), recurse
      return typeof parsed === "string" ? parseJSONSafe(parsed) : parsed;
    }

    // 2) strip wrapping quotes if present and try again
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      s = s.slice(1, -1).trim();
      parsed = tryParse(s);
      if (parsed !== undefined) return typeof parsed === "string" ? parseJSONSafe(parsed) : parsed;
    }

    // 3) unescape common escaped quotes/slashes and try one last time
    try {
      const unescaped = s.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\");
      parsed = tryParse(unescaped);
      if (parsed !== undefined) return typeof parsed === "string" ? parseJSONSafe(parsed) : parsed;
    } catch {}

    return null; // couldn't parse
  };

  const decodeAndClean = (str) => {
    if (!str) return "";

    // Create a temporary element to decode HTML entities
    const temp = document.createElement("textarea");
    temp.innerHTML = str;
    let decoded = temp.value;

    // Remove both actual LRM char and literal "&lrm;"
    decoded = decoded.replace(/\u200E/g, "").replace(/&lrm;/gi, "");

    return decoded.trim();
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
      // console.error("Error fetching recently viewed products:", error);
       toast.error("Error fetching recently viewed products:", error);
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
          <span className={`px-1 sm:px-2 py-1 text-xs font-bold tracking-wider text-white rounded absolute top-1 sm:top-2 left-1 sm:left-2 ${
            discountPercentage > 30 ? "bg-blue-500" : "bg-orange-500"
          }`}>
            -{discountPercentage}% OFF
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

  function formatReviewDate(date) {
    const reviewDate = new Date(date);
    const now = new Date();
    const diffInDays = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));

    if (diffInDays < 7) {
      return formatDistanceToNow(reviewDate, { addSuffix: true });
    } else {
      return format(reviewDate, "MMM d, yyyy"); 
    }
  }

  const [reviewForm, setReviewForm] = useState({
    title: "",
    rating: 0,
    comment: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const userId = "66f03a7b8f...";

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const reslt = await fetch('/api/auth/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      const data1 = await reslt.json();
      if (!data1.loggedIn) {
          openAuthModal({
          error: 'Please login to continue.',
          onSuccess: () => handleReviewSubmit(),
        });
        // alert("Please login to continue!..");
         toast.error("Please login to continue!..");
        return;
      }

      if(data1.loggedIn) {
        const userId    = data1.user.userId;
        const productId = product._id;
        const res = await fetch(`/api/reviews/${product._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            productId,
            reviews_title: reviewForm.title,
            reviews_rating: reviewForm.rating,
            reviews_comments: reviewForm.comment,
          }),
        });
        const data = await res.json();
        if (data.success) {
           toast.success("Review added successfully!");
          // window.location.reload();
        } else {
           toast.error("Error: " + data.error);
        }
      }else {
         toast.error("Please login to review the product!..");
        // alert("Please login to review the product!..")
      }
    } catch (error) {
      // console.error("Error submitting review:", error);
       toast.error("Error submitting review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  function StarRating({ value, onChange }) {
    return (
      <div className="flex space-x-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <span
              className={`text-2xl ${
                star <= value ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    
    <div className="mt-4 sm:mt-8 bg-gray-100 w-full py-6">
        <ToastContainer position="top-right" autoClose={5000} />
      {/* Tabs */}
      <div className={`flex justify-center  ${poppins.className}`}>
        {/* <div className="flex justify-center gap-8"> */}
    {[
      { id: "overview", label: "Overview" },
      { id: "description", label: "Description" },
      { id: "videos", label: "Videos" },
      { id: "reviews", label: "Reviews" },
      // { id: "recentlyViewed", label: "Recently Viewed" },
      // { id: "relatedProducts", label: "Related" },
    ].map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          activeTab === tab.id
            ? "border border-black text-black font-semibold"
            : "text-gray-500 hover:text-black"
        }`} ref={reviewsRef}
      >
        {tab.label}
      </button>
    ))}
  </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className={`mx-auto px-4 py-6 text-center ${activeTab === "overview" ? "block" : "hidden"}`}>
          <div id="overview-tab">
            <div className="col-md-12">
              {/* flix-inpage will be inserted here */}
            </div>
          </div>
        </div>
      )}
 
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        {/* {activeTab === "overview" && (
          <div>
            <h2 className={`text-sm font-bold transition-all duration-200 text-left ${poppins.className}`}>Product Overview</h2>
            <p className="text-gray-700 mt-1 sm:mt-2 text-sm sm:text-base">{tabData.overview}</p>
            
            {product.product_highlights?.length > 0 && (
              <>
                <h2 className={`text-lg sm:text-xl font-semibold text-gray-900 mt-3 sm:mt-6 ${poppins.className}`}>Highlights</h2>
                <ul className={`list-disc pl-4 sm:pl-5 mt-1 sm:mt-3 text-gray-700 text-sm sm:text-base ${poppins.className}`}>
                  {product.product_highlights.slice(0, 3).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </>
            )}

            {product.key_specifications?.length > 0 && (
  <>
    <h2
      className={`text-sm font-bold transition-all duration-200 text-left ${poppins.className}`}
    >
      Key Features
    </h2>
    <ul className="list-disc pl-5 mt-1 sm:mt-3 text-gray-700 text-sm sm:text-base space-y-1">
  {product.key_specifications.flatMap((spec, i) =>
    spec
      .split(",")
      .map((item) => item.trim().replace(/&amp;/g, "&")) // replace &amp; with &
      .filter((item) => item.length > 0)
      .map((item, j) => (
        <li
          key={`${i}-${j}`}
          className={`text-left text-xs sm:text-sm ${poppins.className}`}
        >
          {item}
        </li>
      ))
  )}
</ul>

  </>
)}

          </div>
        )} */}

       {activeTab === "description" && (() => {
  const descObj = parseJSONSafe(tabData.description);

  const hasValidDescription =
    descObj && typeof descObj === "object" && Object.keys(descObj).length > 0;

  const hasPlainDescription =
    tabData.description &&
    tabData.description.trim().length > 0 &&
    tabData.description !== "null" && // check against "null" string
    tabData.description.toLowerCase() !== "null" && // case-insensitive just in case
    tabData.description !== "No description available.";

  const hasSpecifications =
    product.brand ||
    product.item_code ||
    product.ingredients ||
    product.weight ||
    product.dimensions;

  // If no description and no specs, hide the whole section
  if (!hasValidDescription && !hasPlainDescription && !hasSpecifications) {
    return null;
  }

  return (
    <div>
      {/* Product Description */}
      {(hasValidDescription || hasPlainDescription) && (
        <>
          <h2 className={`text-sm font-bold text-left ${poppins.className}`}>Product Description</h2>
          {hasValidDescription ? (
            <div className="mt-3 text-xs sm:text-sm text-gray-700 space-y-1">
              {Object.entries(descObj).map(([key, val]) => {
                const cleanKey = decodeAndClean(key);
                const cleanVal = decodeAndClean(val);
                return (
                  <div key={cleanKey} className="grid grid-cols-[150px,1fr] gap-x-2 items-start">
                    <div className={`text-xs sm:text-sm font-bold ${poppins.className}`}>{cleanKey}:</div>
                    <div className={`text-xs sm:text-sm ${poppins.className}`}>{cleanVal}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-xs sm:text-sm text-gray-700">
              {decodeAndClean(String(tabData.description))}
            </p>
          )}
        </>
      )}

      {/* Product Specifications */}
      {hasSpecifications && (
        <>
          <h2 className={`text-sm font-bold mt-3 text-left ${poppins.className}`}>Product Specifications</h2>
          <ul className="mt-1 sm:mt-2 text-gray-700 text-xs sm:text-sm space-y-1">
            {[
              {
                icon: <TbBrandAppgallery size={14} className="text-white" />,
                label: "Brand",
                value: brand.find((b) => b.value === product.brand)?.label || "N/A",
              },
              {
                icon: <FiHash size={16} className="text-white" />,
                label: "Item Code",
                value: product.item_code || "N/A",
              },
              product.ingredients && {
                icon: <FiBox size={14} className="text-white" />,
                label: "Ingredients",
                value: product.ingredients,
              },
              product.weight && {
                icon: <FiBox size={14} className="text-white" />,
                label: "Weight",
                value: product.weight,
              },
              product.dimensions && {
                icon: <FiBox size={14} className="text-white" />,
                label: "Dimensions",
                value: product.dimensions,
              },
            ]
              .filter(Boolean)
              .map((item, idx) => (
                <li key={idx} className="flex items-center">
                  <div className="w-5 h-5 flex items-center justify-center bg-gray-600 rounded-md mr-2">
                    {item.icon}
                  </div>
                  <div className="flex gap-x-1">
                    <strong className={`text-xs sm:text-sm ${poppins.className}`}>{item.label}:</strong>
                    <span className={`${poppins.className}`}>{item.value}</span>
                  </div>
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
})()}

        {activeTab === "videos" && (
          <div>
            <h2 className={`text-sm font-bold transition-all duration-200 text-left mt-3 ${poppins.className}`}>Product Videos</h2>
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
            
            <form onSubmit={handleReviewSubmit} className="bg-white p-4 rounded-md shadow mt-3">
              <h3 className="font-semibold text-left mb-2">Write a Review</h3>

              <input type="text" placeholder="Review Title" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} required className="w-full border rounded p-2 mb-2" />

              {/* <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} required className="w-full border rounded p-2 mb-2" >
                <option value="">Select Rating</option>
                {[1,2,3,4,5].map(n => (
                  <option key={n} value={n}>{n} Star{n>1 && "s"}</option>
                ))}
              </select> */}

              <StarRating value={reviewForm.rating} onChange={(rating) => setReviewForm({ ...reviewForm, rating })} />

              <textarea placeholder="Write your comments..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} className="w-full border rounded p-2 mb-2" rows="3" ></textarea>

              <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>

            <h2 className={`text-sm font-bold transition-all duration-200 text-left mt-3 ${poppins.className}`}>Customer Reviews</h2>
            <div className="flex items-center mt-1 sm:mt-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-lg sm:text-2xl ${i < Math.floor(tabData.reviews.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
              <span className="text-gray-700 ml-1 sm:ml-2 text-sm sm:text-base">
                {tabData.reviews.rating.toFixed(1)} ({tabData.reviews.count} Reviews)
              </span>
            </div>
            
            {tabData.reviews.items.length > 0 ? (
              <div className="mt-2 sm:mt-4 space-y-2 sm:space-y-3">
                {tabData.reviews.items.map((review, index) => (
                  <div key={index} className={`border-b border-gray-300  pb-2 sm:pb-3 ${index === 0 ? "border-t" : ""} `}>
                    <div className="flex text-lg items-baseline sm:text-lg mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span className="text-yellow-400" key={i}>{i < review.rating ? '★' : '☆'}</span>
                      ))}
                      <p className="text-gray-700 font-medium text-sm sm:text-base">&nbsp;{review.title}</p>
                    </div>
                    <p className="text-gray-700 text-left mt-1 sm:mt-2 text-sm sm:text-base">{review.comment}</p>
                    <p className="text-gray-400 text-left text-xs sm:text-sm mt-1">Reviewed By {review.userName} on {formatReviewDate(review.date)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mt-2 sm:mt-4 text-sm sm:text-base">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        )}

       
      </div>
    </div>
  );
}