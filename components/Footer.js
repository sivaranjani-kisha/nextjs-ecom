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
    const [stores, setStores] = useState([]);
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
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  const getCached = (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.__ts) return null;
      if (Date.now() - parsed.__ts > CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data;
    } catch (e) {
      return null;
    }
  };

  const setCached = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify({ __ts: Date.now(), data }));
    } catch (e) {
      // ignore
    }
  };

  const makeGrouped = (data) => {
    const activeCategories = Array.isArray(data) ? data.filter(cat => cat.status === 'Active') : [];
    const main = activeCategories.filter(cat => cat.parentid === 'none');
    const subs = {};
    activeCategories.forEach(cat => {
      if (cat.parentid !== 'none') {
        if (!subs[cat.parentid]) subs[cat.parentid] = [];
        subs[cat.parentid].push(cat);
      }
    });
    return { main, subs };
  };

  const fetchCategories = async () => {
    const key = 'cache_footer_categories_v1';
    const cached = getCached(key);
    if (cached) {
      setGroupedCategories(makeGrouped(cached));
      return;
    }

    try {
      const res = await fetch('/api/categories/get');
      const data = await res.json();
      if (data) {
        setGroupedCategories(makeGrouped(data));
        setCached(key, data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchStores = async () => {
    const key = 'cache_footer_stores_v1';
    const cached = getCached(key);
    if (cached) {
      setStores(cached);
      return;
    }

    try {
      const res = await fetch('/api/store/get');
      const data = await res.json();
      if (data && data.success) {
        setStores(data.data);
        setCached(key, data.data);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  fetchCategories();
  fetchStores();
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
  const groupedStores = stores.reduce((acc, store) => {
  const city = store.city; // or store.store_city based on your API
  if (!acc[city]) {
    acc[city] = [];
  }
  acc[city].push(store.organisation_name);
  return acc;
}, {});
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
      <footer className="bg-[#2e2a2a] text-gray-300 text-sm py-5 md:px-4 p-6">
        <div className="bg-[#2e2a2a] text-gray-400  border-white ">
          <div className="w-full flex justify-center">
            <div className="w-full container mx-auto px-3  grid grid-cols-1 md:grid-cols-3 gap-16 justify-between">
              
              {/* Corporate Office */}
              <div className="space-y-3">
          <h3 className="text-white font-semibold text-lg mb-4">Corporate Office</h3>
          <p>
            26/1 Dr. Alagappa Chettiyar Rd, Tatabad, Near Kovai Scan Centre,
            Coimbatore-641012
          </p>

          <hr className="border-gray-600 my-3" />

          <div className="flex items-center gap-2">
            <FiPhone />
            <a href="tel:9842344323" className="text-blue-600 hover:underline">
              9842344323
            </a>
          </div>

          <hr className="border-gray-600 my-3" />

          <div className="flex items-center gap-2">
            <FiMail />
            <a
              href="mailto:customercare@bharatelectronics.in"
              className="text-blue-600 hover:underline"
            >
              customercare@bharatelectronics.in
            </a>
          </div>

          <hr className="border-gray-600 my-3" />

          <p>
            <strong>Business Hours:</strong> 09:30AM - 09:30 PM (Mon to Sun)
          </p>
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
                    <li><Link href="/contact" className="hover:underline hover:text-white">Contact Us</Link></li>
                    <li><Link href="/blog" className="hover:underline hover:text-white">Blogs</Link></li>
                  </ul>
                </div>
              <div>
          <h3 className="text-white font-semibold text-lg mb-4">Connect With Us</h3>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <Link href="https://web.whatsapp.com/send?phone=919842344323&amp;text=Hi">
              <FaWhatsapp className="text-xl text-green-500" />
            </Link>
            <Link href="https://www.facebook.com/BharathElectronics/">
              <FaFacebookF className="text-xl text-customBlue" />
            </Link>
            <Link href="https://www.instagram.com/bharathelectronics/">
              <FaInstagram className="text-xl text-pink-500" />
            </Link>
            <Link href="https://www.youtube.com/@bharathelectronicsandappli3074">
              <FaYoutube className="text-xl text-red-500" />
            </Link>
            <Link href="https://twitter.com/bharath_bea">
              <FaXTwitter className="text-xl text-black" />
            </Link>
            <Link href="https://in.linkedin.com/company/bharath-electronics-and-appliances">
              <FaLinkedinIn className="text-xl text-customBlue" />
            </Link>
          </div>
        {/* </div> */}

                </div>
              </div>

            </div>
          </div>
        </div>


        {/* Bottom Section */}
        <div className="bg-[#2e2a2a] text-gray-400 mt-10 pt-5 border-t border-white">
  <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-[70%_30%] gap-8">
    
    {/* LEFT SECTION (Categories + Brands) */}
    <div>
      <div className="mb-2 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left ml-1 mb-1">
          <p>
            <a href="#" className="hover:underline text-white">
              Bharath Electronics ©
            </a>{" "}
            2025 All rights reserved.
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-4">
        {groupedCategories.main.map((mainCat) => (
          <div key={mainCat._id}>
            <span className="text-gray-400">
              {groupedCategories.subs[mainCat._id]?.map((subcat, i) => (
                <span key={subcat._id}>
                  <Link
                    href={`/category/${mainCat.category_slug}/${subcat.category_slug}`}
                    className="text-white hover:underline"
                  >
                    {capitalizeFirstLetter(subcat.category_name)} :
                  </Link>

                  {/* Sub-Sub Categories */}
                  {groupedCategories.subs[subcat._id]?.length > 0 && (
                    <span className="ml-2 text-gray-500">
                      {groupedCategories.subs[subcat._id].map((child, j) => (
                        <span key={child._id}>
                          <Link
                            href={`/category/${mainCat.category_slug}/${subcat.category_slug}/${child.category_slug}`}
                            className="hover:text-white hover:underline"
                          >
                            {capitalizeFirstLetter(child.category_name)}
                          </Link>
                          {j < groupedCategories.subs[subcat._id].length - 1 && " / "}
                        </span>
                      ))}
                    </span>
                  )}

                  {/* Brands */}
                  {mainCat.brands.length > 0 && (
                    <>
                      <br />
                      <span className="font-semibold text-white">Brands :</span>
                      <span className="ml-2 text-gray-500">
                        {mainCat.brands.map((brand, i) => (
                          <span key={brand._id}>
                            <Link
                              href={`/category/brand/${mainCat.category_slug}/${brand.brand_slug}`}
                              className="hover:text-white hover:underline"
                            >
                              {brand.brand_name.charAt(0).toUpperCase() +
                                brand.brand_name.slice(1).toLowerCase()}
                            </Link>
                            {i < mainCat.brands.length - 1 && " / "}
                          </span>
                        ))}
                      </span>
                    </>
                  )}

                  {i < groupedCategories.subs[mainCat._id].length - 1 && (
                    <span className="block mb-4"></span>
                  )}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* RIGHT SECTION (Our Location) */}
    <div className="space-y-4">
      <h3 className="text-white font-semibold text-lg mb-4">Our Location</h3>
      {Object.entries(groupedStores).map(([city, orgs], index) => (
        <div key={index}>
          <p className="text-sm text-gray-400">{orgs.join(", ")}</p>
        </div>
      ))}
    </div>
  </div>
</div>

        <div className="bg-[#2e2a2a] text-gray-400 mt-10 pt-5">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-[70%_30%] gap-8">
            {/* LEFT SECTION */}
              <div className="space-y-8">
                {/* SEO Content */}
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-white font-semibold">
                        Buy Best Laptops & Gadgets Online
                      </h2>
                      <p className="text-gray-400 py-2">
                        Unleash the Power of Technology with{" "}
                        <span className="font-semibold text-white">
                          Bharath Electronics' Laptop & Computers Collection
                        </span>
                        . Find the Perfect Device for Your Computing Needs, including Gaming
                        Laptops, Everyday Laptops, and Business Laptops. We Offer a Wide
                        Selection from Top Brands such as Samsung, Asus, Apple, HP, Lenovo, and
                        More. Our Laptops and Computers Boast Premium Design, High-Capacity RAM,
                        Latest Processors, Quality Graphics Cards, Excellent Battery Life, and
                        Incredible Display & Sound Features. Don’t Forget to Check Out our Range
                        of Smart Watches, Chargers, Power Banks, Headphones, and Bluetooth
                        Speakers for a Complete Tech Experience.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-white font-semibold">
                        Buy Kitchen Appliances at Best Prices Online – Shop Now
                      </h2>
                      <p className="text-gray-400 py-2">
                        Revolutionize Your Kitchen with Bharath Electronics' Kitchen Appliances Collection. 
                        Explore a Wide Range of Colours, Sizes, Manufacturers, and Types to Find the Perfect 
                        Appliances for Your Culinary Needs. From Multi-Functional Mixer Juicer Grinders to 
                        Energy-Efficient Electric Cookers, Kitchen Chimneys, Gas Stoves, Induction Stoves, 
                        Water Purifiers, Microwave Ovens, and Pressure Cookers, we Offer a Diverse Selection. 
                        Upgrade Your Cooking Experience Today with our Affordable and High-Quality Kitchen Appliances.
                      </p>
                    </div>
                  </div>
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