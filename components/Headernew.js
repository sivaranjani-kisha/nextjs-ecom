// components/Header.jsx
'use client';

import { motion } from 'framer-motion';
import Link from "next/link";
import Image from 'next/image';

import { FiSearch, FiMapPin, FiHeart, FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
import { FaBars, FaShoppingBag } from "react-icons/fa";
import { FaHeart, FaShoppingCart, FaSearch } from 'react-icons/fa';
import { IoLogOut } from "react-icons/io5";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState, useRef, useEffect } from 'react';
import { FaCircleChevronLeft, FaCircleChevronRight, FaLocationDot } from "react-icons/fa6";
import { useCart } from '@/context/CartContext';
import { useWishlist } from "@/context/WishlistContext";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

import { Navigation } from 'swiper/modules';


const Header = () => {
const [category, setCategory] = useState('All Categories');
const { wishlistCount } = useWishlist();
const { cartCount, updateCartCount } = useCart();
const dropdownRef = useRef(null);
const [activeTab, setActiveTab] = useState('login');
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [showMenu, setShowMenu] = useState(false);
const [userData, setUserData] = useState(null);
const [hasMounted, setHasMounted] = useState(false);
const [dropdownOpen, setDropdownOpen] = useState(false);
const [selectedCategory, setSelectedCategory] = useState("All Categories");
const [searchQuery, setSearchQuery] = useState("");
const [categories, setCategories] = useState([]);
const [showAuthModal, setShowAuthModal] = useState(false);

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

  const [formData, setFormData] = useState({
      name: '',
      email: '',
      mobile: '',
      password: ''
    });
     const [loadingAuth, setLoadingAuth] = useState(false);
     const [formError, setFormError] = useState('');
     const [error, setError] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError('');
    setLoadingAuth(true);

    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      setUserData(data.user);
      setShowAuthModal(false);
      setFormData({
        name: '',
        email: '',
        mobile: '',
        password: ''
      });
      
      // Update cart count after login
      const cartResponse = await fetch('/api/cart/count', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        updateCartCount(cartData.count);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAuth(false);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
    updateCartCount(0); // Reset cart count on logout
  };
  
   
  
  return (
    <header>
      {/* Section 1: Blue welcome bar with motion text */}
      {/* <div className="bg-white text-customBlue px-4 py-1 overflow-hidden relative"> */}
      <div className="bg-white text-orange-500 px-4 py-1 overflow-hidden relative">

      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ repeat: Infinity, duration: 60, ease: 'linear' }} // slower speed
        className="flex items-center space-x-4 whitespace-nowrap"
      >
          <img src="/user/bea.png" alt="Logo" className="h-auto" width={35} 
                  height={18} />
          <p className="font-medium">
            Welcome to our store! Enjoy the best deals and quality products.
          </p>
     </motion.div>

      </div>


      {/* Section 2: White section with logo, categories and buttons */}
     <div className=" bg-customBlue px-6 py-2 flex justify-between items-center flex-wrap gap-6">
      <div className=" flex items-center gap-6">
        {/* Logo with added margin */}
        <div className="mr-12 bg-white p-2 rounded-lg">
          <Link href="/index" className="mx-auto">
          <img src="/user/bea.png" alt="Logo" className="h-auto" width={60} height={30} />
          </Link>
        </div>
        {/* Search Bar Section */}
        <div className="flex flex-1 w-[41rem] items-center bg-white rounded-lg shadow overflow-hidden">
          {/* Dynamic Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 border-r border-gray-300 outline-none"
          >
            <option value="All Categories">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.category_name}>
                {cat.category_name}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 outline-none"
          />

          {/* Search Button */}
          <button
            className="px-4 text-customBlue"
            onClick={() => {
              console.log("Searching for:", searchQuery, "in", selectedCategory);
              // You can trigger a search API here
            }}
          >
            <FaSearch />
          </button>
        </div>
      </div>
      <div className="mr-10 flex items-center gap-5">
          {/* Location */}
          <Link href="/location" className="flex items-center relative">
                    <FaLocationDot size={22} className="text-white" />
                    <span className="ml-1 font-bold text-sm text-white">Location</span>
                  </Link>

                  {/* Wishlist */}
                  <Link href="/wishlist" className="flex items-center relative">
                    <FaHeart size={22} className="text-white" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white px-1 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                    <span className="ml-1 font-bold text-sm text-white">Wishlist</span>
                  </Link>

                  {/* Cart */}
                  <Link href="/cart" className="flex items-center relative  px-4">
                    <FaShoppingCart size={22} className="text-white" />
                    <span className="absolute top-[-5px] right-[-8px] text-xs bg-white text-customBlue rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                    <span className="ml-1 font-bold text-sm text-white">Cart</span>
                  </Link>
        {/* User Account */}
        <div className="relative" ref={dropdownRef}>
                    {isLoggedIn ? (
                      <>
                        <button
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="flex items-center text-black focus:outline-none"
                        >
                          <FiUser size={22} className="text-white" />
                          <span className="ml-1 font-bold text-sm text-white">
                            Hi, {userData?.username || userData?.name || "User"}
                          </span>
                        </button>

                        {dropdownOpen && (
                          <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl z-50 transition-all">
                            {/* Top Arrow */}
                            <div className="absolute -top-2 right-4 w-4 h-4 bg-white transform rotate-45 shadow-md"></div>

                            <div className="py-2 px-2">
                              <Link
                                href="/order"
                                className="flex items-center gap-3 px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                              >
                                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-customBlue text-white">
                                  <FaShoppingBag className="w-5 h-5" />
                                </span>
                                My Orders
                              </Link>

                              <hr className="my-2 border-gray-200" />

                              <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full text-left px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-red-50 transition-colors"
                              >
                                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-customBlue text-white">
                                  <IoLogOut className="w-5 h-5" />
                                </span>
                                Logout
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="flex items-center text-black"
                      >
                        <FiUser size={22} className="text-white" />
                        <span className="ml-1 font-bold text-sm text-white">Sign In</span>
                      </button>
                    )}
                  </div>
      </div>
    </div>
 {/* <div className="bg-white py-1 relative border-b border-gray-200"></div> */} 

 {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-96 max-w-full relative">
            <button 
              onClick={() => {
                setShowAuthModal(false);
                setFormError('');
                setError('');
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>

            <div className="flex gap-4 mb-6 border-b">
              <button
                className={`pb-2 px-1 ${
                  activeTab === 'login' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>
              <button
                className={`pb-2 px-1 ${
                  activeTab === 'register'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('register')}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {activeTab === 'register' && (
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {activeTab === 'register' && (
                <input
                  type="tel"
                  placeholder="Mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              )}
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
              
              {(formError || error) && (
                <div className="text-red-500 text-sm">
                  {formError || error}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingAuth}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors duration-200"
              >
                {loadingAuth ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      )}    
</header>
  );
};

export default Header;
