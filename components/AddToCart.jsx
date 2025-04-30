"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import {AuthModal} from '@/components/AuthModal';
const AddToCartButton = ({ productId, quantity = 1 }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState('');
  const [cartSuccess, setCartSuccess] = useState(false);
  const { cartCount, updateCartCount } = useCart();
  const handleAddToCart = async () => {
    setIsLoading(true);
    setAuthError('');
    setCartSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
    
      // Check authentication
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      const data = await response.json();
      
      if (!data.loggedIn) {
        setShowAuthModal(true);
        return;
      }

      // Add to cart API call
      const cartResponse = await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!cartResponse.ok) {
        throw new Error('Failed to add to cart');
      }
      const responseData = await cartResponse.json();
      updateCartCount(responseData.cart.totalItems);

      setCartSuccess(true);
      console.log('Added to cart successfully');
    } catch (error) {
      console.error('Add to cart error:', error);
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
  onClick={handleAddToCart}
  disabled={isLoading}
  className={`w-full sm:w-auto px-3 py-2 md:px-4 md:py-2.5 rounded-lg 
    text-sm md:text-base font-medium transition-all duration-200
    flex items-center justify-center gap-2
    ${
      isLoading 
        ? 'bg-gray-400 cursor-not-allowed opacity-75' 
        : cartSuccess 
          ? 'bg-green-500 text-white hover:bg-green-600'
          : 'bg-yellow-400 text-black hover:bg-yellow-500'
    }
    active:scale-95 disabled:active:scale-100`}
>
  {isLoading ? (
    <>
      <svg 
        className="animate-spin h-5 w-5" 
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="hidden sm:inline">Adding...</span>
    </>
  ) : cartSuccess ? (
    <>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      <span className="hidden sm:inline">Added to Cart</span>
      <span className="sm:hidden">Added</span>
    </>
  ) : (
    <>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
      <span className="hidden sm:inline">Add to Cart</span>
      <span className="sm:hidden">Add</span>
    </>
  )}
</button>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            handleAddToCart();
          }}
          error={authError}
        />
      )}
    </>
  );
};

// Auth Modal Component


export default AddToCartButton;