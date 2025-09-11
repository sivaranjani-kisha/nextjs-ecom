// components/Header.jsx
'use client';
import { motion } from 'framer-motion';
import Link from "next/link";
import Image from 'next/image';
import { FiSearch, FiMapPin, FiHeart, FiShoppingCart, FiUser, FiMenu, FiX, FiPhoneCall, FiMessageSquare } from "react-icons/fi";
import { FaBars, FaShoppingBag, FaUserShield } from "react-icons/fa";
import { FaHeart, FaShoppingCart, FaSearch } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { IoLogOut } from "react-icons/io5";
import { FaCircleChevronLeft, FaCircleChevronRight, FaLocationDot, FaPhone } from "react-icons/fa6";
import { useCart } from '@/context/CartContext';
import { useWishlist } from "@/context/WishlistContext";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { useRouter, usePathname } from 'next/navigation';
import { Play } from "lucide-react";
import { Navigation } from 'swiper/modules';
import SideNavbar from '@/components/sideNavbar';
import { useHeaderdetails } from "@/context/HeaderContext";
import ProductCard from '@/components/ProductCard';
import Addtocart from '@/components/AddToCart';
import { getProducts } from '@/lib/productApi';
const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [category, setCategory] = useState('All Categories');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { wishlistCount } = useWishlist();
    const { cartCount, updateCartCount } = useCart();
    const handleCategoryClick = useCallback((categorySlug, categoryName) => {
        const path = `/category/${categorySlug}`;
        setSelectedCategory(categoryName);
        setIsMobileMenuOpen(false);
        router.push(path);
    }, [router]);
    const dropdownRef = useRef(null);
    const [activeTab, setActiveTab] = useState('login');
    // const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    // const [userData, setUserData] = useState(null);
    const [hasMounted, setHasMounted] = useState(false);
    const { userData, isLoggedIn, setIsLoggedIn, setUserData, isAdmin, setIsAdmin } = useHeaderdetails();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [searchQuery, setSearchQuery] = useState("");
    const [placeholder, setPlaceholder] = useState("Search For");
    const [typedPreview, setTypedPreview] = useState("");
    const [words, setWords] = useState([]);
    const [categorieslist, setCategorieslist] = useState([]);
    const wordIndex = useRef(0);
    const charIndex = useRef(0);
    const isDeleting = useRef(false);
    const getSortedProducts = () => {
        const sortedProducts = [...products];
        switch(sortOption) {
        case 'price-low-high':
            return sortedProducts.sort((a, b) => (a.special_price ?? a.price) - (b.special_price ?? b.price));
        case 'price-high-low':
            return sortedProducts.sort((a, b) => (b.special_price ?? b.price) - (a.special_price ?? a.price));
        case 'name-a-z':
            return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-z-a':
            return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        default:
            return sortedProducts;
        }
    };

    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await fetch("/api/categories/get");
          const data = await response.json();
          setCategorieslist(data);
          setWords(data.map((cat) => cat.category_name));
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      };

      fetchCategories();
    }, []);

    useEffect(() => {
      const typeEffect = () => {
        if (words.length === 0) return;

        const currentWord = words[wordIndex.current];
        const updatedText = isDeleting.current
          ? currentWord.substring(0, charIndex.current - 1)
          : currentWord.substring(0, charIndex.current + 1);

        // update typed preview (keep placeholder static)
        setTypedPreview(updatedText || "");

        charIndex.current = isDeleting.current
          ? charIndex.current - 1
          : charIndex.current + 1;

        if (!isDeleting.current && charIndex.current === currentWord.length) {
          isDeleting.current = true;
          setTimeout(typeEffect, 1000); // pause before deleting
        } else if (isDeleting.current && charIndex.current === 0) {
          isDeleting.current = false;
          wordIndex.current = (wordIndex.current + 1) % words.length;
          setTimeout(typeEffect, 1000); // pause before typing next
        } else {
          setTimeout(typeEffect, isDeleting.current ? 60 : 100);
        }
      };

      typeEffect();
    }, [words]);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const { headerdetails, updateHeaderdetails } = useHeaderdetails();

    const [offers, setOffers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [sortOption, setSortOption] = useState('');
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [dropdownLeft, setDropdownLeft] = useState(0);
    const [dropdownTop, setDropdownTop] = useState(0);
    const [dropdownCenterX, setDropdownCenterX] = useState(null);
    const [dropdownUseTranslate, setDropdownUseTranslate] = useState(false);
    const slideRefs = useRef({});
    const [suggestions, setSuggestions] = useState([]);
    // refs & state for search dropdown positioning
    const searchInputRef = useRef(null);
    const debounceRef = useRef(null);
    const searchDropdownRef = useRef(null);
    const [searchDropdownVisible, setSearchDropdownVisible] = useState(false);
    const [searchDropdownLeft, setSearchDropdownLeft] = useState(0);
    const [searchDropdownTop, setSearchDropdownTop] = useState(0);
    const [searchDropdownWidth, setSearchDropdownWidth] = useState(0);
    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    // Track step
    const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter OTP and new password
    const [resetStep, setResetStep] = useState(1);// 1: enter email, 2: enter OTP, 3: new password
    const [resetEmail, setResetEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [resetPassword, setResetPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    // OTP input
    const [forgotOTP, setForgotOTP] = useState('');

    // New password inputs
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Close mobile menu when clicking outside

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
                setDropdownOpen(false);
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
                if (data.role == "admin") {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
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

    // Add this search handler function
   const handleSearch = () => {

    if (!searchQuery.trim() && selectedCategory === "All Categories") return;

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append("query", searchQuery.trim());
    if (selectedCategory !== "All Categories") {
      params.append("category", selectedCategory);
    }

    router.push(`/search?${params.toString()}`);
  };
  
    // Load products once using shared util (for instant local filtering)
useEffect(() => {
  let mounted = true;
  const loadProducts = async () => {
    try {
      const data = await getProducts();
      if (!mounted) return;
      setProducts(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('Error loading products in header', err);
    }
  };
  loadProducts();
  return () => { mounted = false; };
}, []);

// Memoized sorted products using existing getSortedProducts flow
const sortedProducts = useMemo(() => getSortedProducts(), [products, sortOption]);

    // helper to fetch suggestions (safe JSON handling) - now uses local products for instant results
    const fetchSuggestions = useCallback(async (q) => {
      if (!q || q.trim().length < 1) {
        setSuggestions([]);
        return;
      }

      // Use local products (sorted) for instant client-side suggestions
      try {
        if (Array.isArray(sortedProducts) && sortedProducts.length > 0) {
          const ql = q.toLowerCase();
          const filtered = sortedProducts.filter(p => {
            const name = (p.name || '').toLowerCase();
            const code = (p.item_code || '').toLowerCase();
            const brand = ((p.brand_name || p.brand || '') + '').toLowerCase();
            return name.includes(ql) || code.includes(ql) || brand.includes(ql);
          }).slice(0, 12);

          setSuggestions(filtered);
          setSearchDropdownVisible(true);

          if (searchInputRef.current) {
            const rect = searchInputRef.current.getBoundingClientRect();
            setSearchDropdownLeft(rect.left);
            setSearchDropdownTop(rect.bottom + window.scrollY);
            setSearchDropdownWidth(rect.width);
          }
          return;
        }
      } catch (err) {
        console.error('Local filter error', err);
      }

      // Fallback: server-side suggestions
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
          setSuggestions([]);
          return;
        }
        const text = await res.text();
        if (!text) { setSuggestions([]); return; }
        let data;
        try { data = JSON.parse(text); } catch { setSuggestions([]); return; }
        const items = Array.isArray(data) ? data : (data?.results || []);
        setSuggestions(items.slice(0, 12));
        setSearchDropdownVisible(true);

        if (searchInputRef.current) {
          const rect = searchInputRef.current.getBoundingClientRect();
          setSearchDropdownLeft(rect.left);
          setSearchDropdownTop(rect.bottom + window.scrollY);
          setSearchDropdownWidth(rect.width);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      }
    }, [sortedProducts]);
  
    // Debounced effect: call fetchSuggestions while typing
    useEffect(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const q = searchQuery.trim();
      if (!q) {
        setSuggestions([]);
        setSearchDropdownVisible(false);
        return;
      }

      // Ensure dropdown becomes visible as soon as user types (even for one char)
      setSearchDropdownVisible(true);

      // Immediate fetch for the first character, otherwise debounce for performance
      if (q.length === 1) {
        fetchSuggestions(q);
        return;
      }

      debounceRef.current = setTimeout(() => fetchSuggestions(q), 200);
      return () => clearTimeout(debounceRef.current);
    }, [searchQuery, fetchSuggestions]);
  
    // Close search dropdown when clicking outside input or dropdown
    useEffect(() => {
      const handler = (e) => {
        const target = e.target;
        if (
          searchDropdownVisible &&
          searchInputRef.current &&
          searchDropdownRef.current &&
          !searchInputRef.current.contains(target) &&
          !searchDropdownRef.current.contains(target)
        ) {
          setSearchDropdownVisible(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [searchDropdownVisible]);
    // Modify the search button to use the handler
    // Also make the search work when pressing Enter in the input field
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
  const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const isValidMobile = (mobile) => /^[0-9]{10}$/.test(mobile);
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
    setLoadingAuth(false);

    // ---------- REGISTER VALIDATION ----------
    if (activeTab === 'register') {
        if (formData.name === '') {
            const nameError = document.getElementById('name-error');
            if (nameError) {
                nameError.textContent = 'Name must be filled';
                nameError.classList.add('text-red-500');
            }
            const nameInput = document.getElementById('name-input');
            if (nameInput) nameInput.classList.add('border-red-500');
        } else {
            const nameError = document.getElementById('name-error');
            if (nameError) nameError.textContent = '';
            const nameInput = document.getElementById('name-input');
            if (nameInput) nameInput.classList.remove('border-red-500');
        }

        if (formData.mobile === '') {
            const mobileError = document.getElementById('mobile-error');
            if (mobileError) {
                mobileError.textContent = 'Mobile must be filled';
                mobileError.classList.add('text-red-500');
            }
            const mobileInput = document.getElementById('mobile-input');
            if (mobileInput) mobileInput.classList.add('border-red-500');
        } else if (!isValidMobile(formData.mobile)) {
            const mobileError = document.getElementById('mobile-error');
            if (mobileError) {
                mobileError.textContent = 'Enter a valid mobile number';
                mobileError.classList.add('text-red-500');
            }
            const mobileInput = document.getElementById('mobile-input');
            if (mobileInput) mobileInput.classList.add('border-red-500');
        } else {
            const mobileError = document.getElementById('mobile-error');
            if (mobileError) mobileError.textContent = '';
            const mobileInput = document.getElementById('mobile-input');
            if (mobileInput) mobileInput.classList.remove('border-red-500');
        }
    }

    // ---------- COMMON (LOGIN + REGISTER) ----------
    if (formData.email === '') {
        const emailError = document.getElementById('email-error');
        if (emailError) {
            emailError.textContent = 'Email must be filled';
            emailError.classList.add('text-red-500');
        }
        const emailInput = document.getElementById('email-input');
        if (emailInput) emailInput.classList.add('border-red-500');
    } else if (!isValidEmail(formData.email)) {
        const emailError = document.getElementById('email-error');
        if (emailError) {
            emailError.textContent = 'Enter a valid email';
            emailError.classList.add('text-red-500');
        }
        const emailInput = document.getElementById('email-input');
        if (emailInput) emailInput.classList.add('border-red-500');
    } else {
        const emailError = document.getElementById('email-error');
        if (emailError) emailError.textContent = '';
        const emailInput = document.getElementById('email-input');
        if (emailInput) emailInput.classList.remove('border-red-500');
    }

    if (formData.password.length < 6) {
        const passwordError = document.getElementById('password-error');
        if (passwordError) {
            passwordError.textContent = 'Password must be at least 6 characters';
            passwordError.classList.add('text-red-500');
        }
        const passwordInput = document.getElementById('password-input');
        if (passwordInput) passwordInput.classList.add('border-red-500');
    } else {
        const passwordError = document.getElementById('password-error');
        if (passwordError) passwordError.textContent = '';
        const passwordInput = document.getElementById('password-input');
        if (passwordInput) passwordInput.classList.remove('border-red-500');
    }

    // ---------- API CALL ----------
    if (
        (activeTab === 'login' && formData.email && formData.password.length >= 6) ||
        (activeTab === 'register' && formData.name && formData.email && formData.mobile && formData.password.length >= 6)
    ) {
        try {
            setLoadingAuth(true);
            setFormError('');
            setError('');
            const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
               if (!response.ok) {
        // 👇 If backend sends specific message, show that instead of generic
        if (data.message) {
            setError(<span className="text-red-500">{data.message}</span>);
        }  else {
            setError(<span className="text-red-500">Password Mismatch</span>);
        }
        return;
    }

            // if (!response.ok) throw new Error(data.message || 'Something went wrong');

            if (data.token) {
                localStorage.setItem('token', data.token);
                setIsLoggedIn(true);
                setIsAdmin(data.user.role === 'admin');
                setUserData(data.user);
                setShowAuthModal(false);
                setFormData({ name: '', email: '', mobile: '', password: '' });

                // Update cart count after login
                const cartResponse = await fetch('/api/cart/count', {
                    headers: { Authorization: `Bearer ${data.token}` },
                });
                if (cartResponse.ok) {
                    const cartData = await cartResponse.json();
                    updateCartCount(cartData.count);
                }
            } else {
                setShowAuthModal(true);
                setActiveTab('login');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingAuth(false);
        }
    } else {
        return;
    }
};

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserData(null);
        updateCartCount(0); // Reset cart count on logout
    };

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await fetch("/api/offers/get");
                const result = await response.json();

                // Process and format dates before setting state
                const activeOffers = result.data
                    .filter((offer) => offer.fest_offer_status === "active")
                setOffers(activeOffers);
            } catch (err) {
                console.error("Failed to fetch offers", err);
            }
        };
        fetchOffers();
    }, []);

    const hideTimeout = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/categories/get");
                const data = await response.json();

                // Keep only active categories
                const activeCategories = data.filter(cat => cat.status === "Active");

                const categoryMap = {};
                activeCategories.forEach((cat) => {
                    cat.subcategories = [];
                    categoryMap[cat._id] = cat;
                });

                const nestedCategories = [];
                activeCategories.forEach((cat) => {
                    if (cat.parentid === "none") {
                        nestedCategories.push(cat);
                    } else if (categoryMap[cat.parentid]) {
                        categoryMap[cat.parentid].subcategories.push(cat);
                    }
                });

                setCategories(nestedCategories);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };

        fetchCategories();
        checkAuthStatus();
    }, []);


 
const flattenTree = (cat, rootCategory, level = 0) => {
    let result = [];
    
    // Add the category itself
    result.push({ ...cat, rootCategory, level, type: 'category' });

    // Add subcategories
    if (cat.subcategories?.length > 0) {
        cat.subcategories.forEach(child => {
            result = result.concat(flattenTree(child, rootCategory, level + 1));
        });
    }
    
    return result;
};

    // Flatten all starting from actual visible categories (like Refrigerator, AC…)
const flattenAllCategories = (cats) => {
    let result = [];
    let brandCounter = 0; // Counter for unique keys

    // Use a Map to dedupe brands by a normalized key (slug/name/id)
    const brandMap = new Map();

    const normalizeKey = (s) => {
        if (!s && s !== 0) return '';
        return String(s).toLowerCase().replace(/\s+/g, ' ').trim().replace(/[^a-z0-9]/g, '');
    };

    cats.forEach(cat => {
        // Add the category and its subcategories
        result = result.concat(flattenTree(cat, cat.category_slug, 0));

        // Collect brands for this category and add to map if unique
        if (Array.isArray(cat.brands) && cat.brands.length > 0) {
            cat.brands.forEach(brand => {
                // try multiple fields for a stable identifier
                const candidate = brand.brand_slug || brand.slug || brand.brand_name || brand.name || brand._id || '';
                const key = normalizeKey(candidate);
                if (!key) return; // skip invalid

                if (!brandMap.has(key)) {
                    // store first occurrence and include a stable uniqueKey
                    brandMap.set(key, {
                        ...brand,
                        type: 'brand',
                        sourceCategory: cat.category_name,
                        uniqueKey: `${brand._id || key}-${brandCounter++}`
                    });
                } else {
                    // already present: optionally we could merge sourceCategory info
                    const existing = brandMap.get(key);
                    if (existing && existing.sourceCategory !== cat.category_name) {
                        existing.sourceCategory = existing.sourceCategory + ", " + cat.category_name;
                    }
                }
            });
        }
    });

    const allBrands = Array.from(brandMap.values());

    // Add a single brands header at the end
    if (allBrands.length > 0) {
        result.push({
            _id: 'all-brands-header',
            type: 'brands-header',
            category_name: 'Brands',
            level: 0,
            uniqueKey: 'all-brands-header'
        });

        // Add all collected brands with unique keys
        result = result.concat(allBrands.map(brand => ({
            ...brand,
            level: 1,
            uniqueKey: brand.uniqueKey
        })));
    }

    return result;
};




 
const chunkFlatList = (flatList, size = 11) => {
    const chunks = [];
    if (!Array.isArray(flatList) || flatList.length === 0) return chunks;

    for (let i = 0; i < flatList.length; i += size) {
        chunks.push(flatList.slice(i, i + size));
    }

    return chunks;
};

    const cancelHide = () => {
        if (hideTimeout.current) {
            clearTimeout(hideTimeout.current);
            hideTimeout.current = null;
        }
    };
    const startHide = (delay = 100) => {
        cancelHide();
        hideTimeout.current = setTimeout(() => {
            setHoveredCategory(null);
        }, delay);
    };
    const handleMouseEnter = (categoryId) => {
        cancelHide();
        const cat = categories.find((c) => c._id === categoryId);
        if (!cat) return;
        setHoveredCategory(cat);

        const el = slideRefs.current[categoryId];
        if (!el) return;

        const rect = el.getBoundingClientRect();
        // Using fixed positioning => use viewport coords (rect.left / rect.bottom)
        setDropdownLeft(rect.left);
        setDropdownTop(rect.bottom);
        setDropdownCenterX(rect.left + rect.width / 2);
    };
    // After dropdown mounts, measure and adjust so it never overflows screen or hides under arrows
    useLayoutEffect(() => {
        if (!hoveredCategory || !dropdownRef.current) return;
        const ddRect = dropdownRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        let left = dropdownLeft;

        // Center dropdown based on parent center when available
        if (dropdownCenterX != null && ddRect.width) {
            left = dropdownCenterX - ddRect.width / 2;
            // Clamp to viewport
            if (left < 8) left = 8;
            if (left + ddRect.width > screenWidth - 10) left = Math.max(10, screenWidth - ddRect.width - 10);
        } else {
            // If dropdown would overflow right edge, shift it left
            if (left + ddRect.width > screenWidth - 10) {
                left = Math.max(10, screenWidth - ddRect.width - 10);
            }
        }

        // Ensure dropdown is at least after prev arrow
        const prevBtn = document.querySelector(".custom-swiper-prev");
        const prevRight = prevBtn?.getBoundingClientRect().right || 0;
        if (left < prevRight + 8) left = prevRight + 8;

        // Ensure dropdown doesn't go too far left
        if (left < 8) left = 8;
        if (left !== dropdownLeft) setDropdownLeft(left);
        // only run when hoveredCategory changes to avoid update loops
    }, [hoveredCategory, dropdownCenterX]);

    // cleanup hide timeout on unmount
    useEffect(() => {
        return () => {
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
        };
    }, []);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
    const [forgotPasswordError, setForgotPasswordError] = useState('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

    // Add this function to handle forgot password submission
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotPasswordError('');
        setForgotPasswordMessage('');
        setForgotPasswordLoading(true);
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: forgotPasswordEmail }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset link');
            }
            setForgotPasswordMessage(data.message || 'Password reset link sent to your email');
        } catch (err) {
            setForgotPasswordError(err.message);
        } finally {
            setForgotPasswordLoading(false);
        }
    };
    // Render flattened category/brand item
const renderFlatItem = (item, hoveredCategory) => {
  const itemKey = item.uniqueKey || item._id;
  const paddingLeft = `${(item.level || 0) * 12}px`;

  let content = null;

  if (item.type === "brands-header") {
    const href =
      item.level === 0
        ? `/category/${encodeURIComponent(item.category_slug || "")}`
        : `/category/${encodeURIComponent(
            hoveredCategory?.category_slug || ""
          )}/${encodeURIComponent(item.rootCategory || "")}/${encodeURIComponent(
            item.category_slug || ""
          )}`;
    content = (
        
      <h3 className="flex items-center justify-between mb-1 text-sm font-semibold text-blue-600 ml-1">
  {item.category_name}
</h3>
    );
  } 
  else if (item.type === "brand") {
    const href = `/category/brand/${encodeURIComponent(
      hoveredCategory?.category_slug || ""
    )}/${encodeURIComponent(item.brand_slug || "")}`;

    content = (
      <Link
        href={href}
        className="flex items-center mb-1 text-sm text-[#8c8c8c] p-[5px] hover:text-[#0e54e6]"
      >
        <span className="font-normal">{item.brand_name}</span>
      </Link>
    );
  } 
  else {
    const href =`/category/${encodeURIComponent(
            hoveredCategory?.category_slug || ""
          )}/${encodeURIComponent(item.rootCategory || "")}/${encodeURIComponent(
            item.category_slug || ""
          )}`;

    content = (
      <Link
        href={href}
        className={`flex items-center justify-between mb-1 text-sm ${
          item.level === 0
            ? "font-semibold text-blue-600"
            : "text-[#8c8c8c] !p-[5px] hover:text-[#0e54e6]"
        }`}
      >
        <span className={item.level === 0 ? "font-bold" : "font-normal"}>
          {item.category_name}
        </span>
        {item.level === 0 && (
          <Play
            size={14}
            strokeWidth={0}
            className="text-blue-600 fill-blue-600"
          />
        )}
      </Link>
    );
  }

  return (
    <div key={itemKey} style={{ paddingLeft }}>
      {content}
    </div>
  );
};


    return (
        <header className="sticky top-0 z-50">
            {/* Top Announcement Bar */}
            {/* {offers.some(
                (offer) => String(offer.fest_offer_status).trim().toLowerCase() === "active"
            ) ? (
                // ✅ Active offer banner
                <div className={`bg-customBlue text-yellow-300 px-4 py-1 overflow-hidden relative w-full ${isMobileMenuOpen ? 'hidden' : ''}`}>
                    <div className="relative w-full overflow-hidden h-6 flex items-center">
                        <motion.div initial={{ x: "100%" }} animate={{ x: "-100%" }} transition={{ ease: "linear", duration: 20, repeat: Infinity }} className="absolute whitespace-nowrap flex items-center space-x-8">
                            {offers
                                .filter((offer) => String(offer.fest_offer_status).trim().toLowerCase() === "active")
                                .map((offer, index) => (
                                    <span key={index} className="font-medium text-xs sm:text-sm">
                                        {offer.notes} {offer.percentage}% | Code:{" "}
                                        <strong>{offer.offer_code}</strong>
                                    </span>
                                ))
                            }
                        </motion.div>
                    </div>
                </div>
            ) : (
                // ❌ No active offers
                <div className={`bg-customBlue text-yellow-300 px-4 py-1 overflow-hidden relative w-full ${isMobileMenuOpen ? 'hidden' : ''}`}>
                    <div className="relative w-full overflow-hidden h-6 flex items-center">
                        <motion.div initial={{ x: "100%" }} animate={{ x: "-100%" }} transition={{ ease: "linear", duration: 20, repeat: Infinity }} className="absolute whitespace-nowrap flex items-center space-x-8">
                            <span className="font-medium text-xs sm:text-sm">
                                No current offers available — shop now and stay tuned for exciting discounts coming soon!
                            </span>
                        </motion.div>
                    </div>
                </div>
            )} */}

            {/* Main Header */}
            <div className={`${isMobileMenuOpen ? "fixed inset-0 mt-0 pt-0 z-50 overflow-y-auto" : "bg-white px-4 sm:px-6 md:px-6 py-1 sticky top-0 z-40"}`}>
                <div className="flex justify-between items-center">
                    {/* Mobile Menu Button (Hidden on desktop) */}
                    <div className="sm:hidden flex items-center justify-center w-full relative">
                        <button onClick={toggleMobileMenu} className="text-customBlue absolute left-0 z-50 p-2">
                            {isMobileMenuOpen ? <FiX size={28} /> : <FaBars size={28} />}
                        </button>
                        <Link href="/" className="bg-white p-1 rounded-lg mx-auto">
                            <img src="/user/bea-new.png" alt="Logo" className="h-auto" width={40} height={20} />
                        </Link>
                    </div>

                    {/* Logo (Hidden on mobile) */}
                    <div className="hidden sm:block mr-12 bg-white py-2 rounded-lg">
                        <Link href="/index" className="mx-auto">
                            <img src="/user/bea-new.png" alt="Logo" className="h-auto" width={100} height={30} />
                        </Link>
                    </div>

                    {/* Search Bar (Hidden on mobile - will show in mobile menu) */}
                    <div className="relative hidden sm:flex flex-1 max-w-xl items-center bg-white rounded-lg shadow overflow-hidden border border-gray-300">
                      {/* grouped select + input on the left */}
                      <div className="flex items-center w-full">
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2.5 text-xs sm:text-sm text-gray-700 bg-gray-200 border-r border-gray-300 outline-none rounded-l-md">
                            <option value="All Categories">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.category_name}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          ref={searchInputRef}
                          onFocus={() => {
                            if (searchInputRef.current) {
                              const rect = searchInputRef.current.getBoundingClientRect();
                              setSearchDropdownLeft(rect.left);
                              setSearchDropdownTop(rect.bottom + window.scrollY);
                              setSearchDropdownWidth(rect.width);
                            }
                            if (searchQuery.trim().length >= 2) fetchSuggestions(searchQuery);
                            setSearchDropdownVisible(true);
                          }}
                          onKeyDown={handleKeyPress}
                          className="flex-1 px-3 py-2 text-sm outline-none relative rounded-r-md"
                        />
                      </div>

                      {/* fake placeholder overlay: shows Search For "<bold updatedText>" when input empty */}
                      {searchQuery.trim() === "" && (
                        <div className="absolute left-3 top-2 pointer-events-none select-none">
                          <span className="text-sm text-gray-600 font-bold">&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;&nbsp;&nbsp;Search For</span>
                          <span className="text-sm text-gray-600"> {"\""}</span>
                          <span className="text-sm text-gray-600">{typedPreview}</span>
                          <span className="text-sm text-gray-600">{"\""}</span>
                        </div>
                      )}

                      <button className="px-3 text-blue-600" onClick={handleSearch}>
                        <FaSearch />
                      </button>

                      {/* Suggestions dropdown rendered as fixed so it won't be clipped */}
                      {searchDropdownVisible && (
                        <div
                          ref={searchDropdownRef}
                          className="fixed z-50 border-t border-gray-200 shadow-xl bg-white rounded"
                          style={{
                            top: `${searchDropdownTop}px`,
                            width: '42%',
                            maxHeight: '420px',
                            overflow: 'auto'
                          }}
                        >
                          <div className="px-3 py-2 text-xs text-gray-500 font-semibold">PRODUCTS</div>
                          {/* product grid - uses suggestions computed from local products for instant results */}
                          {Array.isArray(suggestions) && suggestions.length > 0 ? (
                            <ul className="p-3 space-y-2">
                              {suggestions.map((product) => (
                                <li key={product._id} className="p-0">
                                  <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded min-h-[60px]" style={{ height: '81px', backgroundColor: '#d3d3d3b8' }}>
                                    {product.images?.[0] ? (
                                      <img
                                        src={product.images[0].startsWith('http') ? product.images[0] : `/uploads/products/${product.images[0]}`}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-200 rounded" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <Link href={`/product/${product.slug}`} className="block text-sm font-medium text-gray-800 hover:text-blue-600 truncate">
                                        {product.name}
                                      </Link>
                                      <div className="text-xs text-gray-500">₹{(product.special_price ?? product.price ?? 0).toLocaleString()}</div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="px-3 py-3 text-sm text-gray-500">No results found</div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Icons Group */}
                    <div className="flex items-center gap-[2rem] sm:gap-4">
                        {/* Mobile Search Button (Hidden on desktop) */}
                        <button onClick={toggleMobileMenu} className="sm:hidden text-customBlue">
                            <FiSearch size={20} />
                        </button>

                        {/* Feedback Icon */}
                        <Link href="/feedback" className="hidden sm:flex items-center relative">
                            <FiMessageSquare size={18} className="text-customBlue" />
                        </Link>

                        {/* Contact Icon */}
                        <Link href="/contact" className="hidden sm:flex items-center relative">
                            <FiPhoneCall size={18} className="text-customBlue" />
                        </Link>

                        {/* Location (Hidden on mobile) */}
                        <Link href="/location" className="hidden sm:flex items-center relative">
                            <FiMapPin size={18} className="text-customBlue" />
                                {/* <span className="ml-1 text-xs sm:text-sm text-customBlue hidden lg:inline">Location</span> */}
                        </Link>

                        {/* Wishlist */}
                        <Link href="/wishlist" className="flex items-center relative p-1 sm:p-0">
                            <FiHeart size={18} className="text-customBlue" />
                            {/* {wishlistCount > 0 && ( */}
                                <span className="absolute -top-2 -right-2 text-[10px] bg-customBlue text-white rounded-full w-4 h-4 flex items-center justify-center">
                                    {wishlistCount}
                                </span>
                            {/* )} */}
                            {/* <span className="ml-1 text-xs sm:text-sm text-customBlue hidden lg:inline">Wishlist</span> */}
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="flex items-center relative p-1 sm:p-0 ">
                            <FiShoppingCart size={18} className="text-customBlue" />
                            <span className="absolute -top-2 -right-2 text-[10px] bg-customBlue text-white rounded-full w-4 h-4 flex items-center justify-center">
                                {cartCount}
                            </span>
                            {/* <span className="ml-1 text-xs sm:text-sm text-customBlue hidden lg:inline">Cart</span> */}
                        </Link>

                        {/* User Account */}
                        <div className="relative" ref={dropdownRef}>
                            {isLoggedIn ? (
                                <>
                                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center text-black focus:outline-none p-1 sm:p-0">
                                        <FiUser size={18} className="text-customBlue" />
                                        <span className="ml-1 font-bold text-xs sm:text-sm text-customBlue hidden lg:inline">
                                            Hi, {userData?.name || userData?.username || "User"}
                                        </span>
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-48 sm:w-56 bg-white rounded-xl shadow-xl z-50 transition-all">
                                            <div className="py-2 px-2">
                                                {isAdmin && (
                                                    <>
                                                        <Link href="/admin/dashboard" className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                                                            <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-customBlue text-white">
                                                                <FaUserShield className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            </span>
                                                            Admin Panel
                                                        </Link>
                                                    </>
                                                )}
                                                <Link href="/order" className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                                                    <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-customBlue text-white">
                                                        <FaShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </span>My Orders</Link>
                                                <hr className="my-2 border-gray-200" />
                                                <button onClick={handleLogout} className="flex items-center gap-2 sm:gap-3 w-full text-left px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-red-50 transition-colors">
                                                    <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-customBlue text-white">
                                                        <IoLogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </span>Logout</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button onClick={() => setShowAuthModal(true)} className="flex items-center text-black p-1 sm:p-0">
                                    <FiUser size={18} className="text-customBlue" />
                                    {/* <span className="ml-1 font-bold text-xs sm:text-sm text-customBlue hidden lg:inline">Sign In</span> */}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu (Hidden on desktop) */}
                {isMobileMenuOpen && (
                    <div className="sm:hidden bg-white fixed inset-0 z-50 p-4 rounded-lg shadow-lg overflow-y-auto transition-all duration-300"
                         style={{ touchAction: 'auto', userSelect: 'auto', WebkitUserSelect: 'auto' }}>
                        {/* Mobile Search Bar */}
                        <div className="flex items-center bg-gray-200 rounded-lg shadow overflow-hidden mb-4">
                            <input type="text" tabIndex={0} autoFocus placeholder={placeholder || "Search products..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyPress} className="flex-1 px-3 py-2 text-sm outline-none bg-white" />
                            <button className="px-3 text-customBlue" onClick={handleSearch} tabIndex={0}>
                                <FaSearch />
                            </button>
                        </div>
                        {/* Category List */}
                        <div className="mb-4">
                            <div className="font-bold mb-2 text-blue-700">Categories</div>
                            <nav className="space-y-2">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className={`block w-full text-left px-2 py-1 rounded cursor-pointer ${selectedCategory === 'All Categories' ? 'bg-blue-100' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        console.log('All categories clicked');
                                        setSelectedCategory('All Categories');
                                        setIsMobileMenuOpen(false);
                                        setTimeout(() => {
                                            window.location.href = 'https://bea.divinfosys.com/category';
                                        }, 50);
                                    }}>
                                    All Categories
                                </div>
                                {categories.map(cat => {
                                    const url = `https://bea.divinfosys.com/category/${cat.category_slug}`;
                                    // console.log('Rendering category:', cat.category_name, 'URL:', url);
                                    
                                    const handleCategoryClick = () => {
                                        console.log('Category clicked:', cat.category_name, 'navigating to:', url);
                                        setSelectedCategory(cat.category_name);
                                        setIsMobileMenuOpen(false);
                                        setTimeout(() => {
                                            console.log('Navigating now to:', url);
                                            window.location.href = url;
                                        }, 50);
                                    };

                                    return (
                                        <button
                                            key={cat._id}
                                            type="button"
                                            className={`block w-full text-left px-2 py-1 rounded cursor-pointer hover:bg-blue-50 active:bg-blue-100 ${selectedCategory === cat.category_name ? 'bg-blue-100' : ''}`}
                                            style={{ WebkitTapHighlightColor: 'rgba(0,0,0,0)' }}
                                            onClick={handleCategoryClick}
                                            onTouchEnd={(e) => {
                                                e.preventDefault();
                                                console.log('Touch event on category:', cat.category_name);
                                                handleCategoryClick();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    console.log('Keyboard event on category:', cat.category_name);
                                                    handleCategoryClick();
                                                }
                                            }}>
                                            {cat.category_name}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                        {/* Mobile Menu Links */}
                        <div className="space-y-3">
                            <Link href="/location" className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                                <FaLocationDot className="mr-2 text-customBlue" />Location
                            </Link>
                            <Link href="/wishlist" className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                                <FaHeart className="mr-2 text-customBlue" />Wishlist
                                {wishlistCount > 0 && (
                                    <span className="ml-auto bg-customBlue text-white text-xs px-2 py-1 rounded-full">{wishlistCount}</span>
                                )}
                            </Link>
                            <Link href="/cart" className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                                <FaShoppingCart className="mr-2 text-customBlue" />Cart
                                {cartCount > 0 && (
                                    <span className="ml-auto bg-customBlue text-white text-xs px-2 py-1 rounded-full">{cartCount}</span>
                                )}
                            </Link>
                            {isLoggedIn && isAdmin && (
                                <Link href="/admin/dashboard" className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-200" onClick={() => setIsMobileMenuOpen(false)}><FaUserShield className="mr-2 text-customBlue" />Admin Panel</Link>
                            )}
                            {isLoggedIn ? (
                                <>
                                    <Link href="/order" className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                                        <FaShoppingBag className="mr-2 text-customBlue" />My Orders
                                    </Link>
                                    <button onClick={handleLogout} className="w-full flex items-center text-gray-700 p-2 rounded hover:bg-gray-200">
                                        <IoLogOut className="mr-2 text-customBlue" />Logout
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => { setShowAuthModal(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center text-gray-700 p-2 rounded hover:bg-gray-200">
                                    <FiUser className="mr-2 text-customBlue" />Sign In
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Auth Modal */}
                {showAuthModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 w-96 max-w-full relative">
                            <button onClick={() => { setShowAuthModal(false); setFormError(''); setError(''); }} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl">
                                &times;
                            </button>
                            <div className="flex gap-4 mb-6 border-b">
                                <button className={`pb-2 px-1 ${activeTab === 'login' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('login')}>
                                    Login
                                </button>
                                <button className={`pb-2 px-1 ${activeTab === 'register' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('register')}>
                                    Register
                                </button>
                            </div>

                            <form onSubmit={handleAuthSubmit} className="space-y-4">
                                {activeTab === 'register' && (
                                    <>
                                    <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"id="name-input"/>
                                    <span id="name-error"></span>
                                    </>
                                )}
                                <input type="text" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" id="email-input" />
                                <span id="email-error"></span>
                                {activeTab === 'register' && (
                                <>
                                <input type="tel" placeholder="Mobile" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"  id="mobile-input" />
                                <span id="mobile-error"></span>
                                </>
                                )}
                                <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" minLength={6} id="password-input" />
                                <span id="password-error"></span>
                                {(formError || error) && (
                                    <div className="text-red-500 text-sm">
                                        {formError || error}
                                    </div>
                                )}
                                <button type="submit" disabled={loadingAuth} className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors duration-200">
                                    {loadingAuth ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Register'}
                                </button>

                                {/* Moved Forgot Password button here - better placement */}
                                {activeTab === 'login' && (
                                    <div className="text-center mt-2">
                                        <button type="button" onClick={() => { setShowAuthModal(false); setShowForgotPasswordModal(true); setForgotStep(1); setForgotPasswordEmail(formData.email || ''); setForgotOTP(''); setNewPassword(''); setConfirmPassword(''); setForgotPasswordMessage(''); setForgotPasswordError(''); }} className="text-sm text-blue-500 hover:underline">
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
                {showForgotPasswordModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-96 max-w-full relative">
                            <button onClick={() => setShowForgotPasswordModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                            {/* STEP 1: Enter Email */}
                            {forgotStep === 1 && (
                                <>
                                    <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault(); setForgotPasswordError(''); setForgotPasswordMessage(''); setForgotPasswordLoading(true);
                                        try {
                                            const res = await fetch('/api/auth/request-reset', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ email: forgotPasswordEmail }),
                                            });
                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data.message || 'Error sending OTP');
                                            setForgotPasswordMessage('OTP sent to your email.');
                                            setForgotStep(2);
                                        } catch (err) {
                                            setForgotPasswordError(err.message);
                                        } finally {
                                            setForgotPasswordLoading(false);
                                        }
                                    }} className="space-y-4">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={forgotPasswordEmail}
                                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {forgotPasswordError && (
                                            <p className="text-red-500 text-sm">{forgotPasswordError}</p>
                                        )}
                                        {forgotPasswordMessage && (
                                            <p className="text-green-500 text-sm">{forgotPasswordMessage}</p>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={forgotPasswordLoading}
                                            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                                        >
                                            {forgotPasswordLoading ? 'Sending...' : 'Send OTP'}
                                        </button>
                                    </form>
                                </>
                            )}

                            {/* STEP 2: Enter OTP */}
                            {forgotStep === 2 && (
                                <>
                                    <h2 className="text-lg font-semibold mb-4">Enter OTP</h2>
                                    <p className="text-sm mb-2">Email: <strong>{forgotPasswordEmail}</strong></p>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault(); setForgotPasswordError(''); setForgotPasswordMessage('');
                                        if (!forgotOTP.trim()) {
                                            setForgotPasswordError('Please enter OTP.');
                                            return;
                                        }
                                        setForgotPasswordLoading(true);
                                        try {
                                            const res = await fetch('/api/auth/verify-otp', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    email: forgotPasswordEmail,
                                                    otp: forgotOTP,
                                                }),
                                            });
                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data.message || 'Invalid OTP');
                                            setForgotPasswordMessage('OTP verified. Please set your new password.');
                                            setForgotStep(3);
                                        } catch (err) {
                                            setForgotPasswordError(err.message);
                                        } finally {
                                            setForgotPasswordLoading(false);
                                        }
                                    }} className="space-y-4">
                                        <input type="text" placeholder="Enter OTP" value={forgotOTP} onChange={(e) => setForgotOTP(e.target.value)} required className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        {forgotPasswordError && (
                                            <p className="text-red-500 text-sm">{forgotPasswordError}</p>
                                        )}
                                        {forgotPasswordMessage && (
                                            <p className="text-green-500 text-sm">{forgotPasswordMessage}</p>
                                        )}
                                        <button type="submit" disabled={forgotPasswordLoading} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400">
                                            {forgotPasswordLoading ? 'Validating...' : 'Validate OTP'}
                                        </button>
                                    </form>
                                </>
                            )}

                            {/* STEP 3: New Password */}
                            {forgotStep === 3 && (
                                <>
                                    <h2 className="text-lg font-semibold mb-4">Set New Password</h2>
                                    <p className="text-sm mb-2">Email: <strong>{forgotPasswordEmail}</strong></p>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault(); setForgotPasswordError(''); setForgotPasswordMessage('');
                                        if (newPassword !== confirmPassword) {
                                            setForgotPasswordError('Passwords do not match.');
                                            return;
                                        }
                                        setForgotPasswordLoading(true);
                                        try {
                                            const res = await fetch('/api/auth/reset-password', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    email: forgotPasswordEmail,
                                                    otp: forgotOTP,
                                                    newPassword,
                                                }),
                                            });
                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data.message || 'Error resetting password');

                                            setForgotPasswordMessage('Password reset successful.');
                                            setTimeout(() => {
                                                setShowForgotPasswordModal(false);
                                                setShowAuthModal(true); // reopen login
                                            }, 1500);
                                        } catch (err) {
                                            setForgotPasswordError(err.message);
                                        } finally {
                                            setForgotPasswordLoading(false);
                                        }
                                    }} className="space-y-4">
                                        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        {forgotPasswordError && (
                                            <p className="text-red-500 text-sm">{forgotPasswordError}</p>
                                        )}
                                        {forgotPasswordMessage && (
                                            <p className="text-green-500 text-sm">{forgotPasswordMessage}</p>
                                        )}
                                        <button type="submit" disabled={forgotPasswordLoading} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400">
                                            {forgotPasswordLoading ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

          <div className="relative p-2  mt-0 px-1 bg-[#2453D3] min-h-[64px]  border-gray-200 shadow flex items-center">
                <div className="w-full  relative">
                    {/* Arrows */}
                    {/*
                    <div className="absolute left-0 sm:-left-2 top-1/2 z-20 -translate-y-1/2 custom-swiper-prev cursor-pointer">
                        <div className="p-0 bg-white rounded-full shadow">
                            <FiChevronLeft size={20} className="text-black" />
                        </div>
                    </div>
                    <div className="absolute right-0 top-1/2 z-20 -translate-y-1/2 custom-swiper-next cursor-pointer">
                        <div className="p-0 bg-white rounded-full shadow">
                            <FiChevronRight size={20} className="text-black" />
                        </div>
                    </div>
                    */}
                    {/* Swiper */}
                    <div className="relative">
                        <div className="flex justify-center overflow-x-auto scrollbar-hide">

                            <Swiper modules={[Navigation]} navigation={{ prevEl: ".custom-swiper-prev", nextEl: ".custom-swiper-next", }} spaceBetween={20} slidesPerView="auto" watchOverflow={true} className="pl-10 pr-14">
                                {categories.map((category) => (
                                    <SwiperSlide key={category._id} className="!w-auto">
                                        <div ref={(el) => (slideRefs.current[category._id] = el)} onMouseEnter={() => handleMouseEnter(category._id)} onMouseLeave={() => startHide(120)} className="px-5 py-2 flex flex-col items-center text-center" >
                                            <Link href={`/category/${category.category_slug}`} className="text-sm text-base text-white hover:text-orange-500 whitespace-nowrap" 
                                            
                                            >
                                                {category.category_name}
                                            </Link>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>

                {/* DROPDOWN OUTSIDE SWIPER (fixed so it won't be clipped) */}
                {/* {hoveredCategory && hoveredCategory.subcategories?.length > 0 && (
                    <div
                        ref={dropdownRef}
                        className="fixed z-50 border-t border-gray-200 shadow-xl"
                        style={{
                            top: `${dropdownTop}px`,
                            left: `${dropdownLeft}px`,
                            maxWidth: "calc(100% - 20px)",

                        }}
                        onMouseEnter={cancelHide}
                        onMouseLeave={() => startHide(120)}
                    >
                        <div className="flex flex-wrap bg-white h-auto max-h-[450px] overflow-y-auto">
                        {chunkFlatList(
                            flattenAllCategories(hoveredCategory.subcategories, hoveredCategory.category_slug),
                            11
                        ).map((chunk, index) => (
                            <div
                                key={index}
                                className="min-w-[220px] max-w-[250px] p-3 flex flex-col justify-start"
                            >
                                {chunk.map(item => renderFlatItem(item, hoveredCategory))}
                            </div>
                        ))}

                            {(hoveredCategory.navImage || hoveredCategory.image) && (
                                <div className="min-w-[220px] max-w-[250px] flex items-center justify-center h-full ">
                                    <Link href={`/category/${hoveredCategory.category_slug}`} className="w-full h-full block">
                                        <Image
                                            src={hoveredCategory.navImage || hoveredCategory.image}
                                            alt={hoveredCategory.category_name || 'Category Image'}
                                            width={220}
                                            height={390}
                                            className="object-cover rounded w-full h-full"
                                        />
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>
                )} */}
                {hoveredCategory && hoveredCategory.subcategories?.length > 0 && (
  (() => {
    let dropdownChunksLocal = chunkFlatList(
      flattenAllCategories(hoveredCategory.subcategories, hoveredCategory.category_slug),
      11
    );

    // If the last chunk is short, try to move items (brands) into previous column to fill the gap
    if (dropdownChunksLocal.length > 1) {
      const size = 11;
      const prevIdx = dropdownChunksLocal.length - 2;
      const lastIdx = dropdownChunksLocal.length - 1;
      const prevChunk = [...dropdownChunksLocal[prevIdx]];
      const lastChunk = [...dropdownChunksLocal[lastIdx]];

      const space = Math.max(0, size - prevChunk.length);
      if (space > 0 && lastChunk.length > 0) {
        const moving = lastChunk.splice(0, space);
        prevChunk.push(...moving);
        dropdownChunksLocal[prevIdx] = prevChunk;
        if (lastChunk.length === 0) {
          dropdownChunksLocal.pop();
        } else {
          dropdownChunksLocal[lastIdx] = lastChunk;
        }
      }
    }

    // If a chunk immediately before a brands column is short, move brands into it
    if (dropdownChunksLocal.length > 1) {
      const size = 11;
      for (let i = 0; i < dropdownChunksLocal.length - 1; i++) {
        const current = dropdownChunksLocal[i];
        const next = dropdownChunksLocal[i + 1];
        if (!Array.isArray(next) || next.length === 0) continue;
        if (next[0]?.type === 'brands-header' && current.length < size) {
          const space = Math.max(0, size - current.length);
          const moving = next.splice(0, space);
          dropdownChunksLocal[i] = [...current, ...moving];
          if (next.length === 0) {
            dropdownChunksLocal.splice(i + 1, 1);
          } else {
            dropdownChunksLocal[i + 1] = next;
          }
          break;
        } 
      }
    }

    const hasNavImage = Boolean(hoveredCategory && (hoveredCategory.navImage || hoveredCategory.image));

    // build columns from chunks (only actual columns up to max)
    const maxCols = 6;
    const dataCols = dropdownChunksLocal;
    const maxDataCols = hasNavImage ? maxCols - 1 : maxCols;
    const columns = dataCols.slice(0, maxDataCols);

    // compute dropdown width based on columns and image
    const columnWidth = 220; // matches min-w used for columns
    const imageWidth = hasNavImage ? 220 : 0;
    const gutter = 0; // adjust if you add gap between columns
    let computedWidth = columns.length * columnWidth + imageWidth + gutter;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const maxAllowedWidth = Math.max(300, screenWidth - 20);
    if (computedWidth > maxAllowedWidth) computedWidth = maxAllowedWidth;

    // decide left/transform styles
    const styleLeft = dropdownUseTranslate && dropdownCenterX ? `${dropdownCenterX}px` : `${dropdownLeft}px`;
    const styleTransform = dropdownUseTranslate && dropdownCenterX ? 'translateX(-50%)' : 'none';

    return (
      <div
        ref={dropdownRef}
        className="fixed z-50 border-t border-gray-200 shadow-xl"
        style={{
          top: `${dropdownTop}px`,
          left: styleLeft,
          transform: styleTransform,
          width: `${computedWidth}px`,
          maxWidth: 'calc(100% - 20px)'
        }}
        onMouseEnter={cancelHide}
        onMouseLeave={() => startHide(120)}
      >
        <div className="flex flex-wrap bg-white h-[390px]" style={{ width: '100%' }}>
          {columns.map((chunk, index) => {
            const scrollableClass = (Array.isArray(chunk) && chunk.length > 10) ? '  pr-2' : '';
            const isEmpty = !Array.isArray(chunk) || chunk.length === 0;
            const bgClass = isEmpty ? 'bg-white' : (index % 2 === 0 ? 'bg-gray-200' : 'bg-white');
            const colClass = isEmpty
              ? `min-w-[220px] max-w-[250px] p-3`
              : `min-w-[220px] max-w-[250px] p-3 flex flex-col justify-start self-start ${scrollableClass} ${bgClass}`;

            return (
              <div key={index} className={colClass} style={{ height: '100%' }}>
                {Array.isArray(chunk) && chunk.length > 0 ? (
                  chunk.map((item) => renderFlatItem(item, hoveredCategory))
                ) : (
                  <div className="w-full">&nbsp;</div>
                )}
              </div>
            );
          })}

          {hasNavImage && (
            <div key="nav-image-panel" className={`w-[220px] h-[390px] flex items-center justify-center ${columns.length % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <Link href={`/category/${hoveredCategory.category_slug}`} className="block w-full h-full">
                <Image
                  src={hoveredCategory.navImage || hoveredCategory.image}
                  alt={hoveredCategory.category_name || 'Category Image'}
                  width={220}
                  height={390}
                  className="object-cover  w-full h-full"
                  style={{ boxShadow: '0px -13px 0px #2453d3'}}
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  })()
)}
            </div>

        </header>
    );
};
export default Header;