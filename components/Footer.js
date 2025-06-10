"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { FiMail, FiPhone } from "react-icons/fi";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { IoReload, IoStorefront, IoCardOutline, IoShieldCheckmark } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import Image from "next/image";
import { MdAccountCircle } from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [groupedCategories, setGroupedCategories] = useState({ main: [], subs: {} });
  
  // Auth state
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories/get");
        const data = await res.json();
        
        if (data) {
          setCategories(data);
          const grouped = groupCategories(data);
          setGroupedCategories(grouped);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
    checkAuthStatus();
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
const capitalizeFirstLetter = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);
  const groupCategories = (categories) => {
    const grouped = { main: [], subs: {} };
    
    const mainCats = categories.filter(cat => cat.parentid === "none");
    
    mainCats.forEach(mainCat => {
      const subs = categories.filter(cat => cat.parentid === mainCat._id.toString());
      grouped.main.push(mainCat);
      grouped.subs[mainCat._id] = subs;
    });
    
    return grouped;
  };

  return (
    <>
      <footer className="bg-[#2e2a2a] text-gray-300 text-sm py-5">
       <div className="bg-[#2e2a2a] text-gray-400  border-white ">
  <div className="w-full flex justify-center">
    <div className="w-full container mx-auto px-3  grid grid-cols-1 md:grid-cols-3 gap-16 justify-between">
      
      {/* Corporate Office */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold text-lg mb-4">Corporate Office</h3>
        <p>26/1 Drr. Alagappa Chettiyar Rd, Tatabad, Near Kovai Scan Centre, Coimbatore-641012</p>
        <hr className="border-gray-600 my-3" />
        <div className="flex items-center gap-2">
          <FiPhone /> <span>9842344323</span>
        </div>
        <hr className="border-gray-600 my-3" />
        <div className="flex items-center gap-2">
          <FiMail /> <span>customercare@bharatelectronics.in</span>
        </div>
        <hr className="border-gray-600 my-3" />
        <p><strong>Business Hours:</strong> 09:30AM - 09:30 PM (Mon to Sun)</p>
      </div>

      {/* My Account & Policy */}
      <div className="flex flex-col space-y-6 md:mx-auto">
        <div>
          <h3 className="text-white font-semibold text-lg mb-4">My Account</h3>
          <ul className="space-y-2">
            {isLoggedIn ? (
              <>
                <li>
                  <Link href="/order" className="hover:underline hover:text-white flex items-center gap-2">
                    <FaShoppingBag /> My Orders
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="hover:underline hover:text-white flex items-center gap-2"
                  >
                    <IoLogOut /> Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="hover:underline hover:text-white"
                >
                  Sign In / Register
                </button>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg mb-4">Policy</h3>
          <ul className="space-y-2">
            <li><Link href="/privacypolicy" className="hover:underline hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/shipping" className="hover:underline hover:text-white">Shipping Policy</Link></li>
            <li><Link href="/terms-and-condition" className="hover:underline hover:text-white">Terms and Conditions</Link></li>
            <li><Link href="/cancellation-refund-policy" className="hover:underline hover:text-white">Cancellation and Refund Policy</Link></li>
          </ul>
        </div>
      </div>

      {/* Company & Social Media */}
      <div className="md:ml-12">
        <div className="mb-8">
          <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
          <ul className="space-y-2">
            <li><Link href="/aboutus" className="hover:underline hover:text-white">About Us</Link></li>
            <li><Link href="/profile" className="hover:underline hover:text-white">Contact Us</Link></li>
            <li><Link href="/blog" className="hover:underline hover:text-white">Blogs</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg mb-4">Connect With Us</h3>
          <div className="flex space-x-4">
            <Link href="#"><FaWhatsapp className="text-xl text-green-500" /></Link>
            <Link href="#"><FaFacebookF className="text-xl text-customBlue" /></Link>
            <Link href="#"><FaInstagram className="text-xl text-pink-500" /></Link>
            <Link href="#"><FaYoutube className="text-xl text-red-500" /></Link>
            <Link href="#"><FaXTwitter className="text-xl text-black-500" /></Link>
            <Link href="#"><FaLinkedinIn className="text-xl text-customBlue" /></Link>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>


        {/* Bottom Section */}
        <div className="bg-[#2e2a2a] text-gray-400 mt-10 pt-5 border-t border-white">
          <div className="container mx-auto px-3 flex flex-col md:flex-row justify-between items-center gap-6 ">
            <div className="text-center md:text-left">
              <p>
                <a href="#" className="hover:underline text-white">Bharath Electronics ©</a> 2025 All rights reserved.
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex gap-2">
                <img src="https://estore.bharathelectronics.in/assets/images/gplay-img.jpg" alt="Google Play" className="p-1 w-[120px]" />
                <img src="https://estore.bharathelectronics.in/assets/images/app-store-img.jpg" alt="App Store" className="p-1 w-[120px]" />
              </div>
              <div>
                <img src="https://estore.bharathelectronics.in/assets/images/payments.png" alt="Payment methods" className="p-2 w-[200px]" />
              </div>
            </div>
          </div>
          <div className="bg-[#2e2a2a] ">
            <div className="container mx-auto px-4 text-base font-medium space-y-4">
              {groupedCategories.main
                .filter((mainCat) => groupedCategories.subs[mainCat._id]?.length > 0)
                .map((mainCat) => (
                  <div key={mainCat._id}>
                    <Link
                      href={`/category/${mainCat.category_slug}`}
                      className="font-semibold text-white hover:underline whitespace-nowrap"
                    >
                      {capitalizeFirstLetter(mainCat.category_name)} :
                    </Link>
                    <span className="text-gray-400 ml-2">
                      {groupedCategories.subs[mainCat._id].map((subcat, index) => (
                        <span key={subcat._id}>
                          <Link
                            href={`/category/${mainCat.category_slug}/${subcat.category_slug}`}
                            className="hover:text-white hover:underline"
                          >
                            {capitalizeFirstLetter(subcat.category_name)}
                          </Link>
                          {index < groupedCategories.subs[mainCat._id].length - 1 && ' / '}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
            </div>
          </div>

        </div>
      </footer>

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
    </>
  );
};

export default Footer;