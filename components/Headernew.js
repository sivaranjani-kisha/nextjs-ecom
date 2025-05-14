// components/Header.jsx
'use client';

import { motion } from 'framer-motion';
import Link from "next/link";
import Image from 'next/image';

import { FiSearch, FiMapPin, FiHeart, FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
import { FaBars, FaShoppingBag } from "react-icons/fa";
import { FaHeart, FaShoppingCart, FaSearch } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState, useRef, useEffect } from 'react';
import { IoLogOut } from "react-icons/io5";
import { FaCircleChevronLeft, FaCircleChevronRight, FaLocationDot } from "react-icons/fa6";
import { useCart } from '@/context/CartContext';
import { useWishlist } from "@/context/WishlistContext";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { useRouter } from 'next/navigation';

import { Navigation } from 'swiper/modules';


const Header = () => {
const [category, setCategory] = useState('All Categories');
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
 // Toggle mobile menu
 const toggleMobileMenu = () => {
  setIsMobileMenuOpen(!isMobileMenuOpen);
};

// Close mobile menu when clicking outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsMobileMenuOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);


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

  // ... (keep all your existing state declarations)
  const router = useRouter(); // Initialize the router

  // Add this search handler function
  const handleSearch = () => {
    if (!searchQuery.trim()) return; // Don't search if empty
    
    // Create URL with search parameters
    const searchParams = new URLSearchParams();
    searchParams.append('query', searchQuery.trim());
    if (selectedCategory !== 'All Categories') {
      searchParams.append('category', selectedCategory);
    }
    
    // Navigate to search page with query parameters
    router.push(`/search?${searchParams.toString()}`);
  };

  // Modify the search button to use the handler
  // Also make the search work when pressing Enter in the input field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const messages = [
  "Welcome to our store! Enjoy the best deals and quality products."
];
 const [current, setCurrent] = useState(0);

  // Toggle message index every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length);
    }, 20000); // Duration matches animation
    return () => clearInterval(interval);
  }, []);

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
   <header className="sticky top-0 z-50">
      {/* Top Announcement Bar */}
 <div className="bg-white text-orange-500 px-4 py-1 overflow-hidden relative w-full">
      <div className="relative w-full overflow-hidden h-8 flex items-center">
        <motion.div
          key={current} // Important to reset animation when content changes
          initial={{ x: '100%' }}
          animate={{ x: '-100%' }}
          transition={{
            ease: 'linear',
            duration: 20,
          }}
          className="absolute whitespace-nowrap flex items-center space-x-2 pr-4"
        >
          <img src="/user/bea.png" alt="Logo" className="h-4 w-auto" />
          <p className="font-medium text-xs sm:text-sm whitespace-nowrap">
            {messages[current]}
          </p>
        </motion.div>
      </div>
    </div>


      {/* Main Header */}
      <div className="bg-customBlue px-4 sm:px-6 md:px-6 py-2 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          {/* Mobile Menu Button (Hidden on desktop) */}
          <div className="sm:hidden flex items-center justify-center w-full relative">
            <button onClick={toggleMobileMenu} className="text-white absolute left-0">
              {isMobileMenuOpen ? <FiX size={24} /> : <FaBars size={20} />}
            </button>
            <Link href="/" className="bg-white p-1 rounded-lg mx-auto">
              <img src="/user/bea.png" alt="Logo" className="h-auto" width={40} height={20} />
            </Link>
          </div>

          {/* Logo (Hidden on mobile) */}
          <div className="hidden sm:block mr-12 bg-white p-2 rounded-lg">
           <Link href="/index" className="mx-auto">
          <img src="/user/bea.png" alt="Logo" className="h-auto" width={60} height={30} />
          </Link>
          </div>

          {/* Search Bar (Hidden on mobile - will show in mobile menu) */}
          <div className="hidden sm:flex flex-1 max-w-xl items-center bg-white rounded-lg shadow overflow-hidden">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm text-gray-700 bg-gray-100 border-r border-gray-300 outline-none"
            >
              <option value="All Categories">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.category_name}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button
              className="px-3 text-customBlue"
              onClick={handleSearch}
            >
              <FaSearch />
            </button>
          </div>

          {/* Icons Group */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Button (Hidden on desktop) */}
            <button 
              onClick={toggleMobileMenu}
              className="sm:hidden text-white"
            >
              <FiSearch size={20} />
            </button>

            {/* Location (Hidden on mobile) */}
            <Link href="/location" className="hidden sm:flex items-center relative">
              <FaLocationDot size={18} className="text-white" />
              <span className="ml-1 font-bold text-xs sm:text-sm text-white hidden lg:inline">Location</span>
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" className="flex items-center relative p-1 sm:p-0">
              <FaHeart size={18} className="text-white" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-white text-customBlue rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
              <span className="ml-1 font-bold text-xs sm:text-sm text-white hidden lg:inline">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="flex items-center relative p-1 sm:p-0 sm:px-2">
              <FaShoppingCart size={18} className="text-white" />
              <span className="absolute -top-1 -right-1 text-[10px] bg-white text-customBlue rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
              <span className="ml-1 font-bold text-xs sm:text-sm text-white hidden lg:inline">Cart</span>
            </Link>

            {/* User Account */}
            <div className="relative" ref={dropdownRef}>
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center text-black focus:outline-none p-1 sm:p-0"
                  >
                    <FiUser size={18} className="text-white" />
                    <span className="ml-1 font-bold text-xs sm:text-sm text-white hidden lg:inline">
                      Hi, {userData?.username || userData?.name || "User"}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 sm:w-56 bg-white rounded-xl shadow-xl z-50 transition-all">
                      <div className="py-2 px-2">
                        <Link
                          href="/order"
                          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        >
                          <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-customBlue text-white">
                            <FaShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                          </span>
                          My Orders
                        </Link>

                        <hr className="my-2 border-gray-200" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 sm:gap-3 w-full text-left px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-red-50 transition-colors"
                        >
                          <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-customBlue text-white">
                            <IoLogOut className="w-3 h-3 sm:w-4 sm:h-4" />
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
                  className="flex items-center text-black p-1 sm:p-0"
                >
                  <FiUser size={18} className="text-white" />
                  <span className="ml-1 font-bold text-xs sm:text-sm text-white hidden lg:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu (Hidden on desktop) */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white mt-2 p-4 rounded-lg shadow-lg">
            {/* Mobile Search Bar */}
            <div className="flex items-center bg-gray-100 rounded-lg shadow overflow-hidden mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs text-gray-700 bg-white border-r border-gray-300 outline-none"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.category_name}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 text-sm outline-none"
              />
              <button
                className="px-3 text-customBlue"
                onClick={handleSearch}
              >
                <FaSearch />
              </button>
            </div>

            {/* Mobile Menu Links */}
            <div className="space-y-3">
              <Link href="/location" className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-100">
                <FaLocationDot className="mr-2 text-customBlue" />
                Location
              </Link>
              <Link href="/wishlist" className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-100">
                <FaHeart className="mr-2 text-customBlue" />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="ml-auto bg-customBlue text-white text-xs px-2 py-1 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-100">
                <FaShoppingCart className="mr-2 text-customBlue" />
                Cart
                {cartCount > 0 && (
                  <span className="ml-auto bg-customBlue text-white text-xs px-2 py-1 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              {isLoggedIn ? (
                <>
                  <Link href="/order" className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-100">
                    <FaShoppingBag className="mr-2 text-customBlue" />
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center text-gray-700 p-2 rounded hover:bg-gray-100"
                  >
                    <IoLogOut className="mr-2 text-customBlue" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center text-gray-700 p-2 rounded hover:bg-gray-100"
                >
                  <FiUser className="mr-2 text-customBlue" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>

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
