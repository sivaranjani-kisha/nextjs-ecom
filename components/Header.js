"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { FiSearch, FiMapPin, FiHeart, FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Logout from "@/components/Logout";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from '@/context/CartContext';

export default function Header() {
  const scrollRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const { wishlistCount } = useWishlist();
  const { cartCount, updateCartCount } = useCart();
  const intervalRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth / 2;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const startAutoScroll = () => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    intervalRef.current = setInterval(() => {
      scrollContainer.scrollBy({ left: 1, behavior: 'smooth' });
      if (
        scrollContainer.scrollLeft + scrollContainer.clientWidth >=
        scrollContainer.scrollWidth
      ) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, 20);
  };

  const stopAutoScroll = () => {
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories/get');
        const data = await response.json();
        const parentCategories = data.filter(category => category.parentid === "none" && category.status === "Active");
        setCategories(parentCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
  
    const scrollInterval = setInterval(() => {
      if (
        scrollContainer.scrollLeft + scrollContainer.clientWidth >=
        scrollContainer.scrollWidth
      ) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainer.scrollBy({ left: 150, behavior: 'smooth' });
      }
    }, 3000);
  
    return () => clearInterval(scrollInterval);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
  };

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/cart/count', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          updateCartCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch cart count:', error);
      }
    };
  
    fetchCartCount();
  }, [updateCartCount]);

  return (
    <header className="w-full">
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-white text-black border-b border-gray-200">
        <div className="container mx-auto px-2 py-2 flex items-center justify-between">
          {/* Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Logo - Centered */}
          <Link href="/index" className="mx-auto">
            <Image src="/user/bea.png" alt="Marketpro" width={60} height={30} className="h-auto" />
          </Link>

          {/* Icons - Search, Wishlist, Cart */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2"
            >
              <FiSearch size={20} />
            </button>
            
            <Link href="/wishlist" className="relative p-2">
              <FiHeart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            
            <Link href="/cart" className="relative p-2">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 text-xs bg-customBlue text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar - appears when toggled */}
        {showSearch && (
          <div className="px-3 pb-3">
            <div className="flex items-center border border-gray-300 rounded-full px-3 bg-white">
              <input
                type="text"
                placeholder="Search for products..."
                className="px-4 py-2 outline-none w-full text-black placeholder:text-gray-400"
              />
              <button className="bg-customBlue text-white p-2 rounded-full">
                <FiSearch size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white z-50 shadow-lg border-t border-gray-200">
            <div className="container mx-auto px-4 py-3">
              {/* User Section */}
              <div className="pb-3 border-b border-gray-200">
                {isLoggedIn ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <FiUser size={18} />
                    </div>
                    <div>
                      <p className="font-medium">Hi, {userData?.username || userData?.name || 'User'}</p>
                      <Link href="/account" className="text-sm text-blue-500">My Account</Link>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <FiUser size={18} />
                    </div>
                    <span className="font-medium">Sign In / Register</span>
                  </button>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="py-3 border-b border-gray-200">
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="block py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                  </li>
                  <li>
                    <Link href="/locator" className="block py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center">
                        <FiMapPin className="mr-2" /> Location
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link href="/wishlist" className="block py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center">
                        <FiHeart className="mr-2" /> Wishlist
                        {wishlistCount > 0 && (
                          <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                  {isLoggedIn && (
                    <>
                      <li>
                        <Link href="/orders" className="block py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                      </li>
                      <li>
                        <button 
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="block py-2 font-medium text-left w-full"
                        >
                          Logout
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </nav>

              {/* Categories Section */}
              <div className="py-3">
                <h3 className="font-bold text-lg mb-2">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 animate-pulse rounded"></div>
                    ))
                  ) : (
                    categories.slice(0, 6).map(category => (
                      <Link
                        key={category._id}
                        href={`/category/${category.category_slug}`}
                        className="block py-2 px-3 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {category.category_name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        {/* Main Header */}
        <div className="relative py-2 border-b border-gray-300 bg-white text-black">
          <div className="container mx-auto flex items-center justify-between px-4">
            {/* Logo */}
            <Link href="/index">
              <Image src="/user/bea.png" alt="Marketpro" width={70} height={30} className="h-auto" />
            </Link>

            {/* Search Bar & Location */}
            <div className="flex-1 flex justify-center items-center space-x-10">
              <div className="flex items-center border border-gray-300 rounded-full px-3 bg-white">
                <input
                  type="text"
                  placeholder="Search for a product or brand"
                  className="px-4 py-2 outline-none w-72 text-black placeholder:text-gray-400"
                />
                <button className="bg-customBlue text-white p-2 rounded-full">
                  <FiSearch size={18} />
                </button>
              </div>

              {/* Location */}
              <Link href="/locator" className="flex items-center relative px-2">
                <FiMapPin size={22} className="text-black" />
                <span className="ml-2 font-bold">Location</span>
              </Link>

              {/* Wishlist */}
              <Link href="/wishlist" className="flex items-center relative px-4">
                <FiHeart size={22} className="text-black" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white px-1 rounded-full">
                    {wishlistCount}
                  </span>
                )}
                <span className="ml-2 font-bold">Wishlist</span>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="flex items-center relative px-4">
                <FiShoppingCart size={22} className="text-black" />
                <span className="absolute top-[-5px] right-[-8px] text-xs bg-customBlue text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
                <span className="ml-2 font-bold">Cart</span>
              </Link>
            </div>

            {/* User Account */}
            <div className="flex items-center space-x-10">
              {isLoggedIn ? (
                <div className="relative group">
                  <button className="flex items-center text-black">
                    <FiUser size={22} className="text-black" />
                    <span className="ml-2 font-bold">
                      Hi, {userData?.username || userData?.name || 'User'}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                    <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Account
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Orders
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center text-black"
                >
                  <FiUser size={22} className="text-black" />
                  <span className="ml-2 font-bold">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Bar (visible on all screens) */}
      <div className="overflow-hidden bg-customBlue text-white text-xs py-4 relative" onMouseEnter={stopAutoScroll} onMouseLeave={startAutoScroll}>
        <button
          className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white text-customBlue p-2 rounded-full shadow-md z-10"
          onClick={() => scroll("left")}
        >
          <ChevronLeft size={20} />
        </button>

        <div
          style={{ overflowX: "auto", whiteSpace: "nowrap" }}
          ref={scrollRef}
          className="container mx-auto flex overflow-x-auto scroll-smooth scrollbar-hide gap-4 px-6 header-css"
        >
          {loading ? (
            <div className="flex space-x-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex flex-col items-center min-w-[100px]">
                  <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded mt-2 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            categories.map((category) => (
              <Link 
                key={category._id} 
                href={`/category/${category.category_slug}`}
                className="flex flex-col items-center min-w-[100px]"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                  {category.image ? (
                    <Image 
                      src={category.image} 
                      alt={category.category_name} 
                      width={40} 
                      height={40} 
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  )}
                </div>
                <span className="text-xs font-medium mt-1 truncate w-[90px] text-center">
                  {category.category_name}
                </span>
              </Link>
            ))
          )}
        </div>

        <button
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-customBlue p-2 rounded-full shadow-md z-10"
          onClick={() => scroll("right")}
        >
          <ChevronRight size={20} />
        </button>
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
}