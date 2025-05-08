"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from '@/context/CartContext';
import Link from "next/link";
const features = [
  { icon: "🚗", title: "Free Shipping", description: "Free shipping all over the US" },
  { icon: "🔒", title: "100% Satisfaction", description: "Guaranteed satisfaction with every order" },
  { icon: "💼", title: "Secure Payments", description: "We ensure secure transactions" },
  { icon: "💬", title: "24/7 Support", description: "We're here to help anytime" },
];

// Confirm Modal Component
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
          className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
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
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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

// Success Modal Component
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
          className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
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

export default function CartComponent() {
    const router = useRouter();
    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { cartCount, updateCartCount } = useCart();
    
    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    // router.push('/login');
                    return;
                }

                const response = await fetch('/api/cart', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    method : "GET"
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch cart data');
                }

                const data = await response.json();
                console.log(data);
                // alert("dfg");
                setCartData(data.cart);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCartData();
    }, [router]);

    const updateQuantity = async (productId, newQuantity) => {
        try {
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
            setCartData(updatedCart.cart);
            updateCartCount(updatedCart.cart.totalItems);
            
            // Show success message
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
            setCartData(updatedCart.cart);
            updateCartCount(updatedCart.cart.totalItems);
            
            // Show success message
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
                <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
                    <p className="text-red-500 font-medium">{error}</p>
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
                <div className="text-center max-w-md">
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
            {/* Confirmation Modal */}
            <ConfirmModal 
                show={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setProductToDelete(null);
                }}
                onConfirm={removeItem}
            />
            
            {/* Success Modal */}
            <SuccessModal 
                show={showSuccessModal}
                message={successMessage}
                onClose={() => setShowSuccessModal(false)}
            />

            {/* 🟠 Cart Header Bar */}
            <div className="bg-blue-50 py-6 px-8 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Cart ({cartData.totalItems} items)</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-gray-600">🏠 Home</span>
                    <span className="text-gray-500">›</span>
                    <span className="text-orange-500 font-semibold">Product Cart</span>
                </div>
            </div>

            {/* 🛒 Main Cart Layout */}
            <div className="max-w-9xl mx-auto flex flex-col md:flex-row gap-6 p-6">
                {/* 📦 Shopping Cart - Left Side */}
                <div className="w-full md:w-2/3 bg-white p-6 rounded-lg border overflow-x-auto">
                    <table className="w-full mt-4">
                        <thead>
                            <tr className="text-left border-b bg-gray-50">
                                <th className="py-3 px-4 text-center">Delete</th>
                                <th className="py-3 px-4">Product </th>
                                <th className="py-3 px-4 text-center">Price</th>
                                <th className="py-3 px-4 text-center">Quantity</th>
                                <th className="py-3 px-4 text-center">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartData.items.map((item) => (
                                <tr key={item.productId} className="border-b hover:bg-gray-50">
                                    <td className="py-4 text-center">
                                        <button 
                                            className="text-red-500 hover:text-red-600 font-medium" 
                                            onClick={() => confirmRemoveItem(item.productId)}
                                        >
                                            ✖
                                        </button>
                                    </td>
                                    <td className="flex items-center py-4 px-4 space-x-4">
                                        <Image 
                                            src={`/uploads/products/${item.image}`} 
                                            alt={item.name} 
                                            width={60} 
                                            height={60} 
                                            className="rounded-md"
                                        />
                                        <div>
                                        <Link href={`/product/${item.name}`}>
            <p className="font-semibold hover:text-orange-500 transition-colors duration-300 cursor-pointer">
                {item.name}
            </p>
        </Link>
                                            {/* <div className="mt-1 space-x-2">
                                                <span className="bg-gray-200 text-xs px-2 py-1 rounded">SKU: {item.productId}</span>
                                            </div> */}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">₹{item.price.toFixed(2)}</td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button 
                                                className="px-3 py-1 border rounded-l bg-gray-200 hover:bg-gray-300" 
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                −
                                            </button>
                                            <span className="px-4">{item.quantity}</span>
                                            <button 
                                                className="px-3 py-1 border rounded-r bg-gray-200 hover:bg-gray-300" 
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end items-center mt-6 space-x-4">
                        {/* <div className="flex space-x-2">
                            <input type="text" placeholder="Coupon Code" className="border p-2 rounded"/>
                            <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition">Apply Coupon</button>
                        </div> */}
                        <button 
                            className="text-gray-500 hover:underline"
                            onClick={() => router.push('/index')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>

                {/* 📦 Cart Summary - Right Side */}
                <div className="w-full md:w-1/3 bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-900">Cart Totals</h3>

                    {/* Cart details section */}
                    <div className="bg-gray-100 p-4 mt-4 rounded-lg space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-semibold text-gray-900">₹{cartData.totalPrice.toFixed(2)}</span>
                        </div>
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
                        <span>₹{cartData.totalPrice.toFixed(2)}</span>
                    </div>

                    {/* Checkout button */}
                    <button 
                        className="mt-4 bg-orange-500 text-white w-full py-3 rounded-md hover:bg-orange-600 transition-all"
                        onClick={() => router.push('/checkout')}
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}