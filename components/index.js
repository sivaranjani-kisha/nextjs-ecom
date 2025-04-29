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
import { Navigation } from 'swiper/modules';
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
            items: [
              {
                id: 1,
                title: "Grocery Order and Get Express Delivery",
               // buttonText: "Explore Shop",
                buttonLink: "/shop",
                bgImageUrl: "/images/banner-img1.png",
                bannerImageUrl: "/images/banner-product.png"
              }
            ]
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

    fetchCategoryBanners();

    fetchBannerData();
    fetchFlashSales();
    fetchBrands();
    fetchCategories();
    fetchProducts();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Animation controls
  const controls = useAnimation();
  const refs = {
    banner: useRef(null),
    flashSales: useRef(null),
    delivery: useRef(null),
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
    <button
      onClick={onClick}
      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md z-10 hover:bg-gray-600"
    >
      ◀
    </button>
  );

  const CustomNextArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md z-10 hover:bg-gray-600"
    >
      ▶
    </button>
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
    slidesToShow: 2,
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
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } }
    ]
  };

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
       // alert(selectedCategory);
        console.log(selectedCategory);
        const validCategoryIds = [
          selectedCategory._id,
          ...subCategories.map(sub => sub._id)
        ];
        return products.filter(product => 
          product.category && 
          validCategoryIds.includes(product.category.toString())
        );
      })()
    : products;

  const featuredCategory = parentCategories[0];
  const dealCategories = parentCategories.slice(1, 4);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const offers = [
    {
      id: 1,
      href: "/details/HP-ZBook-Firefly-14-G7-Laptop-Intel-Core-i7-10th-Gen-16GB-RA/PJ7278/",
      bgColor: "bg-purple-50",
      image: "https://www.ourshopee.com/ourshopee-img/ourshopee_transparant_image/640501204445465898Remove-background-project-10.png?",
      alt: "HP ZBook Firefly 14 G7 Laptop Intel Core i7 10th Gen, 16GB RAM, 256GB SSD, 14inch Touchscreen, Refurbished",
      title: "HP ZBook Firefly 14 G7 Laptop Intel Core i7 10th Gen, 16GB RAM, 256GB SSD, 14inch Touchscreen, Refurbished",
      price: "1279",
      oldPrice: "1999",
      discount: "36% OFF"
    },
    {
      id: 2,
      href: "/details/Apple-MacBook-Air-2017-133-inch-FHD-Display-Intel-Core-i5-Pr/PJ7459/",
      bgColor: "bg-green-50",
      image: "https://www.ourshopee.com/ourshopee-img/ourshopee_transparant_image/157358255933126412Remove-background-project-9.png?",
      alt: "Apple MacBook Air 2017 13.3 inch FHD Display Intel Core i5 Processor 8GB RAM 256GB SSD Storage Silver Refurbished",
      title: "Apple MacBook Air 2017 13.3 inch FHD Display Intel Core i5 Processor 8GB RAM 256GB SSD Storage Silver Refurbished",
      price: "799",
      oldPrice: "1799",
      discount: "56% OFF"
    },
    {
      id: 3,
      href: "/details/Dell-Latitude-5411-Business-Laptop-Intel-Core-i5-10th-Genera/PJ8317/",
      bgColor: "bg-amber-50",
      image: "https://www.ourshopee.com/ourshopee-img/ourshopee_transparant_image/3670529537588708Remove-background-project-20.png?",
      alt: "Dell Latitude 5411 Business Laptop, Intel Core i5-10th Generation CPU, 16GB RAM, 256GB SSD , 14 inch  Windows 11 Pro Refurbished",
      title: "Dell Latitude 5411 Business Laptop, Intel Core i5-10th Generation CPU, 16GB RAM, 256GB SSD , 14 inch  Windows 11 Pro Refurbished",
      price: "719",
      oldPrice: "899",
      discount: "20% OFF"
    },
    {
      id: 4,
      href: "/details/My-Ruky-Signature-Unisex-65ml/OO1356/",
      bgColor: "bg-pink-50",
      image: "https://www.ourshopee.com/ourshopee-img/ourshopee_transparant_image/884926333576922692OO1356.png?",
      alt: "My Ruky Signature Unisex 65ml",
      title: "My Ruky Signature Unisex 65ml",
      price: "65",
      oldPrice: "91",
      discount: "29% OFF"
    },
  ];
  
  return (
    <>
      {isLoading && (
        <div className="preloader fixed inset-0 z-[9999] flex justify-center items-center bg-white">
          <Image 
            src="/images/thumbs/bea.webp"
            alt="Loading"
            width={64}
            height={64}
            className="animate-spin"
          />
        </div>
      )}
      
      {/* <div 
        className={`relative py-4 px-4 md:px-0 lg:px-0 transition-opacity duration-300 ${
          isLoading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`} 
        ref={containerRef}
      > */}
      <div 
        className={`relative transition-opacity duration-300 ${
          isLoading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`} 
        ref={containerRef}
      >
        {/* Banner Section */}
        {/* <motion.section
          ref={refs.banner}
          initial="hidden"
          animate={isInView.banner ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-16" // Consistent bottom margin
        >
          <div className="relative rounded-[30px]">
            {isBannerLoading ? (
              <div className="p-6 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : bannerData.banner.items.length > 0 ? (
              <Slider {...settings} className="relative">
                {bannerData.banner.items.map((item) => (
                  <motion.div 
                    key={item.id} 
                    className="p-6 relative h-[500px]"
                    variants={itemVariants}
                  >
                    <div className="absolute inset-0 rounded-[30px] overflow-hidden">
                      <Image
                        src={item.bgImageUrl}
                        alt="Background"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-[30px]"
                        priority
                      />
                      <div className="absolute inset-0 bg-opacity-20 rounded-[30px]"></div>
                    </div>
                    
                    <div className="relative flex items-center h-full max-w-7xl mx-auto">
                      <div className="w-full flex flex-wrap md:flex-nowrap items-center gap-6 px-10">
                        <div className="w-full md:w-[50%] text-left relative z-10">
                          <h1 className="text-5xl font-bold text-black leading-tight drop-shadow-lg">
                            {item.title}
                          </h1>
                          <a
                            className="inline-flex items-center justify-center rounded-full gap-2 bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition shadow-lg mt-6"
                            href={item.buttonLink}
                          >
                            {item.buttonText}
                            <ShoppingCartSimple size={24} />
                          </a>
                        </div>
                        <div className="w-full md:w-[50%] flex justify-end relative z-10">
                          <Image 
                            src={item.bannerImageUrl} 
                            alt={item.title} 
                            width={500} 
                            height={300} 
                            className=""
                            priority
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </Slider>
            ) : (
              <div className="p-6 text-center">
                <p className="text-lg">No active banners available</p>
              </div>
            )}

            <div className="relative flex items-center justify-center w-full mt-10">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-40 h-16 rounded-b-full shadow-lg-new">
              </div>
              <div
                className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 flex items-center justify-center bg-blue-600 rounded-full shadow-md border-4 border-white cursor-pointer" style={{ top: "-104px" }}
                onClick={() => {
                  window.scrollTo({
                    top: window.scrollY + 500,
                    behavior: "smooth",
                  });
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-0.9 h-6 border-l-2 border-dashed border-white animate-bounce"></div>
                  <CaretDown size={25} className="text-white animate-bounce leading-none" />
                  <CaretDown size={25} className="text-white animate-bounce mt-[-18px]" />
                </div>
              </div>
            </div>
          </div>
        </motion.section> */}

        <motion.section
          ref={refs.banner}
          initial="hidden"
          animate={isInView.banner ? "visible" : "hidden"}
          variants={containerVariants}
          className="overflow-hidden pt-0 m-0 " // Make sure there's no padding at the top
        >
          <div className="relative">
            {isBannerLoading ? (
              <div className="p-6 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : bannerData.banner.items.length > 0 ? (
              bannerData.banner.items.length > 1 ? (
                <Slider {...settings} className="relative">
                  {bannerData.banner.items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="relative h-[2500px]"
                      variants={itemVariants}
                    >
                      <div className="absolute inset-0 overflow-hidden">
                        <Image
                          src={item.bgImageUrl}
                          alt="Background"
                          layout="fill"
                          objectFit="cover"
                          priority
                        />
                      </div>

                      {/* <div className="relative flex items-center h-full max-w-7xl mx-auto">
                        <div className="w-full flex flex-wrap md:flex-nowrap items-center gap-6 px-10">
                          <div className="w-full md:w-[50%] text-left relative z-10">
                            <h1 className="text-5xl font-bold text-black leading-tight drop-shadow-lg">
                              {item.title}
                            </h1>
                            <a
                              className="inline-flex items-center justify-center rounded-full gap-2 bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition shadow-lg mt-6"
                              href={item.buttonLink}
                            >
                              {item.buttonText}
                              <ShoppingCartSimple size={24} />
                            </a>
                          </div>
                          <div className="w-full md:w-[50%] flex justify-end relative z-10">
                            <Image
                              src={item.bannerImageUrl}
                              alt={item.title}
                              width={500}
                              height={300}
                              priority
                            />
                          </div>
                        </div>
                      </div> */}
                    </motion.div>
                  ))}
                </Slider>
              ) : (
                <motion.div
                  className="p-6 relative h-[500px]"
                  variants={itemVariants}
                >
                  <div className="absolute inset-0 rounded-[30px] overflow-hidden">
                    <Image
                      src={bannerData.banner.items[0].bgImageUrl}
                      alt="Background"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-[30px]"
                      priority
                    />
                    <div className="absolute inset-0 bg-opacity-20 rounded-[30px]"></div>
                  </div>
{/* 
                  <div className="relative flex items-center h-full max-w-7xl mx-auto">
                    <div className="w-full flex flex-wrap md:flex-nowrap items-center gap-6 px-10">
                      <div className="w-full md:w-[50%] text-left relative z-10">
                        <h1 className="text-5xl font-bold text-black leading-tight drop-shadow-lg">
                          {bannerData.banner.items[0].title}
                        </h1>
                        <a
                          className="inline-flex items-center justify-center rounded-full gap-2 bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition shadow-lg mt-6"
                          href={bannerData.banner.items[0].buttonLink}
                        >
                          {bannerData.banner.items[0].buttonText}
                          <ShoppingCartSimple size={24} />
                        </a>
                      </div>
                      <div className="w-full md:w-[50%] flex justify-end relative z-10">
                        <Image
                          src={bannerData.banner.items[0].bannerImageUrl}
                          alt={bannerData.banner.items[0].title}
                          width={500}
                          height={300}
                          priority
                        />
                      </div>
                    </div>
                  </div> */}
                </motion.div>
              )
            ) : (
              <div className="p-6 text-center">
                <p className="text-lg">No active banners available</p>
              </div>
            )}

            {/* Scroll Button */}
            {/* <div className="relative flex items-center justify-center w-full mt-10">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-40 h-16 rounded-b-full shadow-lg-new"></div>
              <div
                className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 flex items-center justify-center bg-blue-600 rounded-full shadow-md border-4 border-white cursor-pointer"
                style={{ top: "-104px" }}
                onClick={() => {
                  window.scrollTo({
                    top: window.scrollY + 500,
                    behavior: "smooth",
                  });
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-0.9 h-6 border-l-2 border-dashed border-white animate-bounce"></div>
                  <CaretDown size={25} className="text-white animate-bounce leading-none" />
                  <CaretDown size={25} className="text-white animate-bounce mt-[-18px]" />
                </div>
              </div>
            </div> */}
          </div>
        </motion.section>
        {/* <section style={{ backgroundColor: "#f3f4f6", padding: "40px 0" }}> */}
        <section >
          {/* <h2 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", color: "#111827", marginBottom: "24px" }}>
            Why Choose Us?
          </h2> */}
          <div
            style={{
              display: "flex",
              flexWrap: "nowrap",    // no wrapping
              justifyContent: "center",
              gap: "24px",
              //padding: "0 24px",
              maxWidth: "1440px",
              margin: "0 auto",
            }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: "1 1 0",        // allow shrinking
                  minWidth: "0",         // important for shrinking properly
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  backgroundColor: "#cfd4e1",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    padding: "12px",
                    borderRadius: "9999px",
                    fontSize: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {feature.icon}
                </div>
                <div style={{ marginLeft: "16px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginBottom: "8px" }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#374151" }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
 {/* nnnnnnnnnnnnnnnnn */}
 <div className=" px-2 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Exciting Offers</h2>
        <div className="flex gap-2">
          <button className="swiper-button-prev bg-gray-300 hover:bg-gray-400 p-2 rounded-full">
            ◀
          </button>
          <button className="swiper-button-next bg-gray-300 hover:bg-gray-400 p-2 rounded-full">
            ▶
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        slidesPerView={4}
        spaceBetween={0} // no gap between cards
        loop={true}
      >
        {offers.map((offer) => (
          <SwiperSlide key={offer.id}>
            <div className={`card rounded-lg ${offer.bgColor} shadow-sm`}>
              <div className="flex items-center">
                <div className="w-1/3 p-2">
                  <img
                    src={offer.image}
                    alt={offer.alt}
                    className="w-full object-contain pl-1"
                  />
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
                    <span className="text-sm">04h : 43m : 59s</span>
                  </div>
                  <div className="text-sm line-clamp-2">{offer.title}</div>
                  <div className="mt-1">
                    <span className="text-sm font-medium text-gray-700">AED</span>
                    <span className="ml-1 font-semibold">{offer.price}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-sm font-medium text-gray-700 line-through whitespace-nowrap">
                      {offer.oldPrice}
                    </div>
                    <div className="text-sm font-semibold text-green-600 bg-white rounded px-2 whitespace-nowrap">
                      {offer.discount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
    {/* category banner */}
    <div className="px-2 sm:px-2 lg:px-2">
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
        {/* Flash Sales Section */}
        {/* <motion.section 
          ref={refs.flashSales}
          initial="hiddenDown"
          animate={isInView.flashSales ? "visible" : "hiddenDown"}
          variants={sectionVariants}
          id="flash-sales-section" 
          className="mb-16" // Consistent bottom margin
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="section-heading flex justify-between items-center mb-8">
              <h5 className="text-2xl font-bold">Flash Sales Today</h5>
              <a href="/shop" className="text-sm font-medium text-gray-700 hover:underline">
                View All Deals
              </a>
            </motion.div>

            {isFlashSalesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <motion.div variants={itemVariants}>
                <Slider {...flashSalesSettings} className="flash-sales-slider">
                  {flashSalesData.map((item) => (
                    <div key={item.id} className="px-2">
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="relative p-6 rounded-lg shadow-lg h-full min-h-[250px] flex items-center overflow-hidden"
                        style={{ 
                          backgroundImage: `url(${item.bgImage})`, 
                          backgroundSize: "cover", 
                          backgroundPosition: "center" 
                        }}
                      >
                        <div className="relative z-10 w-full flex">
                          <div className="w-1/2 flex justify-center items-center">
                            <Image
                              src={item.productImage}
                              alt={item.title}
                              width={180}
                              height={180}
                              className="object-contain max-h-[180px]"
                            />
                          </div>

                          <div className="w-1/2 flex flex-col justify-center items-start pl-4">
                            <h6 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h6>
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
        </motion.section> */}

<motion.section 
  ref={refs.flashSales}
  initial="hiddenDown"
  animate={isInView.flashSales ? "visible" : "hiddenDown"}
  variants={sectionVariants}
  id="flash-sales-section" 
  className=""
>
  {flashSalesData.filter(item => item.bgImage && item.productImage).length > 0 && (
    <div className="px-2 py-4">
      <motion.div variants={itemVariants} className="section-heading flex justify-between items-center mb-4">
        <h5 className="text-2xl font-bold">Flash Sales Today</h5>
        <a href="/shop" className="text-sm font-medium text-gray-700 hover:underline">
          View All Deals
        </a>
      </motion.div>

      {isFlashSalesLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        flashSalesData.length === 1 && flashSalesData[0].bgImage && flashSalesData[0].productImage ? (
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
                <div className="w-full md:w-1/2 flex justify-center items-center">
                  <Image
                    src={flashSalesData[0].productImage}
                    alt={flashSalesData[0].title}
                    width={180}
                    height={180}
                    className="object-contain max-h-[180px]"
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
            <Slider {...flashSalesSettings} className="flash-sales-slider">
              {flashSalesData.filter(item => item.bgImage && item.productImage).map((item) => (
                <div key={item.id} className="px-2">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="relative p-6 rounded-lg shadow-lg h-full min-h-[250px] flex items-center overflow-hidden"
                    style={{ 
                      backgroundImage: `url(${item.bgImage})`, 
                      backgroundSize: "cover", 
                      backgroundPosition: "center" 
                    }}
                  >
                    <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-center">
                      <div className="w-full md:w-1/2 flex justify-center items-center">
                        <Image
                          src={item.productImage}
                          alt={item.title}
                          width={180}
                          height={180}
                          className="object-contain max-h-[180px]"
                        />
                      </div>

                      <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center mt-4 md:mt-0 md:pl-4">
                        <h6 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h6>
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
        )
      )}
    </div>
  )}
</motion.section>


        {/* Brands Section */}
        <motion.section 
          ref={refs.delivery}
          initial={scrollDirection === 'down' ? "hiddenDown" : "hiddenUp"}
          animate={isInView.delivery ? "visible" : scrollDirection === 'down' ? "hiddenDown" : "hiddenUp"}
          variants={sectionVariants}
          className="mb-2 bg-gray-100 rounded-[23px] py-8" // Consistent bottom margin and padding
        >
          <div className="mx-auto p-1">
          <motion.div variants={containerVariants} className="rounded-lg">
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-4">
              <h5 className="text-lg font-semibold">Shop by Brands</h5>
              <a href="/shop" className="text-sm font-medium text-gray-700 hover:text-main-600">
                View All Brands
              </a>
            </motion.div>

            {isBrandsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <motion.div variants={itemVariants}>
                <Slider {...brandSettings} className="brand-slider">
                  {brands.map((brand) => (
                    <motion.div
                      key={brand.id}
                      className="p-4 flex justify-center items-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="w-28 h-28 rounded-full bg-white shadow flex items-center justify-center overflow-hidden">
                        <Image
                          src={`/uploads/Brands/${brand.image}`}
                          alt={brand.brand_name || "Brand Logo"}
                          width={100}
                          height={100}
                          className="object-contain w-20 h-20"
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

        {/* Recommended Products Section */}
      

        <section className="mb-2"> {/* Consistent bottom margin */}
          <div className=" px-2 py-4">
            <h2 className="text-2xl font-bold mb-8">Recommended for you</h2>

            {/* Category Filter with Arrows */}
            <div className="relative flex items-center mb-8">
              {/* <button
                onClick={scrollLeft}
                className="z-10"
                style={{ position: "absolute", right: "30px", bottom: "60px" }}
              >
                ◀
              </button> */}

              <div ref={categoryRef} className="flex space-x-4 overflow-x-hidden scroll-smooth w-full ">
                {/* <button
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                    !selectedCategory ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All Products
                </button> */}
                {parentCategories.map((category) => (
                  <button
                    key={category._id}
                    className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                      selectedCategory?.category_slug === category.category_slug
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.category_name}
                  </button>
                ))}
              </div>

              {/* <button
                onClick={scrollRight}
                className="z-10"
                style={{ position: "absolute", right: "4px", bottom: "60px" }}
              >
                ▶
              </button> */}
            </div>

            {/* Product List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center font-bold text-gray-500 text-lg py-10">
                No Product Found for this Category..!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="group flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-blue-200 relative"
                  >
                    <div className="relative h-52 w-full bg-white overflow-hidden flex justify-center">
                      {product.special_price && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                          {Math.round(((product.price - product.special_price) / product.price) * 100)}% OFF
                        </span>
                      )}

                      <div className="absolute top-2 right-2 z-10  hover:text-red-500">
                        <ProductCard productId={product._id} />
                      </div>
                      <div className="mt-8">
                        <img
                          alt={product.images[0]}
                          loading="lazy"
                          width={160}
                          height={160}
                          decoding="async"
                          className="object-contain transition-transform duration-500 group-hover:scale-105 max-h-44"
                          src={`/uploads/products/${product.images?.[0]}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                          }}
                          style={{ width: '15rem', height: '13rem' }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col flex-grow p-4">
                      <Link href={`/product/${product.slug || product._id}`}>
                        <h3 className="text-md font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem] cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-auto mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">
                            Rs. {product.special_price || product.price}
                          </span>
                          {product.special_price && (
                            <span className="text-gray-500 line-through text-sm">
                              MRP: {product.price}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <Addtocart productId={product._id} />
                        <a
                          href={`https://wa.me/?text=Check this out: ${product.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-300"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.773.736 5.368 2.009 7.629L2 30l6.565-2.643A13.254 13.254 0 0016.003 29.333C23.36 29.333 29.333 23.36 29.333 16c0-7.36-5.973-13.333-13.33-13.333zm7.608 18.565c-.32.894-1.87 1.749-2.574 1.865-.657.104-1.479.148-2.385-.148-.55-.175-1.256-.412-2.162-.812-3.8-1.648-6.294-5.77-6.49-6.04-.192-.269-1.55-2.066-1.55-3.943 0-1.878.982-2.801 1.33-3.168.346-.364.75-.456 1.001-.456.25 0 .5.002.719.013.231.01.539-.088.845.643.32.768 1.085 2.669 1.18 2.863.096.192.16.423.03.683-.134.26-.2.423-.39.65-.192.231-.413.512-.589.689-.192.192-.391.401-.173.788.222.392.986 1.625 2.116 2.636 1.454 1.298 2.682 1.7 3.075 1.894.393.192.618.173.845-.096.23-.27.975-1.136 1.237-1.527.262-.392.524-.32.894-.192.375.13 2.35 1.107 2.75 1.308.393.205.656.308.75.48.096.173.096 1.003-.224 1.897z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

             {/* Hot Deals Section - Showing only parent categories */}
            <motion.section className="hot-deals pt-15 mb-10 bg-gray-100">
              <div className=" px-2 py-4">
                {/* Section Header */}
                <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                  <h5 className="text-2xl font-bold">Hot Deals Today</h5>
                  <div className="flex items-center gap-4">
                    <a
                      href="/shop"
                      className="text-sm font-medium text-gray-700 hover:text-green-600 hover:underline"
                    >
                      View All Deals
                    </a>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={scrollLeft}
                        className="p-2 border border-gray-300 rounded-full hover:bg-green-600 hover:text-white transition"
                      >
                        <FiChevronLeft size={18} />
                      </button>
                      <button
                        onClick={scrollRight}
                        className="p-2 border border-gray-300 rounded-full hover:bg-green-600 hover:text-white transition"
                      >
                        <FiChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row gap-6">
                  {/* Left Tab */}
                  <div className="w-1/4 min-w-[250px] bg-green-600 text-white p-6 rounded-lg flex flex-col justify-center items-center">
                    <h3 className="text-3xl font-bold mb-7 text-center">Air Conditioner</h3>
                    <div className="w-full h-40 flex items-center justify-center my-4">
                      <Image
                        src="/user/large app.jpg"
                        alt="Air Conditioner"
                        width={100}
                        height={100}
                        className="object-contain"
                      />
                    </div>
                    <Link
                      href="/category/large-appliances"
                      className="mt-4 bg-white text-green-600 font-semibold px-4 py-2 rounded hover:bg-gray-100"
                    >
                      Shop Now →
                    </Link>
                  </div>

                  {/* Scrollable Products */}
                  <div className="flex-1 overflow-hidden">
                    <div
                      ref={scrollContainerRef}
                      className="flex gap-6 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
                    >
                      {products
                        .filter((product) => {
                          const productCategory = categories.find(
                            (cat) => cat._id === product.sub_category
                          );
                          return (
                            productCategory &&
                            (
                              productCategory.category_name
                                .toLowerCase()
                                .includes("air conditioner") ||
                              (
                                productCategory.parentid !== "none" &&
                                categories.some(
                                  (parentCat) =>
                                    parentCat._id === productCategory.parentid &&
                                    parentCat.category_name
                                      .toLowerCase()
                                      .includes("air conditioner")
                                )
                              )
                            )
                          );
                        })
                        .map((product) => (
                          <div
                            key={product._id}
                            className="flex-shrink-0 w-[250px] snap-start"
                          >
                           
                              <motion.div
                                whileHover={{ y: -5 }}
                                className="relative border rounded-lg shadow p-4 transition-all duration-300 hover:border-blue-500 hover:shadow-lg group bg-white h-full"
                              >
                                {product.special_price && (
                                  <div className="absolute top-3 left-3 z-10">
                                    <span className="px-2 py-1 text-xs text-white bg-red-500 rounded">
                                      {Math.round(
                                        ((product.price - product.special_price) /
                                          product.price) *
                                          100
                                      )}
                                      % OFF
                                    </span>
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 z-10  hover:text-red-500">
                                  <ProductCard productId={product._id} />
                                </div>
                                {/* <div className="absolute top-3 right-3 flex gap-2 z-10">
                                  <button className="p-1 rounded-full bg-white shadow hover:text-red-500">
                                    ❤️
                                  </button>
                                </div> */}
                                <img
                                  src={`/uploads/products/${product.images?.[0]}` || "/placeholder.jpg"}
                                  alt={product.name || "Product image"}
                                  className="w-full h-48 object-contain mt-2"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/placeholder.jpg";
                                  }}
                                />
                                 <Link href={`/product/${product.slug || product._id}`}>
                                <h3 className="mt-3 font-semibold group-hover:text-blue-600 line-clamp-2">
                                  {product.name}
                                </h3>
                                </Link>
                                <p className="mt-2 text-lg font-bold text-blue-600">
                                  ${product.special_price || product.price}
                                  {product.special_price && (
                                    <span className="line-through text-gray-400 text-sm ml-1">${product.price}</span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ⭐ {product.rating || "N/A"} (
                                  {product.reviews ? product.reviews.toLocaleString() : "0"})
                                </p>
                                <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md w-full hover:bg-blue-600 transition">
                                  Add To Cart
                                </button>
                              </motion.div>
                          
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .hide-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
           </motion.section>

      </div>
    </>
  );
}