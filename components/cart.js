"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from '@/context/CartContext';
import Link from "next/link";

const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

const features = [
  { icon: "🚗", title: "Free Shipping", description: "Free shipping all over the US" },
  { icon: "🔒", title: "100% Satisfaction", description: "Guaranteed satisfaction with every order" },
  { icon: "💼", title: "Secure Payments", description: "We ensure secure transactions" },
  { icon: "💬", title: "24/7 Support", description: "We're here to help anytime" },
];

const ConfirmModal = ({ show, onClose, onConfirm }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 text-center shadow-xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Remove item?</h3>
          <p className="text-gray-500 mb-4">Are you sure you want to delete this item from your cart?</p>
          <div className="flex justify-center space-x-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={onConfirm}
            >
              Yes, Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const SuccessModal = ({ show, message, onClose }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 text-center shadow-xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          <h3 className="text-xl font-semibold text-green-600 mb-2">Success!</h3>
          <p className="text-gray-500 mb-4">{message}</p>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={onClose}
          >
            OK
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const CouponModal = ({ show, onClose, coupon, onApply, onChange, couponError, isValidating }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Apply Coupon</h3>
          <div className="flex mb-2">
            <input
              type="text"
              value={coupon}
              onChange={onChange}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={onApply}
              disabled={isValidating}
              className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isValidating ? 'Applying...' : 'Apply'}
            </button>
          </div>
          {/* Error message with animation */}
          <AnimatePresence>
            {couponError && (
              <motion.p 
                className="text-red-500 text-sm mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {couponError}
              </motion.p>
            )}
          </AnimatePresence>
          <button
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
export default function CartComponent() {
  const router = useRouter();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cartCount, updateCartCount } = useCart();
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        const response = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          method: "GET"
        });

        if (!response.ok) {
           const datares = await response.json();
          if (
            datares.error === "Token has expired" ||
            datares.error === "Invalid token" ||
            datares.error === "Authorization token required"
          ) {
            localStorage.removeItem("token");
            window.location.reload(); // refresh page
            return;
          }
        }

        const data = await response.json();
        // Initialize discount for each item to 0
        const itemsWithDiscount = data.cart.items.map(item => ({
          ...item,
          discount: 0
        }));
        
        setCartData({
          ...data.cart,
          items: itemsWithDiscount
        });

        // Check if there's a coupon in localStorage
        const savedCoupon = localStorage.getItem('appliedCoupon');
        if (savedCoupon) {
          const coupon = JSON.parse(savedCoupon);
          setAppliedCoupon(coupon);
          // Apply discount to items when loading
          applyDiscountToItems(coupon, itemsWithDiscount);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, [router]);

  // Apply discount to specific items based on coupon
  const applyDiscountToItems = (coupon, items) => {
    if (!coupon || !coupon.offer_product || !items) return items;
    
    return items.map(item => {
      // Check if this item is eligible for discount
      const isEligible = coupon.offer_product.includes(item.productId);
      
      // Calculate discount for this item
      let discount = 0;
      let coupondetails = [];
      if (isEligible) {
        if (coupon.offer_type === "percentage") {
          coupondetails.push(coupon);
          discount = item.price * item.quantity * (coupon.percentage / 100);
        } else if (coupon.offer_type === "fixed_price") {
          // Fixed price discount is divided among eligible items
          const eligibleItems = items.filter(i => coupon.offer_product.includes(i.productId));
          discount = coupon.fixed_price / eligibleItems.length;
            coupondetails.push(coupon);
        }
      }
      
      return {
        ...item,
        discount: parseFloat(discount.toFixed(2)),
        coupondetails :coupondetails
      };
    });
  };

  const updateQuantity = async (productId, newQuantity, original_quantity = null) => {
    try {
      if (original_quantity !== null && newQuantity > original_quantity) {
        setSuccessMessage("Requested quantity exceeds available stock.");
        setShowSuccessModal(true);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      const updatedCart = await response.json();
      
      // Preserve discounts when updating quantity
      const itemsWithDiscount = updatedCart.cart.items.map(item => {
        const existingItem = cartData.items.find(i => i.productId === item.productId);
        return {
          ...item,
          discount: existingItem ? existingItem.discount : 0
        };
      });
      
      setCartData({
        ...updatedCart.cart,
        items: itemsWithDiscount
      });
      
      updateCartCount(updatedCart.cart.totalItems);
      
      // Reapply coupon if exists
      if (appliedCoupon) {
        const itemsWithUpdatedDiscount = applyDiscountToItems(appliedCoupon, itemsWithDiscount);
        setCartData(prev => ({
          ...prev,
          items: itemsWithUpdatedDiscount
        }));
      }
      
      setSuccessMessage("Quantity updated successfully");
      setShowSuccessModal(true);
    
    } catch (err) {
      console.error('Update quantity error:', err);
      setError(err.message);
    }
  };

  const confirmRemoveItem = (productId) => {
    setProductToDelete(productId);
    setShowConfirmModal(true);
  };

  const removeItem = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: productToDelete })
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      const updatedCart = await response.json();
      
      // Preserve discounts for remaining items
      const itemsWithDiscount = updatedCart.cart.items.map(item => {
        const existingItem = cartData.items.find(i => i.productId === item.productId);
        return {
          ...item,
          discount: existingItem ? existingItem.discount : 0
        };
      });
      
      setCartData({
        ...updatedCart.cart,
        items: itemsWithDiscount
      });
      
      updateCartCount(updatedCart.cart.totalItems);
      
      // Remove coupon if it was product-specific and the product is removed
      if (appliedCoupon && appliedCoupon.offer_product && appliedCoupon.offer_product.includes(productToDelete)) {
        setAppliedCoupon(null);
        localStorage.removeItem('appliedCoupon');
        
        // Remove discounts from all items
        setCartData(prev => ({
          ...prev,
          items: prev.items.map(item => ({
            ...item,
            discount: 0
          }))
        }));
      }
      
      setSuccessMessage("Item removed from cart");
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Remove item error:', err);
      setError(err.message);
    } finally {
      setShowConfirmModal(false);
      setProductToDelete(null);
    }
  };
const validateCoupon = async () => {
  if (!couponCode.trim()) {
    setCouponError("Please enter a coupon code");
    return;
  }

  setIsValidatingCoupon(true);
  setCouponError("");

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        couponCode,
        cartItems: cartData.items,
        userId: localStorage.getItem('userId')
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid coupon code');
    }

    // Apply discount to eligible items
    const itemsWithDiscount = applyDiscountToItems(data.coupon, cartData.items);
    
    // Update state
    setAppliedCoupon(data.coupon);
    localStorage.setItem('appliedCoupon', JSON.stringify(data.coupon));
    setCartData(prev => ({
      ...prev,
      items: itemsWithDiscount
    }));
    
    setCouponCode("");
    setShowCouponModal(false);
    setSuccessMessage("Coupon applied successfully!");
    setShowSuccessModal(true);
  } catch (err) {
    setCouponError(err.message);
    // Auto-close the modal after 2 seconds only for "not found" errors
    if (err.message.includes("not found") || err.message.includes("Invalid")) {
      setTimeout(() => {
        setShowCouponModal(false);
        setCouponError(""); // Clear error after closing
      }, 2000);
    }
  } finally {
    setIsValidatingCoupon(false);
  }
};
  // const validateCoupon = async () => {
  //   if (!couponCode.trim()) {
  //     setCouponError("Please enter a coupon code");
  //     return;
  //   }

  //   setIsValidatingCoupon(true);
  //   setCouponError("");

  //   try {
  //     const token = localStorage.getItem('token');
  //     const response = await fetch('/api/coupons/validate', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //       body: JSON.stringify({ 
  //         couponCode,
  //         cartItems: cartData.items,
  //         userId: localStorage.getItem('userId')
  //       })
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.message || 'Failed to validate coupon');
  //     }

  //     // Apply discount to eligible items
  //     const itemsWithDiscount = applyDiscountToItems(data.coupon, cartData.items);
      
  //     // Update state
  //     setAppliedCoupon(data.coupon);
  //     localStorage.setItem('appliedCoupon', JSON.stringify(data.coupon));
  //     setCartData(prev => ({
  //       ...prev,
  //       items: itemsWithDiscount
  //     }));
      
  //     setCouponCode("");
  //     setShowCouponModal(false);
  //     setSuccessMessage("Coupon applied successfully!");
  //     setShowSuccessModal(true);
  //   } catch (err) {
  //     setCouponError(err.message);
  //   } finally {
  //     setIsValidatingCoupon(false);
  //   }
  // };

  const removeCoupon = () => {
    // Remove discounts from all items
    setCartData(prev => ({
      ...prev,
      items: prev.items.map(item => ({
        ...item,
        discount: 0
      }))
    }));
    
    setAppliedCoupon(null);
    localStorage.removeItem('appliedCoupon');
    setSuccessMessage("Coupon removed successfully");
    setShowSuccessModal(true);
  };

  const calculateSubtotal = () => {
    if (!cartData) return 0;
    
    return cartData.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity) + (item.warranty || 0) + (item.extendedWarranty || 0);
    }, 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon || !cartData) return 0;
    
    return cartData.items.reduce((sum, item) => sum + (item.discount || 0), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const proceedToCheckout = () => {

  if (!cartData) return;

  // Calculate totals

  const subtotal = calculateSubtotal();

  const discount = calculateDiscount();

  const total = calculateTotal();

  // Save cart and coupon data to localStorage for checkout page

  localStorage.setItem('checkoutData', JSON.stringify({

    cart: {

      ...cartData,

      items: cartData.items.map(item => ({

        ...item,

        // Ensure all relevant fields are included

        productId: item.productId,

        name: item.name,

        price: item.price,

        quantity: item.quantity,

        warranty: item.warranty || 0,

        extendedWarranty: item.extendedWarranty || 0,

        discount: item.discount || 0,

        image: item.image

      }))

    },

    coupon: appliedCoupon,

    discount,

    subtotal,

    total

  }));

  router.push('/checkout');

};
 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-blue-50 rounded-lg max-w-md mx-4">
          <p className="text-blue-500 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet</p>
          <button 
            onClick={() => router.push('/index')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Modals */}
      <ConfirmModal
        show={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setProductToDelete(null);
        }}
        onConfirm={removeItem}
      />
      <SuccessModal
        show={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
     <CouponModal
  show={showCouponModal}
  onClose={() => {
    setShowCouponModal(false);
    setCouponError(""); // Clear error when closing manually
  }}
  coupon={couponCode}
  onApply={validateCoupon}
  onChange={(e) => setCouponCode(e.target.value)}
  couponError={couponError}
  isValidating={isValidatingCoupon}
/>

      {/* Header */}
      <div className="bg-blue-50 py-4 px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          Cart ({cartData.totalItems} items)
        </h2>
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-gray-600">🏠 Home</span>
          <span className="text-gray-500">›</span>
          <span className="text-blue-500 font-semibold">Product Cart</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
        {/* Cart Table - Mobile optimized */}
        <div className="w-full lg:w-2/3 bg-white p-4 sm:p-6 rounded-lg border">
          <div className="hidden sm:block overflow-x-auto">
           <table className="min-w-full border">
  <thead className="bg-gray-50">
    <tr>
      <th className="py-3 px-4 text-center">Delete</th>
      <th className="py-3 px-4">Product</th>
      <th className="py-3 px-4 text-center">Price</th>
      <th className="py-3 px-4 text-center">Quantity</th>
      <th className="py-3 px-4 text-center">Subtotal</th>
    </tr>
  </thead>
  <tbody>
    {cartData.items.map((item) => (
      <Fragment key={item.productId}>

        {/* Product Row */}
        <tr className="border-b">
          <td className="py-4 px-4 text-center">
            <button
              className="text-blue-500 hover:text-blue-600 font-medium"
              onClick={() => confirmRemoveItem(item.productId)}
            >
              ✖
            </button>
          </td>
          <td className="flex items-center py-4 px-4 gap-3">
            <Image
              src={`/uploads/products/${item.image}`}
              alt="No image"
              width={60}
              height={60}
              className="rounded-md"
            />
            <div className="relative group w-fit">
              <Link href={`/product/${slugify(item.name)}`}>
                <p className="font-semibold hover:text-blue-500 transition-colors duration-300">
                  {item.name.length > 50 ? item.name.slice(0, 50) + "..." : item.name}
                </p>
              </Link>
              <div className="absolute z-10 hidden group-hover:block bg-black text-white text-sm px-2 py-1 rounded shadow-md top-full mt-1 max-w-xs w-max whitespace-normal">
                {item.name}
              </div>
            </div>
          </td>
          <td className="py-4 px-4 text-center">₹{item.price.toFixed(2)}</td>
          <td className="py-4 px-4 text-center">
            <div className="flex justify-center items-center gap-2">
              <button
                className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => updateQuantity(item.productId, item.quantity - 1, null)}
                disabled={item.quantity <= 1}
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                disabled={item.quantity >= item.original_quantity}
                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.original_quantity)}
              >
                +
              </button>
            </div>
          </td>
          <td className="py-4 px-4 text-center font-semibold">
            ₹{(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>

        {/* Breakdown Row */}
        <tr className="bg-gray-50">
          <td colSpan={4} className="py-3 px-4 text-right text-sm font-medium text-gray-500">
            Product Subtotal<br />
            Warranty<br />
            Extended Warranty<br />
            Discount
          </td>
          <td className="py-3 px-4 text-center text-sm font-semibold">
            ₹{(item.price * item.quantity).toFixed(2)}<br />
            {item.warranty > 0 ? `₹${item.warranty.toFixed(2)}` : "-"}<br />
            {item.extendedWarranty > 0 ? `₹${item.extendedWarranty.toFixed(2)}` : "-"}<br />
            {item.discount > 0 ? `-₹${item.discount.toFixed(2)}` : "-"}
          </td>
        </tr>

        {/* Total Row */}
        <tr className="border-t bg-gray-100">
          <td colSpan={4} className="py-3 px-4 text-right font-bold">Item Total</td>
          <td className="py-3 px-4 text-center font-bold">
            ₹{(
              (item.price * item.quantity) +
              (item.warranty || 0) +
              (item.extendedWarranty || 0) -
              (item.discount || 0)
            ).toFixed(2)}
          </td>
        </tr>

      </Fragment>
    ))}
  </tbody>
</table>

          </div>

          {/* Mobile view - list layout */}
          <div className="sm:hidden space-y-6">
            {cartData.items.map((item) => (
              <div key={item.productId} className="border rounded-lg p-4 space-y-3">
                {/* Top Section: Image, Name, Remove */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <Image
                      src={`/uploads/products/${item.image}`}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="rounded-md"
                    />
                    <div>
                      <Link href={`/product/${item.name}`}>
                        <p className="font-semibold hover:text-blue-500 transition-colors duration-300">
                          {item.name}
                        </p>
                      </Link>
                      <p className="text-gray-600 text-sm mt-1">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    className="text-blue-500 hover:text-blue-600"
                    onClick={() => confirmRemoveItem(item.productId)}
                  >
                    ✖
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, null)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.original_quantity)}
                      disabled={item.quantity >= item.original_quantity}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    {item.discount > 0 && (
                      <p className="text-green-600 text-sm">
                        Discount: -₹{item.discount.toFixed(2)}
                      </p>
                    )}
                    <p className="font-semibold">
                      ₹{(
                        (item.price * item.quantity) - 
                        (item.discount || 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Warranty Info */}
                <div className="text-sm text-gray-600 space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span>Warranty</span>
                    <span className="font-medium text-black">
                      {item.warranty > 0 ? `₹${item.warranty.toFixed(2)}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extended Warranty</span>
                    <span className="font-medium text-black">
                      {item.extendedWarranty > 0
                        ? `₹${item.extendedWarranty.toFixed(2)}`
                        : "-"}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between border-t pt-2 mt-2 font-semibold text-black">
                  <span>Total</span>
                  <span>
                    ₹
                    {(
                      (item.price * item.quantity) +
                      (item.warranty || 0) +
                      (item.extendedWarranty || 0) -
                      (item.discount || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6 flex-wrap gap-2">
            <button
              className="text-gray-500 hover:underline"
              onClick={() => router.push("/index")}
            >
              ← Continue Shopping
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900">Cart Totals</h3>
          
          {/* Coupon Section */}
          <div className="mt-4">
            {appliedCoupon ? (
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-700">
                    Coupon: {appliedCoupon.offer_code}
                  </span>
                  <button 
                    onClick={removeCoupon}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✖
                  </button>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {appliedCoupon.offer_type === "percentage" 
                    ? `${appliedCoupon.percentage}% off` 
                    : `₹${appliedCoupon.fixed_price} off`}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowCouponModal(true)}
                className="w-full py-2 text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-50 mb-4"
              >
                Apply Coupon
              </button>
            )}
            {couponError && (
              <p className="text-red-500 text-sm mb-2">{couponError}</p>
            )}
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">
                ₹{calculateSubtotal().toFixed(2)}
              </span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span className="font-semibold text-green-600">
                  -₹{calculateDiscount().toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Estimated Delivery</span>
              <span className="font-semibold text-gray-900">Free</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Taxes</span>
              <span className="font-semibold text-gray-900">₹0.00</span>
            </div>
          </div>
        
          {/* Total price section */}
          <div className="bg-gray-100 p-4 mt-4 rounded-lg flex justify-between text-gray-900 font-bold">
            <span>Total</span>
            <span>
              ₹{calculateTotal().toFixed(2)}
            </span>
          </div>
        
          <button
            className="mt-4 bg-blue-500 text-white w-full py-3 rounded-md hover:bg-blue-600 transition-all"
            onClick={proceedToCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}