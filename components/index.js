"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion, useAnimation, useInView } from "framer-motion";
import { ShoppingCartSimple, CaretDown } from "@phosphor-icons/react";
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiShoppingCart } from 'react-icons/fi';
import { Heart, ShoppingCart } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Addtocart from "@/components/AddToCart";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from "swiper/modules";
import RecentlyViewedProducts from '@/components/RecentlyViewedProducts';

import 'swiper/css';
import 'swiper/css/navigation';
export default function HomeComponent() {
    const features = [
        { icon: "🚗", title: "Free Shipping", description: "Free shipping all over the US" },
        { icon: "🔒", title: "100% Satisfaction", description: "Guaranteed satisfaction with every order" },
        { icon: "💼", title: "Secure Payments", description: "We ensure secure transactions" },
        { icon: "💬", title: "24/7 Support", description: "We're here to help anytime" },
    ];
    const scrollContainerRef = useRef(null);
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBannerLoading, setIsBannerLoading] = useState(true);
    const [isFlashSalesLoading, setIsFlashSalesLoading] = useState(true);
    const [bannerData, setBannerData] = useState({
        banner: {
        items: []
        }
    });
    const [userData, setUserData] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [flashSalesData, setFlashSalesData] = useState([]);
    const [brands, setBrands] = useState([]);
    const [isBrandsLoading, setIsBrandsLoading] = useState(true);
    const [scrollDirection, setScrollDirection] = useState('down');
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState();
    const [parentCategories, setParentCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [categoryBanner, setCategoryBanner] = useState([]);
    // Fetch banner data
    useEffect(() => {
        const fetchBannerData = async () => {
            setIsBannerLoading(true);
            try {
                const response = await fetch('/api/design/get?bannerType=topbanner&status=active');
                const data = await response.json();
                
                if (data.success && data.data.length > 0) {
                    const bannerItems = data.data.map(banner => ({
                        id: banner._id,
                        title: banner.title,
                        //buttonText: "Explore Shop",
                        buttonLink: banner.redirectUrl || "/shop",
                        bgImageUrl: banner.bgImageUrl,
                        bannerImageUrl: banner.bannerImageUrl
                    }));
                    setBannerData({
                        banner: {
                        items: bannerItems
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching banner data:", error);
                setBannerData({
                    banner: {
                        items: [{
                            id: 1,
                            title: "Grocery Order and Get Express Delivery",
                            // buttonText: "Explore Shop",
                            buttonLink: "/shop",
                            bgImageUrl: "/images/banner-img1.png",
                            bannerImageUrl: "/images/banner-product.png"
                        }]
                    }
                });
            } finally {
                setIsBannerLoading(false);
            }
        };

        const fetchFlashSales = async () => {
            setIsFlashSalesLoading(true);
            try {
                const response = await fetch('/api/design/get?bannerType=flashsale&status=active');
                const data = await response.json();
                
                if (data.success && data.data.length > 0) {
                    const salesItems = data.data.map(item => ({
                        id: item._id,
                        title: item.title,
                        productImage: item.bannerImageUrl,
                        bgImage: item.bgImageUrl,
                        redirectUrl: item.redirectUrl || "/shop"
                    }));
                    setFlashSalesData(salesItems);
                }
            } catch (error) {
                console.error("Error fetching flash sales:", error);
                setFlashSalesData([
                    {
                    id: "fs1",
                    title: "Summer Fruits Special",
                    productImage: "/images/summer-fruits.png",
                    bgImage: "/images/sale-bg1.jpg",
                    redirectUrl: "/summer-sale"
                    },
                    {
                        id: "fs2",
                        title: "Organic Vegetables",
                        productImage: "/images/veggies.png",
                        bgImage: "/images/sale-bg2.jpg",
                        redirectUrl: "/vegetables"
                    }
                ]);
            } finally {
                setIsFlashSalesLoading(false);
            }
        };

        const fetchBrands = async () => {
            setIsBrandsLoading(true);
            try {
                const response = await fetch('/api/brand/get');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                if (data.success) {
                    setBrands(data.brands || []);
                }
            } catch (error) {
                console.error("Error fetching brands:", error);
                setBrands([]);
            } finally {
                setIsBrandsLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/categories/get");
                const data = await response.json();
                setCategories(data);
                const parentCategories = data.filter(
                category => category.parentid === "none" && category.status === "Active"
                );
                setParentCategories(parentCategories);
                setSelectedCategory(parentCategories[0]);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
    
        const fetchProducts = async () => {
            try {
                const response = await fetch("/api/product/get");
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
    
        const fetchCategoryBanners = async()=>{
            try {
                const response = await fetch("/api/design/get"); // your existing API
                const res = await response.json();
                const data = res.data;
        
                // 1. Find the banner with bannerType === 'categorybanner'
                const categoryBannerData = data.find(item => item.bannerType === "categorybanner");
        
                // 2. If found, set categoryImages array
                if (categoryBannerData && categoryBannerData.categoryImages) {
                setCategoryBanner(categoryBannerData.categoryImages);
                }
            } catch (error) {
                console.error("Error fetching category banners:", error);
            }
        }
        fetchCategoryBanners(); fetchBannerData(); fetchFlashSales(); fetchBrands(); fetchCategories(); fetchProducts();
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        setHasMounted(true);
      }, []);
    
      useEffect(() => {
        if (!hasMounted) return;
      
        const savedCategories = localStorage.getItem('headerCategories');
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        }
      
        const fetchCategories = async () => {
          try {
            const response = await fetch('/api/categories/get');
            const data = await response.json();
            const parentCategories = data.filter(
              (category) => category.parentid === "none" && category.status === "Active"
            );
            setCategories(parentCategories);
            localStorage.setItem('headerCategories', JSON.stringify(parentCategories));
          } catch (error) {
            console.error("Error fetching categories:", error);
          }
        };
      
        fetchCategories();
        checkAuthStatus();
      }, [hasMounted]);

    // Animation controls
    const controls = useAnimation();
    const refs = {
        banner: useRef(null),
        flashSales: useRef(null),
        delivery: useRef(null),
    };
    const checkAuthStatus = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
    
          const response = await fetch('/api/auth/check', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
    
          if (response.ok) {
            const data = await response.json();
            setIsLoggedIn(true);
            setUserData(data.user);
          } else {
            localStorage.removeItem('token');
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Error checking auth status:", error);
        }
      };
    const isInView = {
        banner: useInView(refs.banner, { once: true, amount: 0.1 }),
        flashSales: useInView(refs.flashSales, { once: true, amount: 0.1 }),
        delivery: useInView(refs.delivery, { once: true, amount: 0.1 }),
    };
    useEffect(() => {
        if (isInView.banner) {
          controls.start("visible");
        }
    }, [isInView.banner, controls]);

    const CustomPrevArrow = ({ onClick }) => (
        <button onClick={onClick} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md z-10 hover:bg-gray-600"> ◀ </button>
    );

    const CustomNextArrow = ({ onClick }) => (
        <button onClick={onClick} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md z-10 hover:bg-gray-600"> ▶ </button>
    );

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: true,
        prevArrow: <CustomPrevArrow />,
        nextArrow: <CustomNextArrow />,
    };

    const flashSalesSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        responsive: [
            { 
                breakpoint: 1024,
                settings: {
                slidesToShow: 2,
                }
            },
            {
                breakpoint: 768,
                settings: {
                slidesToShow: 1,
                }
            }
        ]
    };
    const brandSettings = {
        infinite: true,
        speed: 5000, // Higher speed for continuous effect
        slidesToShow: 7, // Adjust according to your design
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 0, // 0ms delay between scrolls
        cssEase: "linear", // Smooth continuous scroll
        arrows: false, // Optional: hide arrows
        pauseOnHover: false, // Optional: keep scrolling on hover
    };

    // const brandSettings = {
    //     dots: false,
    //     infinite: true,
    //     speed: 500,
    //     slidesToShow: 7,
    //     slidesToScroll: 1,
    //     autoplay: true,
    //     autoplaySpeed: 4000,
    //     responsive: [
    //         { breakpoint: 1024, settings: { slidesToShow: 4 } },
    //         { breakpoint: 768, settings: { slidesToShow: 2 } },
    //         { breakpoint: 480, settings: { slidesToShow: 1 } }
    //     ]
    // };
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
            when: "beforeChildren",
            staggerChildren: 0.2
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
            duration: 0.5,
            ease: "easeOut"
            }
        }
    };
    
    const sectionVariants = {
        hiddenDown: { y: 50, opacity: 0 },
        hiddenUp: { y: -50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
            duration: 0.6,
            ease: "easeOut"
            }
        }
    };

    const categoryRef = useRef(null);

    const scrollLeft = () => {
        scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    };
      
    const scrollRight = () => {
        scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    };
    
    const getSubcategorySlugs = (parentId) => {
    return categories
        .filter(cat => cat.parentid === parentId)
        .map(sub => sub.category_slug);
    };

    const filteredProducts = selectedCategory
    ? (() => {
        const subCategories = categories.filter(
          cat => cat.parentid === selectedCategory._id
        );
        console.log(selectedCategory);
        const validCategoryIds = [
          selectedCategory._id,
          ...subCategories.map(sub => sub._id)
        ];
        return products.filter(product => 
          product.category && 
          validCategoryIds.includes(product.category.toString())
        );
    })() : products;



    const handleProductClick = (product) => {
        const stored = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

        const alreadyViewed = stored.find((p) => p._id === product._id);

        const updated = alreadyViewed
            ? stored.filter((p) => p._id !== product._id)
            : stored;

        updated.unshift(product); // Add to beginning

        const limited = updated.slice(0, 10); // Limit to 10 recent products

        localStorage.setItem('recentlyViewed', JSON.stringify(limited));
    };


    const featuredCategory = parentCategories[0];
    const dealCategories = parentCategories.slice(1, 4);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5;
    const [offers, setOffers] = useState([]);
    const [offerProducts, setOfferProducts] = useState([]);
    const bgClasses = ["bg-purple-50", "bg-green-50", "bg-amber-50", "bg-pink-50"];

    useEffect(() => {
      const fetchOfferProducts = async () => {
        try {
          const res = await fetch("/api/offers/offer-products");
          const data = await res.json();
  
          if (data.success) {
            setOfferProducts(data.data);
          }
        } catch (err) {
          console.error("Error loading offer products", err);
        }
      };
  
      fetchOfferProducts();
    }, []);
  
 
    return (
        <>
            {isLoading && (
                // <div className="preloader fixed inset-0 z-[9999] flex justify-center items-center bg-white">
                //     <Image 
                //     src="/images/thumbs/bea.webp"
                //     alt="Loading"
                //     width={64}
                //     height={64}
                //     className="animate-spin"
                //     />
                // </div>
               <div className="preloader fixed inset-0 z-[9999] flex justify-center items-center bg-white">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                </div>
            )}
            {/* main div start */}
            <div className={`relative transition-opacity duration-300 ${isLoading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`} ref={containerRef} >
                
        {hasMounted && categories.length > 0 && (
           <div className="bg-white py-2 relative border-b border-gray-200 shadow">
             <div className="max-w-7xl mx-auto px-2 sm:px-7 relative">
               {/* Swiper arrows - hidden on mobile */}
               <div className="absolute -left-2 sm:-left-2 top-1/2 z-10 -translate-y-1/2 custom-swiper-prev cursor-pointer hidden md:block">
                 <div className="p-2 bg-customBlue rounded-full shadow">
                   <FiChevronLeft size={20} className="text-white" />
                 </div>
               </div>
               <div className="absolute -right-2 sm:-right-2 top-1/2 z-10 -translate-y-1/2 custom-swiper-next cursor-pointer hidden md:block">
                 <div className="p-2 bg-customBlue rounded-full shadow">
                   <FiChevronRight size={20} className="text-white" />
                 </div>
               </div>
         
               <Swiper
                 modules={[Navigation]}
                navigation={{
                    prevEl: '.custom-swiper-prev',
                    nextEl: '.custom-swiper-next',
                }}
           spaceBetween={12} 
           breakpoints={{
             320: { slidesPerView: 3, spaceBetween: 10 },
             460: { slidesPerView: 4, spaceBetween: 12 },
             640: { slidesPerView: 5, spaceBetween: 14 },
             768: { slidesPerView: 6, spaceBetween: 16 },
             900: { slidesPerView: 7, spaceBetween: 20 }, // Increased from 6 to 7
             1024: { slidesPerView: 7, spaceBetween: 24 }, // Reduced from 9 to 7 and increased spaceBetween
             1280: { slidesPerView: 9, spaceBetween: 18 } // Added a new breakpoint for wider screens
           }}
         >
                 {categories.map((category) => (
                   <SwiperSlide key={category._id}>
                     <Link href={`/category/${category.category_slug}`}>
                       <div className="flex flex-col items-center text-center w-full transition-transform duration-300 hover:scale-105 mt-3 sm:mt-4">
                         {/* <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-full border-2 border-blue-200 hover:border-blue-800 flex items-center justify-center overflow-hidden shadow-md animate-fadeIn">
                           {category.image ? (
                             <Image
                               src={category.image}
                               alt={category.category_name}
                               width={80}
                               height={80}
                               className="object-contain"
                             />
                           ) : (
                             <div className="w-10 h-10 bg-gray-300 rounded-full" />
                           )}
                         </div> */}
                         <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-full border-2 border-blue-200 hover:border-blue-800 flex items-center justify-center overflow-hidden shadow-md animate-fadeIn group">
                {category.image ? (
                    <Image
                    src={category.image}
                    alt={category.category_name}
                    width={70}
                    height={70}
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                )}
                </div>

                         <span className="mt-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-customBlue text-center px-1 whitespace-nowrap">
                           {category.category_name}
                         </span>
                       </div>
                     </Link>
                   </SwiperSlide>
                 ))}
               </Swiper>
             </div>
           </div>
        )}        
                 {/* Banner Section start */}
                <motion.section ref={refs.banner} initial="hidden" animate={isInView.banner ? "visible" : "hidden"} variants={containerVariants} className="overflow-hidden pt-0 m-0 ">
                    <div className="relative">
                        {isBannerLoading ? (
                            <div className="p-6 flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                            </div>
                        ) : bannerData.banner.items.length > 0 ? (
                            bannerData.banner.items.length > 1 ? (
                            <Slider {...settings} className="relative">
                                {bannerData.banner.items.map((item) => (
                                    <motion.div key={item.id} className="relative h-[2500px]" variants={itemVariants}>
                                        <div className="absolute inset-0 overflow-hidden">
                                            <Image src={item.bgImageUrl} alt="Background" layout="fill" objectFit="cover" priority />
                                        </div>
                                    </motion.div>
                                ))}
                            </Slider>
                            ) : (
                                <motion.div className="p-6 relative h-[500px]" variants={itemVariants} >
                                    <div className="absolute inset-0 rounded-[30px] overflow-hidden">
                                        <Image src={bannerData.banner.items[0].bgImageUrl} alt="Background" layout="fill" objectFit="cover" className="rounded-[30px]" priority/>
                                        <div className="absolute inset-0 bg-opacity-20 rounded-[30px]"></div>
                                    </div>
                                </motion.div>
                            )
                        ) : (
                            <div className="p-6 text-center">
                            <p className="text-lg">No active banners available</p>
                            </div>
                        )}
                        {/* Scroll Button */}
                        
                    </div>
                </motion.section>

                {/* features code start */}
       {/* features code start */}
               <section className="p-2">
    <div style={{
        display: "flex",
        flexWrap: "nowrap",
        justifyContent: "center",
        gap: "24px",
        maxWidth: "1440px",
        margin: "0 auto",
    }}>
        {features.map((feature, index) => (
            <div key={index} style={{
                display: "flex",
                alignItems: "center",
                flex: "1 1 0",
                minWidth: "0",
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                background: "linear-gradient(135deg, #deb9b9, #73a0e0)"
            }}>
                <div style={{
                    backgroundColor: "#ffffff",
                    color: "white",
                    padding: "12px",
                    borderRadius: "9999px",
                    fontSize: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    {feature.icon}
                </div>
                <div style={{ marginLeft: "16px" }}>
                    <h3 style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#111827",
                        marginBottom: "8px"
                    }}>
                        {feature.title}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#374151" }}>{feature.description}</p>
                </div>
            </div>
        ))}
    </div>
</section>



                {/* Existing offer code start */}
                <div className="px-2 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Exciting Offers</h2>
                        {offerProducts.length > 3 && (
                        <div className="flex gap-2">
                            {/* <button className="swiper-button-prev bg-gray-300 hover:bg-gray-400 p-2 rounded-full">◀</button>
                            <button className="swiper-button-next bg-gray-300 hover:bg-gray-400 p-2 rounded-full">▶</button> */}
                        </div>
                        )}
                    </div>

                    {offerProducts.length === 0 && <p>No active offers found.</p>}

                    {/* If only 1 or 2 products, show static row */}
                    {offerProducts.length > 0 && offerProducts.length <= 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {offerProducts.map((product, index) => (
                            <div
                            key={product._id}
                            className={`card rounded-lg shadow-sm ${bgClasses[index] || "bg-yellow-100"}`}
                            >
                            <div className="flex items-center">
                                <div className="w-1/3 p-2">
                                <Link href={`/product/${product.slug}`} className="block">
                                    <img
                                        src={`/uploads/products/${product.images?.[0]}` || "/placeholder.jpg"}
                                        alt={product.item_code}
                                        className="w-full object-contain pl-1"
                                    />
                                </Link>
                                </div>
                                <div className="w-2/3 p-4">
                                <div className="flex items-center mb-2">
                                    <svg
                                    stroke="currentColor"
                                    fill="none"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    className="mr-1 h-3.5 w-3.5"
                                    >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                    </svg>
                                    {/* <span className="text-sm">04h : 43m : 59s</span> */}
                                </div>
                                <Link href={`/product/${product.slug}`} className="block">
                                     <div className="text-sm line-clamp-2">{product.name}</div>
                                </Link>
                                <div className="mt-1">
                                    <span className="text-sm font-medium text-gray-700">Rs.</span>
                                    <span className="ml-1 font-semibold">{product.price}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="text-sm font-medium text-gray-400 line-through whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-400">Rs.</span>
                                    {product.special_price ? product.price : product.price + 20}
                                    </div>
                                    <div className="text-sm font-semibold text-green-600 bg-white rounded px-2 whitespace-nowrap">
                                    {product.special_price ? "Special Offer" : "Limited Time"}
                                    </div>
                                </div>
                                </div>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}

                    {/* If 3 or more products, show Swiper */}
                    {offerProducts.length >= 3 && (
                        <Swiper
                        modules={[Navigation, Autoplay]}
                        navigation={{
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                        }}
                        autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                        }}
                        slidesPerView={4}
                        spaceBetween={0}
                        loop={true}
                    >
                    
                        {offerProducts.map((product, index) => (
                            <SwiperSlide key={product._id}>
                            <div className={`card rounded-lg shadow-sm ${bgClasses[index % bgClasses.length]}`}>
                                <div className="flex items-center">
                                <div className="w-1/3 p-2">
                                <Link href={`/product/${product.slug}`} className="block">
                                    <img
                                    src={`/uploads/products/${product.images?.[0]}` || "/placeholder.jpg"}
                                    alt={product.item_code}
                                    className="w-full object-contain pl-1"
                                    />
                                    </Link>
                                </div>
                                <div className="w-2/3 p-4">
                                    {/* <div className="flex items-center mb-2">
                                    <svg
                                        stroke="currentColor"
                                        fill="none"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        className="mr-1 h-3.5 w-3.5"
                                    >
                                        <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="text-sm">04h : 43m : 59s</span>
                                    </div> */}
                                    <Link href={`/product/${product.slug}`} className="block">
                                     <div className="text-sm line-clamp-2">{product.name}</div>
                                    </Link>
                                    <div className="mt-1">
                                    <span className="text-sm font-medium text-gray-700">Rs.</span>
                                    <span className="ml-1 font-semibold">{product.price}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                    <div className="text-sm font-medium text-gray-400 line-through whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-400">Rs.</span>
                                        {product.special_price ? product.price : product.price + 20}
                                    </div>
                                    <div className="text-sm font-semibold text-green-600 bg-white rounded px-2 whitespace-nowrap">
                                        {product.special_price ? "Special Offer" : "Limited Time"}
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            </SwiperSlide>
                        ))}
                        </Swiper>
                    )}
                </div>

                {/* category banner code start */}
                <div className="px-2 sm:px-2 lg:px-2 p-2">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {categoryBanner.map((banner, index) => (
                            <div key={index} className="col-span-1">
                                <div className="card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <Link href={banner.redirectUrl} className="no-underline">
                                    <img
                                        src={banner.imageUrl}
                                        alt={`Category Banner ${index + 1}`}
                                        title={`Category Banner ${index + 1}`}
                                        className="w-full h-auto object-cover"
                                        width={400} // width you defined in virtual
                                        height={400}
                                    />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* flash sale section code start */}
                <motion.section
                ref={refs.flashSales}
                initial="hiddenDown"
                animate={isInView.flashSales ? "visible" : "hiddenDown"}
                variants={sectionVariants}
                id="flash-sales-section"
                className=""
                >
                {flashSalesData.filter(item => item.bgImage && item.productImage).length > 0 && (
                <div className="py-2">
                    <motion.div
                    variants={itemVariants}
                    className="section-heading flex justify-between items-center mb-4 p-2"
                    >
                    <h5 className="text-2xl font-bold">Categories</h5>
                    {/* <a href="/shop" className="text-sm font-medium text-gray-700 hover:underline">
                        View All Deals
                    </a> */}
                    </motion.div>

                    {isFlashSalesLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                    ) : flashSalesData.length === 1 && flashSalesData[0].bgImage && flashSalesData[0].productImage ? (
                    <motion.div variants={itemVariants} className="px-2">
                        <motion.div
                        whileHover={{ y: -5 }}
                        className="relative p-6 rounded-lg shadow-lg h-full min-h-[250px] flex items-center overflow-hidden"
                        style={{
                            backgroundImage: `url(${flashSalesData[0].bgImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }}
                        >
                        <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-center">
                            <div className="w-full md:w-1/2 flex justify-center items-center overflow-hidden">
                            <Image
                                src={flashSalesData[0].productImage}
                                alt={flashSalesData[0].title}
                                width={180}
                                height={180}
                                className="object-contain max-h-[180px] transform transition-transform duration-300 hover:scale-110"
                            />
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center mt-4 md:mt-0 md:pl-4">
                            <h6 className="text-xl font-semibold mb-2 text-gray-900">{flashSalesData[0].title}</h6>
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href={flashSalesData[0].redirectUrl}
                                className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-full text-center hover:bg-blue-700 transition"
                            >
                                Shop Now →
                            </motion.a>
                            </div>
                        </div>
                        </motion.div>
                    </motion.div>
                    ) : (
                    <motion.div variants={itemVariants}>
                        <Slider {...flashSalesSettings} className="flash-sales-slider relative">
                        {flashSalesData
                            .filter(item => item.bgImage && item.productImage)
                            .map(item => (
                            <div key={item.id} className="px-2">
                                <motion.div
                                className="relative p-6 rounded-lg shadow-lg h-full min-h-[250px] flex items-center overflow-hidden"
                                style={{
                                    backgroundImage: `url(${item.bgImage})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center"
                                }}
                                >
                                <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-center">
                                    <div className="w-full md:w-1/2 flex justify-center items-center overflow-hidden">
                                    <Image
                                        src={item.productImage}
                                        alt={item.title}
                                        width={180}
                                        height={180}
                                        className="object-contain max-h-[180px] transform transition-transform duration-300 hover:scale-110"
                                    />
                                    </div>
                                    <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center mt-4 md:mt-0 md:pl-4">
                                       <motion.h6 
                                            className="text-xl font-semibold mb-2 text-gray-900"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 1.1 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 10 }}
                                            >
                                            {item.title}
                                        </motion.h6>
                                    <motion.a
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        href={item.redirectUrl}
                                        className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-full text-center hover:bg-blue-700 transition"
                                    >
                                        Shop Now →
                                    </motion.a>
                                    </div>
                                </div>
                                </motion.div>
                            </div>
                            ))}
                        </Slider>
                    </motion.div>
                    )}
                </div>
                )}
                </motion.section>


                {/* brand section code start */}
                <motion.section ref={refs.delivery} initial={scrollDirection === 'down' ? 'hiddenDown' : 'hiddenUp'} animate={isInView.delivery ? 'visible' : scrollDirection === 'down' ? 'hiddenDown' : 'hiddenUp'} variants={sectionVariants} className="mb-2  py-4 px-2">
                    <div>
                        <motion.div variants={containerVariants} className="rounded-lg bg-gray-100 rounded-[23px] p-2">
                        <motion.div variants={itemVariants} className="flex justify-between items-center mb-4">
                            <h5 className="text-lg font-semibold">Shop by Brands</h5>
                            {/* <a href="/shop" className="text-sm font-medium text-gray-700 hover:text-main-600">
                            View All Brands
                            </a> */}
                        </motion.div>

                        {isBrandsLoading ? (
                            <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <motion.div variants={itemVariants}>
                             <Slider {...brandSettings} className="brand-slider px-[50px] relative">
                                {brands.map((brand) => (
                                <motion.div
                                    key={brand.id}
                                    className="p-4 flex justify-center items-center"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <div className="w-28 h-28  flex items-center justify-center overflow-hidden">
                                    <Image
                                        src={`/uploads/Brands/${brand.image}`}
                                        alt={brand.brand_name || "Brand Logo"}
                                        width={100}
                                        height={100}
                                        className="object-contain w-full h-full"
                                        unoptimized
                                    />
                                    </div>
                                </motion.div>
                                ))}
                            </Slider>
                            </motion.div>
                        )}
                        </motion.div>
                    </div>
                </motion.section>


                {/* recomended product sections */}
                <motion.section className="mb-2 px-2 recommended-products pt-15 mb-10">
                    <div className="bg-gray-100 rounded-[23px] px-2 py-4 p-2">
                        {/* Section Header */}
                        <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                            <h5 className="text-2xl font-bold">Recommended for you</h5>
                            <div className="flex items-center gap-4">
                                <a href="" className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline">
                                    View All Products
                                </a>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={scrollLeft} 
                                        className="p-2 border border-gray-300 rounded-full hover:bg-blue-600 hover:text-white transition"
                                    >
                                        <FiChevronLeft size={18} />
                                    </button>
                                    <button 
                                        onClick={scrollRight} 
                                        className="p-2 border border-gray-300 rounded-full hover:bg-blue-600 hover:text-white transition"
                                    >
                                        <FiChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex mb-6 overflow-x-auto pb-2 hide-scrollbar">
                            {parentCategories.map((category) => (
                                <button
                                    key={category._id}
                                    className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap mr-2 transition-colors ${
                                        selectedCategory?._id === category._id
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-200"
                                    }`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category.category_name}
                                </button>
                            ))}
                        </div>

                        {/* Product List with Horizontal Scrolling */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center font-bold text-gray-500 text-lg py-10">
                                No Product Found for this Category..!
                            </div>
                        ) : (
                            <div className="relative">
                                <div 
                                    ref={scrollContainerRef} 
                                    className="flex gap-6 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
                                >
                                
                                {/* Dynamic Category Banner Card */}
                                    {selectedCategory && (
                                    <div className="flex-shrink-0 w-[250px] snap-start">
                                        <div className="bg-blue-900 text-white rounded-lg h-full flex flex-col justify-between p-4 shadow hover:shadow-lg transition">
                                        <h3 className="text-xl font-bold mb-4">{selectedCategory.category_name}</h3>
                                        <div className="flex-1 flex items-center justify-center">
                                            <img 
                                            src={selectedCategory.image || "/user/placeholder.png"} 
                                            alt={selectedCategory.category_name} 
                                            className="h-50 object-contain"
                                            onError={(e) => { 
                                                e.target.onerror = null; 
                                                e.target.src = "/user/placeholder.png"; 
                                            }}
                                            />
                                        </div>
                                        <Link 
                                            href={`/category/${selectedCategory.category_slug || selectedCategory._id}`}
                                            className="mt-4 bg-white text-blue-700 font-semibold py-2 rounded hover:bg-gray-100 transition text-center"
                                        >
                                            Shop Now →
                                        </Link>
                                        </div>
                                    </div>
                                    )}

                                    {/* 🔁 Product Cards */}
                                   {filteredProducts.map((product) => (
    <div key={product._id} className="flex-shrink-0 w-[250px] snap-start">
        <motion.div 
            whileHover={{ y: -5 }} 
            className="relative border rounded-lg shadow p-4 transition-all duration-300 hover:border-blue-500 hover:shadow-lg group bg-white h-full flex flex-col justify-between"
        >
            {product.special_price && (
                <div className="absolute top-3 left-3 z-10">
                    <span className="px-2 py-1 text-xs text-white bg-red-500 rounded">
                        {Math.round(
                            ((product.price - product.special_price) / product.price) * 100
                        )}% OFF
                    </span>
                </div>
            )}

            <div className="absolute top-2 right-2 z-10 hover:text-red-500">
                <ProductCard productId={product._id} />
            </div>

            <div className="h-48 flex items-center justify-center mt-4">
                <img 
                    src={`/uploads/products/${product.images?.[0]}` || "/placeholder.jpg"} 
                    alt={product.images?.[0] || "Product image"} 
                    className="max-h-full max-w-full object-contain" 
                    onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "/uploads/products/placeholder.jpg";
                    }} 
                />
            </div>

            <Link href={`/product/${product.slug || product._id}`} onClick={() => handleProductClick(product)}>
  <h3 className="mt-3 font-semibold group-hover:text-blue-600 line-clamp-2 min-h-[3rem] leading-snug">
    {product.name}
  </h3>
</Link>


            <div className="mt-2 text-lg font-bold text-blue-600">
                Rs. {product.special_price || product.price}
                {product.special_price && (
                    <span className="line-through text-gray-400 text-sm ml-1">
                        Rs. {product.price}
                    </span>
                )}
            </div>

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
                        )}
                    </div>
                </motion.section>
<RecentlyViewedProducts />
                {/* Hot deal section - showing only parent categories */}
                
            </div>
        </>
    );
}